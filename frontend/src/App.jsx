import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import ChatBox from './components/ChatBox'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatKey, setChatKey] = useState(0)

  const handleNewChat = () => {
    setChatKey((prev) => prev + 1)
  }

  return (
    <div className="flex h-screen bg-dark-bg text-white overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <ChatBox key={chatKey} />
      </div>
    </div>
  )
}
