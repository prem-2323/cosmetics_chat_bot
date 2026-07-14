import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeHigh, faVolumeXmark } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import SourceCard from './SourceCard'
import TypingAnimation from './TypingAnimation'
import useSpeech from '../hooks/useSpeech'

// Simple robust markdown parser for bold, inline code, and lists
function parseMarkdown(text) {
  if (!text) return ''
  
  // Escape HTML to prevent XSS
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Bold text: **word**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Inline code: `code`
  html = html.replace(/`(.*?)`/g, '<code class="bg-dark-card/60 px-1.5 py-0.5 rounded text-gray-200 font-mono text-[12px] border border-white/5">$1</code>')

  // Split by line to process bullet points and lists
  const lines = html.split('\n')
  let inList = false
  const formattedLines = lines.map((line) => {
    const listMatch = line.match(/^[-*]\s+(.*)/)
    if (listMatch) {
      if (!inList) {
        inList = true
        return `<ul class="list-disc pl-5 space-y-1.5 my-2 text-sm text-gray-300"><li>${listMatch[1]}</li>`
      }
      return `<li>${listMatch[1]}</li>`
    } else {
      if (inList) {
        inList = false
        return `</ul><p class="my-1.5 leading-relaxed text-sm text-gray-300">${line}</p>`
      }
      return line.trim() === '' ? '<div class="h-2"></div>' : `<p class="my-1.5 leading-relaxed text-sm text-gray-300">${line}</p>`
    }
  })

  if (inList) {
    formattedLines.push('</ul>')
  }

  return formattedLines.join('\n')
}

export default function Message({ role, content, sources, isTyping, user }) {
  const { t, i18n } = useTranslation()
  const { isSpeaking, toggle } = useSpeech()

  const speechLangMap = { en: 'en-US', fr: 'fr-FR', es: 'es-ES', de: 'de-DE', hi: 'hi-IN', zh: 'zh-CN', ja: 'ja-JP' }
  const currentSpeechLang = speechLangMap[i18n.language] || 'en-US'

  if (isTyping) {
    return (
      <div className="py-6 border-b border-dark-border/10">
        <div className="mx-auto max-w-3xl flex items-start gap-4 w-full px-4">
          {/* CosmoGPT Logo - Emerald Green */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md flex-shrink-0 animate-pulse-slow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4.5 h-4.5 text-white">
              <circle cx="12" cy="12" r="6" />
              <path d="M3.5 12c0-2 4.25-4 8.5-4s8.5 2 8.5 4-4.25 4-8.5 4-8.5-2-8.5-4z" />
            </svg>
          </div>
          <div className="flex-1 mt-1">
            <TypingAnimation />
          </div>
        </div>
      </div>
    )
  }

  const isUser = role === 'user'

  // User message bubble (ChatGPT-style right aligned grey pill)
  if (isUser) {
    return (
      <div className="py-4 animate-slide-in">
        <div className="mx-auto max-w-3xl flex justify-end w-full px-4">
          <div className="bg-dark-card text-white rounded-[24px] rounded-br-lg px-5 py-2.5 max-w-[70%] text-sm shadow-sm leading-relaxed border border-dark-border/40">
            {content}
          </div>
        </div>
      </div>
    )
  }

  // Assistant message bubble
  return (
    <div className="py-6 border-b border-dark-border/10 animate-fade-in-up">
      <div className="mx-auto max-w-3xl flex items-start gap-4 w-full px-4">
        
        {/* CosmoGPT Logo - Emerald Green */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4.5 h-4.5 text-white">
            <circle cx="12" cy="12" r="6" />
            <path d="M3.5 12c0-2 4.25-4 8.5-4s8.5 2 8.5 4-4.25 4-8.5 4-8.5-2-8.5-4z" />
          </svg>
        </div>

        {/* Message body */}
        <div className="flex-1 space-y-3 overflow-hidden">
          <div className="prose prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
              className="text-gray-200 leading-relaxed text-sm"
            />
            <button
              onClick={() => toggle(content, currentSpeechLang)}
              className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              title={isSpeaking ? t('chat.stopReading') : t('chat.readAloud')}
            >
              {isSpeaking ? <FontAwesomeIcon icon={faVolumeXmark} /> : <FontAwesomeIcon icon={faVolumeHigh} />}
              <span className="text-[11px] font-medium">{isSpeaking ? t('chat.stopReading') : t('chat.readAloud')}</span>
            </button>
          </div>

          {/* Sources */}
          {sources && sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-dark-border/40 space-y-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none">
                Sources & References
              </span>
              <div className="flex flex-wrap gap-2">
                {sources.map((source, i) => (
                  <SourceCard key={i} title={source} />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

