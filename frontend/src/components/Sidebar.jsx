import { useState } from 'react'
import { SquarePen, Search, Pin, MessageSquare, Settings, User } from 'lucide-react'

export default function Sidebar({ open, onToggle, onNewChat }) {
  const [activeTab, setActiveTab] = useState('chat')

  const sidebarItems = [
    { id: 'new', icon: SquarePen, label: 'New chat' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'library', icon: Pin, label: 'Library' },
    { id: 'chat', icon: MessageSquare, label: 'History' },
  ]

  return (
    <aside
      className={`${
        open ? 'w-[60px]' : 'w-0'
      } border-r border-dark-border bg-dark-sidebar transition-all duration-300 overflow-hidden flex flex-col items-center justify-between py-4 z-20`}
    >
      {/* Top Section */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Custom Logo mimicking the ChatGPT/Cosmic gear shape */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-dark-card cursor-pointer transition-colors text-white">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-6 h-6 animate-pulse"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 21L14.907 18.062M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5C19.5 15.4706 15.4706 19.5 10.5 19.5"
            />
            <circle cx="10.5" cy="10.5" r="3.5" strokeWidth="2" />
          </svg>
        </div>

        {/* Navigation Icons */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <div key={item.id} className="relative group w-full flex justify-center">
                <button
                  onClick={() => {
                    if (item.id === 'new') {
                      if (onNewChat) onNewChat()
                    } else {
                      setActiveTab(item.id)
                    }
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-dark-card text-white'
                      : 'text-gray-400 hover:bg-dark-card hover:text-white'
                  }`}
                  aria-label={item.label}
                >
                  <Icon size={20} className={isActive ? 'scale-110' : ''} />
                </button>
                
                {/* Tooltip */}
                <div className="absolute left-[64px] top-1/2 -translate-y-1/2 hidden group-hover:block z-50">
                  <div className="bg-dark-card text-white text-xs font-medium px-2.5 py-1.5 rounded-md border border-dark-border whitespace-nowrap shadow-lg">
                    {item.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center gap-4 w-full px-2">
        {/* Settings button */}
        <div className="relative group w-full flex justify-center">
          <button className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:bg-dark-card hover:text-white transition-colors">
            <Settings size={20} />
          </button>
          <div className="absolute left-[64px] top-1/2 -translate-y-1/2 hidden group-hover:block z-50">
            <div className="bg-dark-card text-white text-xs font-medium px-2.5 py-1.5 rounded-md border border-dark-border whitespace-nowrap shadow-lg">
              Settings
            </div>
          </div>
        </div>

        {/* User Profile Avatar */}
        <div className="relative group w-full flex justify-center cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-700 text-white font-bold text-xs shadow-md border border-purple-500 hover:scale-105 transition-transform">
            MU
          </div>
          <div className="absolute left-[64px] top-1/2 -translate-y-1/2 hidden group-hover:block z-50">
            <div className="bg-dark-card text-white text-xs font-medium px-2.5 py-1.5 rounded-md border border-dark-border whitespace-nowrap shadow-lg">
              Profile & Account
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
