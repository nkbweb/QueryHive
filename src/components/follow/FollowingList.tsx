'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import FollowButton from './FollowButton'

interface User {
  id: string
  username: string
  fullName?: string
  avatarUrl?: string
  reputation: number
}

interface FollowingListProps {
  currentUserId: string
}

export default function FollowingList({ currentUserId }: FollowingListProps) {
  const [following, setFollowing] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        console.log('Fetching following for user:', currentUserId)
        const response = await fetch(`/api/follow/following/${currentUserId}`)
        const data = await response.json()
        
        console.log('Following API response:', data)

        if (!response.ok) {
          console.error('Error fetching following:', data.error)
          return
        }

        const users = (data.users || []).map((item: any) => ({
          id: item.id,
          username: item.username,
          fullName: item.full_name,
          avatarUrl: item.avatar_url,
          reputation: item.reputation || 0
        }))

        console.log('Processed following users:', users)
        setFollowing(users)
      } catch (error) {
        console.error('Error fetching following:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (currentUserId) {
      fetchFollowing()
    }
  }, [currentUserId])

  const displayUsers = showAll ? following : following.slice(0, 3)

  if (isLoading) {
    return (
      <div className="bg-surface-container border border-surface-container-high rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-lime-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
              people
            </span>
            People You Follow
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-surface rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 bg-surface rounded w-24 mb-1"></div>
                <div className="h-2 bg-surface-container rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (following.length === 0) {
    return (
      <div className="bg-surface-container border border-surface-container-high rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-lime-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
              people
            </span>
            People You Follow
          </h3>
        </div>
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-white/20">person_search</span>
          <p className="text-white/40 mt-3">You&apos;re not following anyone yet</p>
          <p className="text-sm text-white/30 mt-1">Discover users above to start building your network</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-container border border-surface-container-high rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-lime-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
            people
          </span>
          People You Follow
          <span className="text-xs text-white/40 bg-surface-container px-2 py-1 rounded-full">
            {following.length}
          </span>
        </h3>
      </div>
      
      <div className="space-y-3">
        {displayUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-3">
            <div className="relative">
              <Image
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=131315&color=ffffff&size=40&bold=true`}
                alt={user.username}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-lime-accent rounded-full border-2 border-surface-container"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <Link
                href={`/profile/${user.username}`}
                className="text-sm font-medium text-white hover:text-lime-accent transition-colors truncate block"
              >
                {user.fullName || user.username}
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${user.username}`}
                  className="text-xs text-white/40 hover:text-lime-accent transition-colors"
                >
                  @{user.username}
                </Link>
                <span className="text-xs text-white/20">·</span>
                <span className="text-xs text-white/30">
                  {user.reputation >= 1000 ? `${(user.reputation / 1000).toFixed(1)}k` : user.reputation}
                </span>
              </div>
            </div>

            <FollowButton
              userId={user.id}
              username={user.username}
              currentUserId={currentUserId}
              size="sm"
            />
          </div>
        ))}
      </div>

      {/* Load More Button - Only show on mobile and if there are more users */}
      {following.length > 3 && (
        <div className="mt-4 pt-4 border-t border-surface-container-high">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full px-4 py-2 text-sm text-lime-accent bg-lime-accent/10 border border-lime-accent/20 rounded-lg hover:bg-lime-accent/20 transition-colors"
          >
            {showAll ? 'Show Less' : `Show More (${following.length - 3} more)`}
          </button>
        </div>
      )}
    </div>
  )
}
