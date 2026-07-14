import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWandMagicSparkles, faShieldHalved, faHeart } from '@fortawesome/free-solid-svg-icons'
import Message from './Message'
import Input from './Input'

export default function ChatBox({ messages = [], loading = false, onSend, user }) {
  const { t } = useTranslation()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const quickActions = [
    { text: t('chat.quickAction1'), icon: faWandMagicSparkles, color: 'text-purple-400' },
    { text: t('chat.quickAction2'), icon: faShieldHalved, color: 'text-emerald-400' },
    { text: t('chat.quickAction3'), icon: faHeart, color: 'text-pink-400' },
  ]

  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-dark-bg select-none">
      {/* Scrollable conversation history */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl w-full min-h-full flex flex-col justify-end">
          {!hasMessages ? (
            /* Welcome Area centered inside viewport */
            <div className="flex-1 flex flex-col justify-center items-center space-y-8 animate-fade-in-up my-auto py-12">
              {/* CosmoGPT Logo - Orbital Planet */}
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-2xl">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-8 h-8 text-white animate-pulse-slow">
                  <circle cx="12" cy="12" r="6" />
                  <path d="M3.5 12c0-2 4.25-4 8.5-4s8.5 2 8.5 4-4.25 4-8.5 4-8.5-2-8.5-4z" />
                </svg>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white select-none text-center">
                {t('chat.welcome')}
              </h1>

              {/* Suggestions Grid Widget */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-3xl mt-8">
                {quickActions.map((action, idx) => {
                  return (
                    <button
                      key={idx}
                      onClick={() => onSend(action.text)}
                      className="flex flex-col gap-2 items-start p-5 rounded-2xl border border-dark-border bg-[#2f2f2f]/30 hover:bg-[#2f2f2f]/80 hover:border-gray-500 text-left transition-all duration-200 group hover:-translate-y-0.5"
                    >
                      <FontAwesomeIcon icon={action.icon} className={`${action.color} group-hover:scale-110 transition-transform duration-200`} size="lg" />
                      <span className="text-xs font-semibold text-gray-300 group-hover:text-white line-clamp-2 leading-relaxed">
                        {action.text}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Message Logs Feed */
            <div className="space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className="animate-slide-in">
                  <Message role={msg.role} content={msg.content} sources={msg.sources} user={user} />
                </div>
              ))}
              {loading && (
                <div className="animate-fade-in-up">
                  <Message role="assistant" isTyping />
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input box ALWAYS docked at bottom */}
      <Input onSend={onSend} loading={loading} />
    </div>
  )
}

