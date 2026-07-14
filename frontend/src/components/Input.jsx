import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faArrowUp, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { notifySuccess } from '../hooks/toast'

export default function Input({ onSend, loading, value, onChange }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (value !== undefined) {
      setText(value)
    }
  }, [value])

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
    notifySuccess('Message queued for sending.')
  }

  return (
    <div className="w-full bg-gradient-to-t from-dark-bg via-dark-bg/95 to-transparent pt-4 pb-6 px-4 animate-fade-in-up">
      <div className="mx-auto max-w-3xl">
        <div className="relative flex items-center bg-[#212121] rounded-3xl border border-dark-border px-4 py-2.5 shadow-2xl focus-within:border-gray-500 transition-all duration-200">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#2f2f2f] text-gray-400 hover:text-white transition-colors mr-2 flex-shrink-0"
            title={t('chat.attachFiles')}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            placeholder={t('chat.placeholder')}
            rows={1}
            style={{ height: 'auto' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            className="flex-1 max-h-40 min-h-[28px] resize-none bg-transparent py-1 text-sm text-white placeholder-gray-500 outline-none pr-24 focus:ring-0 leading-relaxed"
          />

          <div className="absolute right-3 bottom-2.5 flex items-center gap-1.5">
            {text.trim() !== '' && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:bg-[#e5e5e5] transition-all duration-200 flex-shrink-0 shadow-md"
                title={t('chat.send')}
              >
                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faArrowUp} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

