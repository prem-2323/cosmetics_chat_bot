import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { Sparkles, LogIn, Loader2 } from 'lucide-react'

export default function Login() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Sign in error:', err)
      setError('Failed to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0d0d0d] text-white p-4 select-none">
      <div className="w-full max-w-md rounded-[28px] border border-dark-border bg-[#171717] p-8 shadow-2xl space-y-8 animate-fade-in text-center">
        {/* CosmoGPT Logo - Indigo/Emerald gradient */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-600 text-white shadow-xl animate-pulse">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-8 h-8 text-white">
            <circle cx="12" cy="12" r="6" />
            <path d="M3.5 12c0-2 4.25-4 8.5-4s8.5 2 8.5 4-4.25 4-8.5 4-8.5-2-8.5-4z" />
          </svg>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Welcome to CosmoGPT
          </h1>
          <p className="text-sm text-gray-400">
            Your personal AI cosmetics & skincare consultant
          </p>
        </div>

        {/* Description / Feature Highlights */}
        <div className="rounded-2xl bg-dark-card/30 p-5 text-xs text-gray-300 text-left space-y-3.5 border border-dark-border">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-sm" />
            <span>Formulation & Ingredient analysis</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
            <span>Product safety & rating lookups</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-teal-500 shadow-sm" />
            <span>Custom skincare routines in real time</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-xs text-rose-400 bg-rose-950/20 border border-rose-950/40 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {/* Google sign in button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white text-black font-semibold px-4 py-3.5 hover:bg-gray-200 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              {/* Simple Google SVG Icon */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.69c-.29 1.5-.1.8-1.5 2.4l3.19 2.47c1.86-1.7 2.93-4.22 2.93-7.2h.43z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.19-2.47c-.88.6-2.02.95-3.23.95-2.5 0-4.6-1.69-5.35-3.97l-3.3 2.56C6.78 21.6 10.11 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.65 15.6c-.2-.6-.31-1.23-.31-1.88s.11-1.28.31-1.88L3.35 9.28C2.56 10.87 2 12.8 2 15c0 2.2.56 4.13 1.35 5.72l3.3-2.56-.56-.56z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 8.11 0 4.78 2.4 2.87 5.88l3.3 2.56c.75-2.28 2.85-3.97 5.83-3.97h-.22z"
                />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
