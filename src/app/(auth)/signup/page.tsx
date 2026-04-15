'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Mail,
  Lock,
  User,
  CheckCircle,
  ArrowRight,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react'
import { useAuth, type SignupData } from '@/lib/auth'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(true)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const { loading, error, clearError, signup, validateUsername } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    const signupData: SignupData = {
      fullName,
      username,
      email,
      password
    }
    
    await signup(signupData)
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUsername(value)
    
    // Real-time validation
    const validation = validateUsername(value)
    setUsernameAvailable(validation.isValid)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    
    // Real-time password strength calculation
    let strength = 1
    if (value.length >= 8) strength++
    if (/[A-Z]/.test(value)) strength++
    if (/[0-9]/.test(value)) strength++
    if (/[^A-Za-z0-9]/.test(value)) strength++
    setPasswordStrength(Math.min(strength, 4))
  }

  return (
    <>
      <main className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT PANEL: FORM SECTION (55%) */}
      <section className="w-full md:w-[55%] flex flex-col p-8 md:p-16 lg:p-24 relative overflow-y-auto">
        {/* Logo */}
        <div className="mb-20">
          <Link href="/" className="text-xl font-bold tracking-[-0.02em] text-white hover:opacity-80 transition-opacity flex items-center gap-2">
            <span className="text-lime-accent text-2xl">⬡</span>
            QueryHive
          </Link>
        </div>
        
        <div className="max-w-[420px] w-full mx-auto md:mx-0">
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-white mb-2">Create account</h1>
          <p className="text-[14px] text-[#71717A] mb-10">Join collective intelligence network.</p>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded mb-6">
              {error.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Full Name */}
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#52525B] flex items-center gap-2">
                <User className="w-3 h-3" />
                Full Name
              </label>
              <input 
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-transparent border-0 border-b border-outline-variant py-2 focus:ring-0 focus:border-lime-accent transition-colors placeholder:text-white/20" 
                placeholder="John Doe" 
                required
              />
            </div>

            {/* Username with Indicator */}
            <div className="flex flex-col space-y-2 relative">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#52525B]">Username</label>
              <div className="relative">
                <input 
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-2 pr-8 focus:ring-0 focus:border-lime-accent transition-colors placeholder:text-white/20" 
                  placeholder="johndoe_99" 
                  required
                />
                {usernameAvailable && username.length > 3 && (
                  <div className="absolute right-0 bottom-3">
                    <CheckCircle className="w-4 h-4 text-lime-accent" />
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#52525B] flex items-center gap-2">
                <Mail className="w-3 h-3" />
                Email
              </label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-0 border-b border-outline-variant py-2 focus:ring-0 focus:border-lime-accent transition-colors placeholder:text-white/20" 
                placeholder="name@company.com" 
                required
              />
            </div>

            {/* Password with Strength */}
            <div className="flex flex-col space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#52525B] flex items-center gap-2">
                <Lock className="w-3 h-3" />
                Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-2 pr-8 focus:ring-0 focus:border-lime-accent transition-colors placeholder:text-white/20" 
                  placeholder="••••••••" 
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-3"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-neutral-400" />
                  )}
                </button>
              </div>
              
              {/* Strength Bar */}
              <div className="flex gap-1 h-[2px] pt-1">
                <div className={`flex-1 ${passwordStrength >= 1 ? 'bg-lime-accent' : 'bg-white/10'}`}></div>
                <div className={`flex-1 ${passwordStrength >= 2 ? 'bg-lime-accent' : 'bg-white/10'}`}></div>
                <div className={`flex-1 ${passwordStrength >= 3 ? 'bg-lime-accent' : 'bg-white/10'}`}></div>
                <div className={`flex-1 ${passwordStrength >= 4 ? 'bg-lime-accent' : 'bg-white/10'}`}></div>
              </div>
            </div>

            {/* Primary Action */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full h-[36px] bg-lime-accent text-black text-[13px] font-bold tracking-tight rounded-[0px] hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center h-[36px] bg-[#0F0F12] border border-outline-variant/30 text-[12px] font-medium text-white/80 rounded-[0px] hover:bg-white/5 transition-colors">
              GitHub
            </button>
            <button className="flex items-center justify-center h-[36px] bg-[#0F0F12] border border-outline-variant/30 text-[12px] font-medium text-white/80 rounded-[0px] hover:bg-white/5 transition-colors">
              Google
            </button>
          </div>

          {/* Footer link */}
          <div className="mt-10">
            <Link href="/login" className="text-[13px] text-[#71717A] hover:text-white transition-colors group inline-flex items-center gap-1">
              Already have an account? 
              <span className="text-white">Log in</span> 
              <ArrowRight className="w-4 h-4 inline-block group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL: TERMINAL PREVIEW (45%) */}
      <section className="hidden md:flex md:w-[45%] bg-[#0D0D10] border-l border-outline-variant/20 flex-col items-center justify-center p-12">
        <div className="w-full max-w-[480px]">
          {/* Terminal Window */}
          <div className="bg-[#08080A] rounded-[2px] overflow-hidden border border-outline-variant/30 shadow-2xl">
            {/* Window Header */}
            <div className="h-8 bg-[#1C1B1E] px-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
              </div>
              <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">query-stream-v4.0.1</div>
              <div className="w-6"></div>
            </div>
            
            {/* Terminal Body */}
            <div className="p-6 font-mono text-[12px] leading-relaxed min-h-[260px]">
              <div className="mb-4 text-white/40">
                <span className="text-lime-accent">$</span> connect queryhive_core --secure
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-lime-accent">&gt;</span>
                  <span className="text-white/90">Question posted in <span className="text-white font-bold underline decoration-lime-accent/30 underline-offset-4">#quantum-computing</span></span>
                </div>
                <div className="flex items-start gap-3 animate-pulse">
                  <span className="text-lime-accent">⬡</span>
                  <span className="text-lime-accent">AI drafting answer from 14 verified sources...</span>
                </div>
                <div className="flex items-start gap-3 opacity-50">
                  <CheckCircle className="w-[14px] h-[14px] text-lime-accent" />
                  <span className="text-white/80">AI Draft ready. Authority score: 98.4%</span>
                </div>
                <div className="mt-6 p-4 bg-[#1C1B1E] rounded-[0px] border-l-2 border-lime-accent">
                  <div className="text-[10px] text-white/40 mb-2">SYSTEM_RESPONSE</div>
                  <div className="text-white/90 text-[11px] leading-normal">
                    &quot;Quantum entanglement persists across spatial dimensions due to non-local correlation signatures inherent to Hilbert space...&quot;
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Label underneath */}
          <div className="mt-8 flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-outline-variant/30"></div>
            <p className="text-[12px] text-[#71717A] text-center font-medium">
              AI answers every question in under 2 seconds.
            </p>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-outline-variant/30"></div>
          </div>
        </div>
      </section>
    </main>

    {/* Contextual Status Dot (Active) */}
    <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-[#1C1B1E] px-3 py-1.5 border border-outline-variant/20">
      <span className="w-2 h-2 rounded-full bg-lime-accent animate-pulse"></span>
      <span className="text-[10px] font-mono uppercase tracking-tighter text-white/60">Node: NY-7 Active</span>
    </div>
    </>
  )
}
