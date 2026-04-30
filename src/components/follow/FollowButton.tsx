'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import LoginPopup from '@/components/auth/LoginPopup'

interface FollowButtonProps {
  userId: string
  username: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  currentUserId?: string
  onLoginRequired?: () => void
}

export default function FollowButton({ 
  userId, 
  username, 
  className = '', 
  size = 'md',
  currentUserId,
  onLoginRequired
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Check follow status on mount
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUserId || currentUserId === userId) {
        setIsChecking(false)
        return
      }

      try {
        const response = await fetch(`/api/follow/status/${userId}`)
        if (response.ok) {
          const data = await response.json()
          setIsFollowing(data.isFollowing)
        }
      } catch (error) {
        console.error('Error checking follow status:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkFollowStatus()
  }, [userId, currentUserId])

  const handleFollow = async () => {
    if (!currentUserId) {
      onLoginRequired?.()
      return
    }
    if (isLoading || isChecking) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ followingId: userId }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.isFollowing)
      } else {
        console.error('Failed to follow user')
      }
    } catch (error) {
      console.error('Error following user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnfollow = async () => {
    if (!currentUserId || isLoading || isChecking) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/follow/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.isFollowing)
      } else {
        console.error('Failed to unfollow user')
      }
    } catch (error) {
      console.error('Error unfollowing user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show follow button for own profile
  if (currentUserId === userId) {
    return null
  }

  // Show login button when not logged in
  if (!currentUserId) {
    return (
      <button
        onClick={onLoginRequired}
        className={`${
          size === 'sm' ? 'px-3 py-1 text-xs' :
          size === 'md' ? 'px-4 py-2 text-sm' :
          'px-6 py-3 text-base'
        } font-medium rounded-lg transition-all duration-200 bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 hover:border-white/30 hover:text-white ${className}`}
      >
        Follow
      </button>
    )
  }

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const buttonClasses = `
    ${sizeClasses[size]}
    font-medium rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `

  if (isChecking) {
    return (
      <div className={`${buttonClasses} bg-gray-200 text-gray-400 animate-pulse`}>
        Loading...
      </div>
    )
  }

  if (isFollowing) {
    return (
      <button
        onClick={handleUnfollow}
        disabled={isLoading}
        className={`
          ${buttonClasses}
          bg-white/10 border border-white/20 text-white/80
          hover:bg-white/20 hover:border-white/30 hover:text-white
          focus:ring-white/50
        `}
      >
        {isLoading ? 'Unfollowing...' : 'Following'}
      </button>
    )
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`
        ${buttonClasses}
        bg-[#E8FF47] text-black font-semibold
        hover:bg-[#E8FF47]/90 focus:ring-[#E8FF47]/50
        shadow-sm hover:shadow-md
      `}
    >
      {isLoading ? 'Following...' : 'Follow'}
    </button>
  )
}
