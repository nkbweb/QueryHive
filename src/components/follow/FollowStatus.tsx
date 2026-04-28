'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface FollowStatusProps {
  followersCount: number
  followingCount: number
  userId: string
  className?: string
}

export default function FollowStatus({ 
  followersCount, 
  followingCount, 
  userId, 
  className = '' 
}: FollowStatusProps) {
  const [followers, setFollowers] = useState<any[]>([])
  const [following, setFollowing] = useState<any[]>([])
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false)
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)

  const fetchFollowers = async () => {
    if (showFollowers || followers.length > 0) return
    
    setIsLoadingFollowers(true)
    try {
      const response = await fetch(`/api/follow/followers/${userId}?limit=10`)
      if (response.ok) {
        const data = await response.json()
        setFollowers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching followers:', error)
    } finally {
      setIsLoadingFollowers(false)
    }
  }

  const fetchFollowing = async () => {
    if (showFollowing || following.length > 0) return
    
    setIsLoadingFollowing(true)
    try {
      const response = await fetch(`/api/follow/following/${userId}?limit=10`)
      if (response.ok) {
        const data = await response.json()
        setFollowing(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching following:', error)
    } finally {
      setIsLoadingFollowing(false)
    }
  }

  const handleFollowersClick = () => {
    if (!showFollowers) {
      fetchFollowers()
    }
    setShowFollowers(!showFollowers)
    setShowFollowing(false)
  }

  const handleFollowingClick = () => {
    if (!showFollowing) {
      fetchFollowing()
    }
    setShowFollowing(!showFollowing)
    setShowFollowers(false)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">
        <button
          onClick={handleFollowersClick}
          className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
        >
          <span className="font-medium">{followersCount}</span>
          <span className="text-white/40">followers</span>
        </button>
        <button
          onClick={handleFollowingClick}
          className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
        >
          <span className="font-medium">{followingCount}</span>
          <span className="text-white/40">following</span>
        </button>
      </div>

      {/* Followers Dropdown */}
      {showFollowers && (
        <div className="bg-[#131315] border border-white/[0.1] rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-white/80">Followers</h3>
          {isLoadingFollowers ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-white/10 rounded w-24 mb-1"></div>
                    <div className="h-2 bg-white/5 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : followers.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {followers.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1C1B1E] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.username}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-white/60">
                        {user.username[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {user.full_name || user.username}
                    </div>
                    <div className="text-xs text-white/40">
                      @{user.username}
                    </div>
                  </div>
                  <div className="text-xs text-white/30">
                    {user.reputation >= 1000
                      ? `${(user.reputation / 1000).toFixed(1)}k`
                      : user.reputation}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40">No followers yet</p>
          )}
        </div>
      )}

      {/* Following Dropdown */}
      {showFollowing && (
        <div className="bg-[#131315] border border-white/[0.1] rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-white/80">Following</h3>
          {isLoadingFollowing ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-white/10 rounded w-24 mb-1"></div>
                    <div className="h-2 bg-white/5 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : following.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {following.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1C1B1E] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.username}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-white/60">
                        {user.username[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {user.full_name || user.username}
                    </div>
                    <div className="text-xs text-white/40">
                      @{user.username}
                    </div>
                  </div>
                  <div className="text-xs text-white/30">
                    {user.reputation >= 1000
                      ? `${(user.reputation / 1000).toFixed(1)}k`
                      : user.reputation}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40">Not following anyone yet</p>
          )}
        </div>
      )}
    </div>
  )
}
