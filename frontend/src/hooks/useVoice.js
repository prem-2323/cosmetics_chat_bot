import { useState, useRef, useCallback, useEffect } from 'react'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export default function useVoice({ onResult, lang = 'en-US', maxRetries = 3 }) {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const retryCountRef = useRef(0)
  const retryTimeoutRef = useRef(null)

  // Keep onResult in a mutable ref to prevent stale closures and avoid recreating startListening
  const onResultRef = useRef(onResult)
  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser')
      return
    }

    if (recognitionRef.current) {
      return
    }

    const recognition = new SpeechRecognition()
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
      console.error('Speech recognition error:', event.error)
      setError(event.error)
      setIsListening(false)
      setInterimText('')
      recognitionRef.current = null

      if (event.error === 'network' && retryCountRef.current < maxRetries) {
        retryCountRef.current++
        const delay = Math.min(1000 * 2 ** retryCountRef.current, 10000)
        console.log(`Retrying speech recognition in ${delay}ms (attempt ${retryCountRef.current}/${maxRetries})`)
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
      console.error('Failed to start speech recognition:', e)
      setIsListening(false)
      recognitionRef.current = null
    }
  }, [lang])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.error('Failed to stop speech recognition:', e)
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

  return { isListening, interimText, startListening, stopListening, toggleListening, supported: !!SpeechRecognition, error, clearError }
}

