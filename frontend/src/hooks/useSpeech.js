import { useState, useCallback } from 'react'

export default function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [utterance, setUtterance] = useState(null)

  const speak = useCallback((text, lang = 'en-US') => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech Synthesis not supported')
      return
    }

    window.speechSynthesis.cancel()

    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = 1.0
    u.pitch = 1.0

    u.onstart = () => setIsSpeaking(true)
    u.onend = () => setIsSpeaking(false)
    u.onerror = () => setIsSpeaking(false)

    setUtterance(u)
    window.speechSynthesis.speak(u)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setUtterance(null)
  }, [])

  const toggle = useCallback((text, lang = 'en-US') => {
    if (isSpeaking) {
      stop()
    } else {
      speak(text, lang)
    }
  }, [isSpeaking, speak, stop])

  return { isSpeaking, speak, stop, toggle }
}
