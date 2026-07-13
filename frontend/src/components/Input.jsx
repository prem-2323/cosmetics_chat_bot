import { useState, useRef, useEffect } from 'react'
import { Plus, Mic, AudioLines, ArrowUp, Loader2 } from 'lucide-react'

export default function Input({ onSend, loading, value, onChange }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  // Sync state if controlled from parent (for quick actions)
  useEffect(() => {
    if (value !== undefined) {
      setText(value)
    }
  }, [value])

  const handleTextChange = (e) => {
    const val = e.target.value
    setText(val)
    if (onChange) onChange(val)

    // Auto-adjust height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    onSend(trimmed)
    setText('')
    if (onChange) onChange('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
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
            title="Attach files"
          >
            <Plus size={20} />
          </button>

          {/* Text Input area */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            rows={1}
            style={{ height: 'auto' }}
            className="flex-1 max-h-40 min-h-[24px] resize-none bg-transparent py-1 text-sm text-white placeholder-gray-500 outline-none pr-12 focus:ring-0 leading-relaxed"
          />

          {/* Right items inside input pill */}
          <div className="absolute right-3 bottom-2.5 flex items-center gap-1">
            {text.trim() === '' ? (
              <>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#2f2f2f] text-gray-400 hover:text-white transition-colors"
                  title="Voice input"
                >
                  <Mic size={18} />
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#2f2f2f] text-gray-400 hover:text-white transition-colors"
                  title="Voice mode"
                >
                  <AudioLines size={18} className="text-gray-400 hover:text-white" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:bg-[#e5e5e5] transition-all duration-200 flex-shrink-0 shadow-md"
                title="Send message"
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
          CosmoGPT can make mistakes. Verify important skincare or medical advice.
        </div>
      </div>
    </div>
  )
}
