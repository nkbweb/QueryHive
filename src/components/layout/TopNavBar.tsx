'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getProfileImagePlaceholder } from '@/lib/storage/profile-images'
import { useAuth } from '@/lib/auth'
import { useNotifications } from '@/hooks/useNotifications'
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading'
import { AuthUser } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import LoginPopup from '@/components/auth/LoginPopup'

export default function TopNavBar() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const { logout } = useAuth()
  const { unreadCount } = useNotifications()
  const { navigate } = useNavigationWithLoading()
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        // Get user profile with avatar
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url, username')
          .eq('id', user.id)
          .single()

        setAvatarUrl(profile?.avatar_url || getProfileImagePlaceholder())
        setUsername(profile?.username || '')
      }
    }

    getUser()

    const { data: { subscription } } = createClient().auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
          setAvatarUrl('')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const checkAuthAndShowPopup = () => {
    if (!user) {
      setShowLoginPopup(true)
      return false
    }
    return true
  }

  return (
    <nav className="fixed top-0 w-full h-[56px] border-b border-surface-container-low bg-surface flex justify-between items-center px-3 z-50 backdrop-blur-sm overflow-visible">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <span className="text-lime-accent text-[40px] font-bold leading-none">⬡</span>
          <span className="text-xl font-bold text-white tracking-tight">QueryHive</span>
        </div>
      </div>
      <div className="flex items-center gap-5 overflow-visible">
        <button 
          onClick={() => {
            if (!checkAuthAndShowPopup()) return
            navigate('/notifications')
          }}
          className="relative cursor-pointer group flex items-center justify-center w-10 h-10 rounded-lg hover:border-lime-accent/30 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-white/70 !text-[24px] group-hover:text-white transition-colors leading-none">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-lime-accent rounded-full flex items-center justify-center text-[10px] font-bold text-black px-1.5 shadow-lg shadow-lime-accent/30 border-2 border-surface">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        {user ? (
          <div className="relative flex items-center" ref={userMenuRef}>
            <div onClick={() => setShowUserMenu(!showUserMenu)} className="w-11 h-11 sm:w-[44px] sm:h-[44px] rounded-[9px] overflow-hidden  bg-[#1a1a1f] cursor-pointer">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={"User avatar"}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#1e2028]">
                  <span className="text-2xl font-bold text-white/20 select-none tracking-tight">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-surface-container-high/80 rounded-2xl shadow-2xl z-50 backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="p-4 bg-gradient-to-br from-lime-accent/20 via-emerald-500/10 to-cyan-500/20 border-b border-surface-container-high/50 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                    backgroundSize: '8px 8px',
                    color: 'rgba(132, 204, 22, 0.5)'
                  }}></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#1a1a1f] ring-2 ring-surface-container-high/50 ring-offset-2 ring-offset-surface">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt="User avatar"
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#1e2028]">
                            <span className="text-xl font-bold text-white/30">
                              {username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-lime-accent rounded-full border-2 border-surface flex items-center justify-center">
                        <span className="text-[8px] font-bold text-black">✓</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {username || 'User'}
                      </div>
                      <div className="text-xs text-white/40 truncate mt-0.5">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-1.5 bg-gradient-to-b from-lime-accent/5 via-emerald-500/5 to-cyan-500/5 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                    backgroundSize: '10px 10px',
                    color: 'rgba(132, 204, 22, 0.3)'
                  }}></div>
                  <div className="relative z-10">
                    <div className="px-3 py-2">
                      <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Account</span>
                    </div>
                    
                    {username && (
                      <button
                        onClick={() => {
                          navigate(`/profile/${username}`)
                          setShowUserMenu(false)
                        }}
                        className="w-full px-3 py-2.5 text-left text-sm text-white/70 hover:text-white hover:bg-lime-accent/20 rounded-lg transition-all duration-150 flex items-center gap-3 bg-transparent border-none outline-none group"
                      >
                        <span className="material-symbols-outlined text-[20px] text-white/30 group-hover:text-lime-accent transition-colors">account_circle</span>
                        <span className="font-medium">View Profile</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        navigate('/settings')
                        setShowUserMenu(false)
                      }}
                      className="w-full px-3 py-2.5 text-left text-sm text-white/70 hover:text-white hover:bg-emerald-500/20 rounded-lg transition-all duration-150 flex items-center gap-3 group"
                    >
                      <span className="material-symbols-outlined text-[20px] text-white/30 group-hover:text-emerald-400 transition-colors">settings</span>
                      <span className="font-medium">Settings</span>
                    </button>
                  </div>
                </div>
                
                <div className="border-t border-surface-container-high/50 p-1.5 bg-gradient-to-b from-cyan-500/5 to-surface relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                    backgroundSize: '10px 10px',
                    color: 'rgba(6, 182, 212, 0.3)'
                  }}></div>
                  <div className="relative z-10">
                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                      }}
                      className="w-full px-3 py-2.5 text-left text-sm text-white/70 hover:text-red-400 hover:bg-red-500/15 rounded-lg transition-all duration-150 flex items-center gap-3 group"
                    >
                      <span className="material-symbols-outlined text-[20px] text-white/30 group-hover:text-red-400 transition-colors">logout</span>
                      <span className="font-medium">Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center hover:border-lime-accent/50 hover:bg-surface-container-high/80 transition-all duration-200 flex-shrink-0">
            <span className="material-symbols-outlined text-white/50 !text-[24px]">account_circle</span>
          </div>
        )}
        <button 
          onClick={() => navigate('/ask')}
          className="hidden sm:flex bg-gradient-to-r from-lime-accent to-lime-400 text-neutral text-sm font-bold px-5 py-2.5 rounded-full flex-shrink-0 items-center gap-2 shadow-lg shadow-lime-accent/20"
        >
          <span className="material-symbols-outlined !text-[18px]">add_circle</span>
          <span>Ask</span>
        </button>
        <LoginPopup 
          isOpen={showLoginPopup} 
          onClose={() => setShowLoginPopup(false)}
          action="view notifications"
        />
      </div>
    </nav>
  )
}
