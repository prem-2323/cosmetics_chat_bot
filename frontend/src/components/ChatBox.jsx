import { useEffect, useRef } from 'react'
import Message from './Message'
import Input from './Input'
import { Sparkles, ShieldCheck, Heart } from 'lucide-react'

export default function ChatBox({ messages = [], loading = false, onSend, user }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const quickActions = [
    { text: 'Create a custom skincare routine', icon: Sparkles, color: 'text-purple-400' },
    { text: 'Analyze ingredient safety & side effects', icon: ShieldCheck, color: 'text-emerald-400' },
    { text: 'Find cosmetics recommendations for oily skin', icon: Heart, color: 'text-pink-400' },
  ]

  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-dark-bg select-none">
      {/* If empty, render welcome center screen */}
      {!hasMessages ? (
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-8">
          <div className="w-full max-w-2xl text-center space-y-8 animate-fade-in">
            {/* Logo Accent */}
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xl">
              <Sparkles size={24} className="animate-pulse" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white select-none">
              Where should we begin?
            </h1>

            {/* Centered Input wrapper */}
            <div className="w-full">
              <Input onSend={onSend} loading={loading} />
            </div>

            {/* Quick Actions List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-3xl mt-4 px-4">
              {quickActions.map((action, idx) => {
                const Icon = action.icon
                return (
                  <button
                    key={idx}
                    onClick={() => onSend(action.text)}
                    className="flex flex-col gap-2 items-start p-4 rounded-2xl border border-dark-border bg-[#212121]/40 hover:bg-[#212121] hover:border-gray-500 text-left transition-all duration-200 group hover:-translate-y-0.5"
                  >
                    <Icon className={`${action.color} group-hover:scale-110 transition-transform duration-200`} size={20} />
                    <span className="text-xs font-medium text-gray-300 group-hover:text-white line-clamp-2">
                      {action.text}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Render normal messages feed */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((msg, i) => (
                <Message key={i} role={msg.role} content={msg.content} sources={msg.sources} user={user} />
              ))}
              {loading && <Message role="assistant" isTyping />}
              <div ref={bottomRef} />
            </div>
          </div>
          {/* Floating Input at bottom */}
          <Input onSend={onSend} loading={loading} />
        </div>
      )}
    </div>
  )
}
