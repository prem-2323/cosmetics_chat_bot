import { useState, useRef, useEffect } from 'react'
import { Plus, Mic, AudioLines, ArrowUp, Loader2, StopCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useVoice from '../hooks/useVoice'

export default function Input({ onSend, loading, value, onChange }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)
  const { t, i18n } = useTranslation()

  const voiceLangMap = { en: 'en-US', fr: 'fr-FR', es: 'es-ES', de: 'de-DE', hi: 'hi-IN', zh: 'zh-CN', ja: 'ja-JP' }
  const currentVoiceLang = voiceLangMap[i18n.language] || 'en-US'

  const { isListening, interimText, toggleListening, supported } = useVoice({
    onResult: (finalText) => {
      setText((prev) => {
        const trimmed = prev.trim()
        const nextVal = trimmed ? (prev + (/\s$/.test(prev) ? '' : ' ') + finalText) : finalText
        if (onChange) onChange(nextVal)
        return nextVal
      })
    },
    lang: currentVoiceLang,
  })

  // Sync state if controlled from parent (for quick actions)
  useEffect(() => {
    if (value !== undefined) {
      setText(value)
    }
  }, [value])

  // Auto-adjust height when text changes (e.g. typing or voice input)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }, [text])

  const handleTextChange = (e) => {
    const val = e.target.value
    setText(val)
    if (onChange) onChange(val)
  }

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    onSend(trimmed)
    setText('')
    if (onChange) onChange('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full bg-gradient-to-t from-dark-bg via-dark-bg/95 to-transparent pt-4 pb-6 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="relative flex items-center bg-[#212121] rounded-3xl border border-dark-border px-4 py-2.5 shadow-2xl focus-within:border-gray-500 transition-all duration-200">
          
          {/* Plus / Attachment Button */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#2f2f2f] text-gray-400 hover:text-white transition-colors mr-2 flex-shrink-0"
            title={t('chat.attachFiles')}
          >
            <Plus size={20} />
          </button>

          {/* Text Input area (pr-20 leaves room for up to 2 buttons on the right) */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            rows={1}
            style={{ height: 'auto' }}
            className="flex-1 max-h-40 min-h-[24px] resize-none bg-transparent py-1 text-sm text-white placeholder-gray-500 outline-none pr-20 focus:ring-0 leading-relaxed"
          />

          {/* Interim voice preview */}
          {isListening && interimText && (
            <div className="absolute left-16 right-16 bottom-3 text-sm text-purple-400/70 truncate pointer-events-none">
              {interimText}
            </div>
          )}

          {/* Right items inside input pill */}
          <div className="absolute right-3 bottom-2.5 flex items-center gap-1.5">
            {/* Voice Input Button */}
            {supported && (
              isListening ? (
                <button
                  type="button"
                  onClick={toggleListening}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200 animate-pulse"
                  title="Stop recording"
                >
                  <StopCircle size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toggleListening}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#2f2f2f] text-gray-400 hover:text-white transition-colors"
                  title={t('chat.voiceInput')}
                >
                  <Mic size={18} />
                </button>
              )
            )}

            {/* AudioLines Button (only when text is empty and not listening) */}
            {text.trim() === '' && !isListening && (
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#2f2f2f] text-gray-400 hover:text-white transition-colors"
                title={t('chat.voiceMode')}
              >
                <AudioLines size={18} className="text-gray-400 hover:text-white" />
              </button>
            )}

            {/* Send Button (when text is not empty or when loading) */}
            {(text.trim() !== '' || loading) && !isListening && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:bg-[#e5e5e5] transition-all duration-200 flex-shrink-0 shadow-md"
                title={t('chat.send')}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin text-black" />
                ) : (
                  <ArrowUp size={18} strokeWidth={2.5} />
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Footer Disclaimer */}
        <div className="mt-2 text-center text-[11px] text-gray-600">
          {t('footer.disclaimer')}
        </div>
      </div>
    </div>
  )
}

