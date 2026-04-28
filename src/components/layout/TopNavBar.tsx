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

export default function TopNavBar() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [showUserMenu, setShowUserMenu] = useState(false)
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

  return (
    <nav className="fixed top-0 w-full h-[56px] border-b border-surface-container-low bg-surface flex justify-between items-center px-3 z-50 backdrop-blur-sm">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <span className="text-lime-accent text-[40px] font-bold leading-none">⬡</span>
          <span className="text-xl font-bold text-white tracking-tight">QueryHive</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/notifications')}
          className="relative cursor-pointer group flex items-center justify-center bg-transparent border-none outline-none"
        >
          <span className="material-symbols-outlined text-white/60 text-[40px] group-hover:text-white/80 transition-colors">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-lime-accent rounded-full flex items-center justify-center text-[10px] font-bold text-black">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        {user ? (
          <div className="relative flex items-center" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-10 h-10 rounded-full overflow-hidden transition-all duration-200 flex-shrink-0"
            >
              <Image 
                  className="w-full h-full object-cover" 
                  style={{ borderRadius: '50%' }}
                  src={avatarUrl || getProfileImagePlaceholder()}
                  alt="User avatar"
                  width={40}
                  height={40}
                />
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-3 w-56 bg-surface-container border border-surface-container-high rounded-lg shadow-xl z-50 backdrop-blur-sm">
                <div className="px-4 py-3 border-b border-surface-container-high">
                  <div className="text-sm text-white font-medium truncate">
                    {user.email}
                  </div>
                  <div className="text-xs text-white/50 mt-0.5">
                    Signed in
                  </div>
                </div>
                <div className="py-2">
                  {username && (
                    <button
                      onClick={() => {
                        navigate(`/profile/${username}`)
                        setShowUserMenu(false)
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:text-white hover:bg-surface-container-high transition-colors flex items-center gap-3 bg-transparent border-none outline-none"
                    >
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      <span>My Profile</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      setShowUserMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:text-white hover:bg-surface-container-high transition-colors flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center hover:border-lime-accent/50 transition-colors flex-shrink-0">
            <span className="material-symbols-outlined text-white/40 text-[20px]">account_circle</span>
          </div>
        )}
        <button 
          onClick={() => navigate('/ask')}
          className="bg-lime-accent text-neutral text-sm font-semibold px-3 py-2 hover:bg-lime-accent/90 hover:shadow-lg hover:shadow-lime-accent/30 transition-all duration-200 rounded-sm flex-shrink-0 flex items-center"
        >
          Ask
        </button>
      </div>
    </nav>
  )
}
