import { useState } from 'react'
import { SquarePen, Search, Pin, MessageSquare, Settings, Trash2, Plus, LogOut, Sidebar as SidebarIcon } from 'lucide-react'

export default function Sidebar({
  open,
  onToggle,
  onNewChat,
  history = [],
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  user,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('chat')

  // Helper to group sessions by date
  const groupSessions = (items) => {
    const groups = { today: [], yesterday: [], older: [] }
    if (!items || !Array.isArray(items)) return groups

    const todayStr = new Date().toDateString()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toDateString()

    items.forEach((item) => {
      const date = new Date(item.updated_at)
      const dateStr = date.toDateString()

      if (dateStr === todayStr) {
        groups.today.push(item)
      } else if (dateStr === yesterdayStr) {
        groups.yesterday.push(item)
      } else {
        groups.older.push(item)
      }
    })
    return groups
  }

  const grouped = groupSessions(history)

  const renderGroup = (title, items) => {
    if (items.length === 0) return null
    return (
      <div className="space-y-1">
        <h3 className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none">
          {title}
        </h3>
        <div className="space-y-0.5">
          {items.map((session) => {
            const isActive = currentSessionId === session.session_id
            return (
              <div
                key={session.session_id}
                className={`group relative flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-dark-card text-white font-medium'
                    : 'text-gray-300 hover:bg-dark-card hover:text-white'
                }`}
                onClick={() => onSelectSession(session.session_id)}
              >
                <div className="flex items-center gap-2.5 truncate w-full pr-6">
                  <MessageSquare size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{session.title}</span>
                </div>
                
                {/* Delete button (only shows on hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onDeleteSession) onDeleteSession(session.session_id)
                  }}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#2f2f2f] text-gray-400 hover:text-red-400 transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // COLLAPSED MODE (Slim Vertical Icon Strip)
  if (!open) {
    return (
      <aside className="w-[60px] border-r border-dark-border bg-dark-sidebar transition-all duration-300 overflow-hidden flex flex-col items-center justify-between py-4 z-20">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Custom Logo */}
          <div
            onClick={onToggle}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-dark-card cursor-pointer transition-colors text-white"
            title="Expand Sidebar"
          >
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

          {/* Collapsed Actions */}
          <div className="flex flex-col items-center gap-3 w-full px-2">
            <div className="relative group w-full flex justify-center">
              <button
                onClick={onNewChat}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:bg-dark-card hover:text-white transition-colors"
                title="New Chat"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="relative group w-full flex justify-center">
              <button
                onClick={onToggle}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:bg-dark-card hover:text-white transition-colors"
                title="Chat History"
              >
                <MessageSquare size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 w-full px-2">
          <div className="relative group w-full flex justify-center">
            <button className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:bg-dark-card hover:text-white transition-colors" title="Settings">
              <Settings size={20} />
            </button>
          </div>
          {/* Collapsed Google Profile Avatar */}
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              onClick={onLogout}
              className="h-8 w-8 rounded-full border border-purple-500 shadow-md cursor-pointer hover:scale-105 transition-transform"
              title="Log Out"
            />
          ) : (
            <div
              onClick={onLogout}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-700 text-white font-bold text-xs border border-purple-500 cursor-pointer"
              title="Log Out"
            >
              {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'U'}
            </div>
          )}
        </div>
      </aside>
    )
  }

  // EXPANDED MODE (Full Panel)
  return (
    <aside className="w-60 border-r border-dark-border bg-[#171717] transition-all duration-300 overflow-hidden flex flex-col justify-between py-3.5 z-20 h-screen select-none font-sans">
      {/* Top Header Section */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-3.5 mb-3 flex-shrink-0">
          {/* Logo Title */}
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-5 h-5 text-white animate-pulse"
            >
              <circle cx="10.5" cy="10.5" r="3.5" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5C19.5 15.4706 15.4706 19.5 10.5 19.5" />
            </svg>
            <span className="text-sm font-semibold text-white tracking-wide">CosmoGPT</span>
          </div>
          {/* Toggle sidebar */}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-dark-card hover:text-white transition-colors"
            title="Collapse sidebar"
          >
            <SidebarIcon size={16} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-3 mb-4 flex-shrink-0">
          <button
            onClick={onNewChat}
            className="flex items-center justify-between w-full rounded-lg border border-dark-border hover:bg-dark-card px-3 py-2.5 text-xs text-white transition-colors font-medium shadow-sm hover:border-gray-500"
          >
            <span>New Chat</span>
            <SquarePen size={15} className="text-gray-300" />
          </button>
        </div>

        {/* Chat History Sessions (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-1.5 space-y-5 pb-4">
          {renderGroup("Today's Chats", grouped.today)}
          {renderGroup("Yesterday", grouped.yesterday)}
          {renderGroup("Previous Days", grouped.older)}
          
          {history.length === 0 && (
            <div className="text-center text-[11px] text-gray-500 py-8 px-4 font-normal">
              No recent conversations
            </div>
          )}
        </div>
      </div>

      {/* Bottom Profile Section */}
      <div className="border-t border-dark-border/40 pt-3 px-3 flex flex-col gap-1.5 flex-shrink-0">
        <button className="flex items-center gap-3 w-full rounded-lg px-2 py-1.5 text-xs text-gray-300 hover:bg-dark-card hover:text-white transition-colors">
          <Settings size={15} />
          <span>Settings</span>
        </button>
        
        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full rounded-lg px-2 py-1.5 text-xs text-rose-400 hover:bg-dark-card hover:text-rose-300 transition-colors"
          title="Log out of application"
        >
          <LogOut size={15} />
          <span>Log Out</span>
        </button>

        {/* Profile Card */}
        <div className="flex items-center justify-between w-full rounded-lg px-2 py-2 text-xs text-gray-300 hover:bg-dark-card hover:text-white transition-colors cursor-pointer mt-1">
          <div className="flex items-center gap-3 truncate">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="h-7 w-7 rounded-full border border-purple-500 shadow-md flex-shrink-0"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-700 text-white font-bold text-[10px] border border-purple-500 shadow-md">
                {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'U'}
              </div>
            )}
            <div className="flex flex-col truncate">
              <span className="truncate font-semibold text-white leading-none mb-0.5">{user?.displayName || 'User'}</span>
              <span className="truncate text-[10px] text-gray-400 leading-none">{user?.email || ''}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
