import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import ChatBox from './components/ChatBox'
import Login from './components/Login'
import { Toaster } from 'react-hot-toast'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [mongoUserId, setMongoUserId] = useState(null)
  const [authChecking, setAuthChecking] = useState(true)
  
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [selectedModel, setSelectedModel] = useState('cosmo-v1')

  // Listen for Google Auth changes and authenticate with MongoDB backend
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        try {
          // Register or fetch user profile in CosmeticsBot MongoDB database
          const { data } = await axios.post('/auth/login', {
            google_id: currentUser.uid,
            name: currentUser.displayName || 'Google User',
            email: currentUser.email || '',
            picture: currentUser.photoURL || ''
          })
          setMongoUserId(data.user_id)
          // Load past sessions from MongoDB
          const sessionHistory = await fetchHistory(data.user_id)
          // If there is an existing session, load the most recent one
          if (sessionHistory && sessionHistory.length > 0) {
            await loadSession(sessionHistory[0].session_id)
          } else {
            // Otherwise, start a fresh new session
            await initiateNewChat(data.user_id)
          }
        } catch (err) {
          console.error('Error logging in user to backend MongoDB:', err)
        }
      } else {
        setMongoUserId(null)
        setHistory([])
        setCurrentSessionId(null)
        setMessages([])
      }
      setAuthChecking(false)
    })
    return () => unsubscribe()
  }, [])

  // Fetch session history for the current MongoDB user_id
  const fetchHistory = async (mUserId) => {
    const uid = mUserId || mongoUserId
    if (!uid) return []
    try {
      const { data } = await axios.get(`/history?user_id=${uid}`)
      setHistory(data)
      return data
    } catch (err) {
      console.error('Error fetching history:', err)
      return []
    }
  }

  // Create a brand new session document in MongoDB
  const initiateNewChat = async (mUserId) => {
    const uid = mUserId || mongoUserId
    if (!uid) return

    // If the current chat is already empty, do not spawn another empty session
    if (currentSessionId && messages.length === 0) {
      return
    }

    try {
      const { data } = await axios.post('/chat/new', { user_id: uid })
      setCurrentSessionId(data.session_id)
      setMessages([])
      fetchHistory(uid)
    } catch (err) {
      console.error('Error starting new chat:', err)
    }
  }

  // Retrieve the complete conversation log from MongoDB
  const loadSession = async (sessionId) => {
    setLoading(true)
    try {
      const { data } = await axios.get(`/history/${sessionId}`)
      setMessages(data)
      setCurrentSessionId(sessionId)
    } catch (err) {
      console.error('Error loading session conversation:', err)
    } finally {
      setLoading(false)
    }
  }

  // Delete session and related messages from MongoDB
  const deleteSession = async (sessionId) => {
    try {
      await axios.delete(`/history/${sessionId}`)
      fetchHistory(mongoUserId)
      // If the currently viewed session was deleted, start a new fresh one
      if (currentSessionId === sessionId) {
        initiateNewChat(mongoUserId)
      }
    } catch (err) {
      console.error('Error deleting session:', err)
    }
  }

  // Send query and update logs
  const handleSend = async (question) => {
    let sessionId = currentSessionId
    let mUserId = mongoUserId

    if (!mUserId) return

    // Fallback if no active session
    if (!sessionId) {
      try {
        const { data } = await axios.post('/chat/new', { user_id: mUserId })
        sessionId = data.session_id
        setCurrentSessionId(sessionId)
      } catch (err) {
        console.error('Failed to create fallback session:', err)
        return
      }
    }

    // Optimistically update the query in user message list
    const userMsg = { role: 'user', content: question, sources: [] }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      // Send question and get answer
      const { data } = await axios.post('/chat', {
        session_id: sessionId,
        user_id: mUserId,
        message: question,
        model: selectedModel
      })
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer, sources: data.sources }
      ])
      // Refresh sidebar list to display updated session card title
      fetchHistory(mUserId)
    } catch (err) {
      console.error('Error sending message:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          sources: []
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const { t } = useTranslation()

  if (authChecking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0d0d0d] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent" />
          <span className="text-sm text-gray-400">{t('app.loading')}</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="flex h-screen bg-dark-bg text-white overflow-hidden font-sans">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={() => initiateNewChat(mongoUserId)}
        history={history}
        currentSessionId={currentSessionId}
        onSelectSession={loadSession}
        onDeleteSession={deleteSession}
        user={user}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
        />
        <ChatBox
          messages={messages}
          loading={loading}
          onSend={handleSend}
          user={user}
        />
      </div>
      <Toaster position="bottom-right" toastOptions={{ duration: 3500 }} />
    </div>
  )
}
