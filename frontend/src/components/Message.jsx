import { Sparkles } from 'lucide-react'
import SourceCard from './SourceCard'
import TypingAnimation from './TypingAnimation'

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
  html = html.replace(/`(.*?)`/g, '<code class="bg-[#2f2f2f] px-1.5 py-0.5 rounded text-purple-400 font-mono text-xs">$1</code>')

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

export default function Message({ role, content, sources, isTyping }) {
  if (isTyping) {
    return (
      <div className="flex items-start gap-4 py-4 max-w-3xl mx-auto w-full">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-md flex-shrink-0 animate-spin">
          <Sparkles size={16} />
        </div>
        <div className="flex-1 mt-1">
          <TypingAnimation />
        </div>
      </div>
    )
  }

  const isUser = role === 'user'

  return (
    <div className={`py-6 border-b border-dark-border/20 ${isUser ? 'bg-transparent' : 'bg-transparent'}`}>
      <div className={`mx-auto max-w-3xl flex items-start gap-4 w-full px-4 ${isUser ? 'flex-row-reverse' : ''}`}>
        
        {/* Avatar */}
        {!isUser ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md flex-shrink-0">
            <Sparkles size={16} />
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-700 text-white font-bold text-xs shadow-sm flex-shrink-0">
            MU
          </div>
        )}

        {/* Message body */}
        <div className="flex-1 space-y-3 overflow-hidden">
          {isUser ? (
            <div className="flex justify-end">
              <div className="bg-[#2f2f2f] text-white rounded-2xl px-4 py-2.5 max-w-[85%] text-sm shadow-md leading-relaxed">
                {content}
              </div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
                className="text-gray-200 leading-relaxed text-sm"
              />
            </div>
          )}

          {/* Sources */}
          {!isUser && sources && sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-dark-border/40 space-y-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
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
