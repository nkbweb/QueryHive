'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { navigate } = useNavigationWithLoading()
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      navigate('/home')
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : `Failed to sign in with ${provider}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="w-full space-y-8" onSubmit={handleLogin}>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {/* Email Field */}
      <div className="relative group">
        <div className="flex items-center space-x-3 pb-2 border-b border-outline-variant transition-colors group-focus-within:border-lime-accent">
          <span className="text-on-surface-variant">mail</span>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent border-none w-full p-0 text-sm placeholder:text-on-surface-variant/40 focus:ring-0"
            placeholder="Email address"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="relative group">
        <div className="flex items-center space-x-3 pb-2 border-b border-outline-variant transition-colors group-focus-within:border-lime-accent">
          <span className="text-on-surface-variant">lock</span>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-transparent border-none w-full p-0 text-sm placeholder:text-on-surface-variant/40 focus:ring-0"
            placeholder="Password"
          />
          <button 
            type="button" 
            className="text-on-surface-variant hover:text-white transition-colors"
          >
            visibility
          </button>
        </div>
      </div>

      <button 
        type="submit" 
        className="w-full bg-lime-accent text-on-primary py-3 px-4 font-bold text-sm tracking-tight hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
        disabled={loading}
      >
        <span>Log in</span>
        <span className="text-sm">→</span>
      </button>

      {/* Social Auth */}
      <div className="w-full space-y-3">
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-outline-variant/30"></div>
          <span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest text-[#71717A] font-mono">OR AUTHORIZE WITH</span>
          <div className="flex-grow border-t border-outline-variant/30"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button" 
            className="flex items-center justify-center space-x-2 border border-outline-variant py-3 hover:bg-surface-container-low transition-colors text-xs font-medium text-white"
            onClick={() => handleOAuthLogin('github')}
            disabled={loading}
          >
            terminal
            <span>GitHub</span>
          </button>
          <button 
            type="button" 
            className="flex items-center justify-center space-x-2 border border-outline-variant py-3 hover:bg-surface-container-low transition-colors text-xs font-medium text-white"
            onClick={() => handleOAuthLogin('google')}
            disabled={loading}
          >
            language
            <span>Google</span>
          </button>
        </div>
      </div>
    </form>
  )
}
