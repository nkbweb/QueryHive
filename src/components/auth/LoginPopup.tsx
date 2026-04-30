'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createPortal } from 'react-dom'

interface LoginPopupProps {
  isOpen: boolean
  onClose: () => void
  action?: string // Optional action description like "upvote", "answer", etc.
}

export default function LoginPopup({ isOpen, onClose, action }: LoginPopupProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      // Redirect to login page with return URL
      const currentPath = window.location.pathname
      router.push(`/login?returnTo=${encodeURIComponent(currentPath)}`)
    } catch (error) {
      console.error('Error navigating to login:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async () => {
    setIsLoading(true)
    try {
      // Redirect to signup page with return URL
      const currentPath = window.location.pathname
      router.push(`/signup?returnTo=${encodeURIComponent(currentPath)}`)
    } catch (error) {
      console.error('Error navigating to signup:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Popup */}
      <div className="relative bg-surface border border-surface-container-high rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-black/20">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-lime-accent/20 to-lime-accent/5 rounded-2xl flex items-center justify-center border border-lime-accent/20">
            <span className="material-symbols-outlined text-[32px] text-lime-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">
            {action ? `${action.charAt(0).toUpperCase() + action.slice(1)} to continue` : 'Sign in required'}
          </h2>
          <p className="text-white/60 leading-relaxed">
            {action 
              ? `You need to be logged in to ${action}. Join our community to ask questions, share answers, and connect with experts.`
              : 'Join our community to ask questions, share answers, and connect with experts around the world.'
            }
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-surface-container/50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px] text-lime-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="text-sm text-white/80">Ask unlimited questions</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px] text-lime-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="text-sm text-white/80">Vote and bookmark content</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px] text-lime-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="text-sm text-white/80">Follow interesting users</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-lime-accent text-black font-semibold py-3 px-6 rounded-lg hover:bg-lime-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>
                  login
                </span>
                Log In
              </>
            )}
          </button>
          
          <button
            onClick={handleSignup}
            disabled={isLoading}
            className="w-full bg-white/10 border border-white/20 text-white font-medium py-3 px-6 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>
              person_add
            </span>
            Sign Up
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-6 border-t border-surface-container-high">
          <p className="text-xs text-white/40">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
