import { useState, useRef, useCallback, useEffect } from 'react'

// Lazy-evaluate SpeechRecognition to avoid issues with SSR or early module load
function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export default function useVoice({ onResult, lang = 'en-US', maxRetries = 3 }) {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [error, setError] = useState(null)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef(null)
  const retryCountRef = useRef(0)
  const retryTimeoutRef = useRef(null)

  // Check support on mount (client-side only)
  useEffect(() => {
    setSupported(!!getSpeechRecognition())
  }, [])

  // Keep onResult in a mutable ref to prevent stale closures
  const onResultRef = useRef(onResult)
  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  const startListening = useCallback(async () => {
    const SR = getSpeechRecognition()
    if (!SR) {
      console.warn('[useVoice] Speech Recognition not supported in this browser')
      return
    }

    // If already running, bail out
    if (recognitionRef.current) {
      return
    }

    // Request microphone permission explicitly first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Got permission — immediately release the stream, SpeechRecognition manages its own audio
      stream.getTracks().forEach(track => track.stop())
    } catch (permErr) {
      console.error('[useVoice] Microphone permission denied:', permErr)
      setError('not-allowed')
      return
    }

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = lang

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      retryCountRef.current = 0
    }

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }
      setInterimText(interim)
      if (final && onResultRef.current) {
        onResultRef.current(final)
      }
    }

    recognition.onerror = (event) => {
      console.error('[useVoice] Speech recognition error:', event.error)
      setError(event.error)
      setIsListening(false)
      setInterimText('')
      recognitionRef.current = null

      if (event.error === 'network' && retryCountRef.current < maxRetries) {
        retryCountRef.current++
        const delay = Math.min(1000 * 2 ** retryCountRef.current, 10000)
        retryTimeoutRef.current = setTimeout(() => startListening(), delay)
      } else {
        retryCountRef.current = 0
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimText('')
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch (e) {
      console.error('[useVoice] Failed to start speech recognition:', e)
      setIsListening(false)
      recognitionRef.current = null
    }
  }, [lang, maxRetries])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null
    }
    setIsListening(false)
    setInterimText('')
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // ignore
        }
      }
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { isListening, interimText, startListening, stopListening, toggleListening, supported, error, clearError }
}
