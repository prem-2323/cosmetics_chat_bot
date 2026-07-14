import { useCallback, useEffect, useRef, useState } from 'react'

export type SpeechRecognitionErrorCode =
  | 'not-supported'
  | 'permission-denied'
  | 'microphone-unavailable'
  | 'no-speech'
  | 'network'
  | 'aborted'
  | 'service-not-allowed'
  | 'unknown'

export interface UseSpeechRecognitionOptions {
  lang?: string
  /** Max auto-retries for transient errors (network, no-speech). Default: 3 */
  maxRetries?: number
}

export interface UseSpeechRecognitionResult {
  supported: boolean
  isListening: boolean
  transcript: string
  error: string | null
  startListening: () => Promise<void>
  stopListening: () => void
  resetTranscript: () => void
}

function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') return null
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  )
}

function mapErrorCode(error: string | null | undefined): SpeechRecognitionErrorCode {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'permission-denied'
    case 'no-speech':
      return 'no-speech'
    case 'audio-capture':
      return 'microphone-unavailable'
    case 'network':
      return 'network'
    case 'aborted':
      return 'aborted'
    default:
      return 'unknown'
  }
}

function errorMessage(code: SpeechRecognitionErrorCode) {
  switch (code) {
    case 'not-supported':
      return 'This browser does not support speech recognition.'
    case 'permission-denied':
      return 'Microphone permission was denied.'
    case 'microphone-unavailable':
      return 'Microphone is unavailable or in use by another app.'
    case 'no-speech':
      return 'No speech was detected. Please try again.'
    case 'network':
      return 'Speech recognition network error occurred.'
    case 'aborted':
      return 'Speech recognition was aborted.'
    case 'service-not-allowed':
      return 'Speech recognition service is not allowed.'
    default:
      return 'An unknown speech recognition error occurred.'
  }
}

// Errors that are transient and safe to silently auto-retry
const TRANSIENT_ERRORS = new Set<SpeechRecognitionErrorCode>(['network', 'no-speech'])

export default function useSpeechRecognition({ lang = 'en-US', maxRetries = 3 }: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef('')
  const pendingStartRef = useRef(false)
  const retryCountRef = useRef(0)
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track whether user explicitly asked to stop (vs. auto-end from error)
  const userStoppedRef = useRef(false)

  useEffect(() => {
    const hasSpeechRecognition = Boolean(getSpeechRecognitionConstructor())
    const hasUserMedia = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
    setSupported(hasSpeechRecognition && hasUserMedia)
  }, [])

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = ''
    setTranscript('')
    setError(null)
  }, [])

  const stopListening = useCallback(() => {
    userStoppedRef.current = true
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // ignore stop errors
      }
      recognitionRef.current = null
    }
    pendingStartRef.current = false
    retryCountRef.current = 0
    setIsListening(false)
  }, [])

  const startListening = useCallback(async () => {
    const SpeechRecognition = getSpeechRecognitionConstructor()
    if (!SpeechRecognition) {
      setError(errorMessage('not-supported'))
      setSupported(false)
      return
    }

    if (recognitionRef.current || pendingStartRef.current) {
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(errorMessage('microphone-unavailable'))
      return
    }

    try {
      pendingStartRef.current = true
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
    } catch (err: any) {
      pendingStartRef.current = false
      const code = mapErrorCode(err?.name || err?.message)
      setError(errorMessage(code === 'unknown' ? 'permission-denied' : code))
      return
    }

    // Reset user-stopped flag when a fresh listening session starts
    userStoppedRef.current = false
    retryCountRef.current = 0

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = lang
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      pendingStartRef.current = false
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Got a result, so reset retry counter (connection is working)
      retryCountRef.current = 0

      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        const transcriptText = result[0]?.transcript || ''

        if (result.isFinal) {
          finalTranscript += transcriptText
        } else {
          interimTranscript += transcriptText
        }
      }

      if (finalTranscript.trim()) {
        if (finalTranscriptRef.current && !finalTranscriptRef.current.endsWith(' ')) {
          finalTranscriptRef.current += ' '
        }
        finalTranscriptRef.current += finalTranscript.trim()
      }

      const nextTranscript = `${finalTranscriptRef.current}${interimTranscript}`.trim()
      setTranscript(nextTranscript)
    }

    recognition.onnomatch = () => {
      // Silently ignore — just means no match on that audio segment
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const code = mapErrorCode(event.error)
      recognitionRef.current = null
      pendingStartRef.current = false

      // For transient errors (network, no-speech), auto-retry silently
      if (TRANSIENT_ERRORS.has(code) && !userStoppedRef.current && retryCountRef.current < maxRetries) {
        retryCountRef.current++
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 8000)
        // Keep isListening true so the UI stays in "recording" mode
        retryTimeoutRef.current = setTimeout(() => {
          retryTimeoutRef.current = null
          // Re-create and start a new recognition instance
          const retryRecognition = new SpeechRecognition()
          retryRecognition.continuous = true
          retryRecognition.interimResults = true
          retryRecognition.lang = lang
          retryRecognition.maxAlternatives = 1
          retryRecognition.onstart = recognition.onstart
          retryRecognition.onresult = recognition.onresult
          retryRecognition.onnomatch = recognition.onnomatch
          retryRecognition.onerror = recognition.onerror
          retryRecognition.onend = recognition.onend
          recognitionRef.current = retryRecognition
          try {
            retryRecognition.start()
          } catch {
            setError(errorMessage('unknown'))
            setIsListening(false)
            recognitionRef.current = null
          }
        }, delay)
        return
      }

      // For non-transient errors or exhausted retries, surface the error
      setError(errorMessage(code))
      setIsListening(false)
      retryCountRef.current = 0
    }

    recognition.onend = () => {
      // Only finalize if there is no pending retry and user didn't explicitly stop
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null
      }
      // If a retry is scheduled, don't update state — let the retry handle it
      if (retryTimeoutRef.current) {
        return
      }
      pendingStartRef.current = false
      setIsListening(false)
      if (finalTranscriptRef.current.trim()) {
        setTranscript(finalTranscriptRef.current.trim())
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (err) {
      setError(errorMessage('unknown'))
      recognitionRef.current = null
      pendingStartRef.current = false
    }
  }, [lang, maxRetries])

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // ignore
        }
      }
    }
  }, [])

  return {
    supported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}
