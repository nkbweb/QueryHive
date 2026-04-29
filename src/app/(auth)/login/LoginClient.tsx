

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  LogIn,
  Globe,
  Check,
  HelpCircle,
  UserPlus,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const { loading, error, clearError, login } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      // You could show a success toast here
      console.log('Success message:', message)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    await login({ email, password })
  }

  return (
    <div className="font-body text-on-background flex flex-col items-center justify-center min-h-screen p-6 bg-black relative overflow-hidden">
      
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
        <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Top Line */}
      <header className="fixed top-0 w-full flex justify-center py-8 z-10 pointer-events-none">
        <div className="w-[400px] h-[1px] bg-lime-accent blur-sm opacity-70"></div>
      </header>

      <main className="w-full max-w-[400px] flex flex-col items-center space-y-10 z-20">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="flex justify-center mb-6 hover:opacity-80 transition-opacity">
            <span className="text-white text-[30px] font-semibold flex items-center gap-2">
              <span className="text-lime-accent text-[50px]">⬡</span> QueryHive
            </span>
          </Link>

          <h1 className="text-[28px] font-medium text-white">Welcome back.</h1>
          <p className="text-[14px] text-[#71717A]">Log in to continue.</p>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded">
              {error.message}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-8">

          {/* Email */}
          <div className="group">
            <div className="flex items-center gap-3 pb-2 border-b border-neutral-700 group-focus-within:border-lime-accent transition">
              <Mail className="w-4 h-4 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tapsy.com"
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-neutral-500"
                style={{
                  WebkitBoxShadow: '0 0 0 1000px transparent inset',
                  WebkitTextFillColor: 'white',
                  transition: 'background-color 5000s ease-in-out 0s'
                }}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="group">
            <div className="flex items-center gap-3 pb-2 border-b border-neutral-700 group-focus-within:border-lime-accent transition">
              <Lock className="w-4 h-4 text-neutral-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••"
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-neutral-500 appearance-none"
                style={{
                  WebkitBoxShadow: '0 0 0 1000px transparent inset',
                  WebkitTextFillColor: 'white',
                  transition: 'background-color 5000s ease-in-out 0s'
                }}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-neutral-400" />
                ) : (
                  <Eye className="w-4 h-4 text-neutral-400" />
                )}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-lime-accent"
              />
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                Remember me
              </span>
            </label>

            <Link href="/forgot-password" className="flex items-center gap-1 hover:text-white">
              <HelpCircle className="w-4 h-4" />
              Forgot?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-accent text-black py-3 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Log in
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full flex items-center gap-4">
          <div className="flex-grow border-t border-neutral-800"></div>
          <span className="text-[10px] text-neutral-500 tracking-widest">
            OR AUTHORIZE WITH
          </span>
          <div className="flex-grow border-t border-neutral-800"></div>
        </div>

        {/* Social */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <button className="flex items-center justify-center gap-2 border border-neutral-700 py-3 text-xs hover:bg-neutral-900">
            <Globe className="w-4 h-4" />
            GitHub
          </button>

          <button className="flex items-center justify-center gap-2 border border-neutral-700 py-3 text-xs hover:bg-neutral-900">
            <Globe className="w-4 h-4" />
            Google
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-neutral-500">
          No account?{' '}
          <Link href="/signup" className="text-white hover:text-lime-accent inline-flex items-center gap-1">
            <UserPlus className="w-4 h-4" />
            Sign up
            <ArrowRight className="w-4 h-4" />
          </Link>
        </p>
      </main>

      {/* Bottom Right */}
      <footer className="fixed bottom-6 right-6 hidden md:block text-[10px] text-neutral-600 font-mono">
        SECURE TERMINAL ACCESS • V2.4.0
      </footer>
    </div>
  )
}