'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import ActivityFeed from '@/components/follow/ActivityFeed'
import UserSearch from '@/components/search/UserSearch'

export default function FollowingPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUserId(user?.id || null)
      } catch (error) {
        console.error('Error getting current user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getCurrentUser()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-full bg-[#08080A]">
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/10 rounded w-32"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-[#131315] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-white/10 rounded w-32 mb-2"></div>
                      <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
                      <div className="h-3 bg-white/5 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!currentUserId) {
    return (
      <div className="flex h-full bg-[#08080A]">
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-6">
            <div className="bg-[#131315] border border-white/[0.1] rounded-lg p-8 text-center">
              <h2 className="text-lg font-medium text-white mb-2">Sign in Required</h2>
              <p className="text-white/60">
                Please sign in to see activity from users you&apos;re following.
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-[#08080A]">
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-6">
          {/* User Search Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-white mb-4">Discover Users</h2>
            <UserSearch
              currentUserId={currentUserId || undefined}
              placeholder="Search users to follow..."
              showFollowButtons={true}
            />
          </div>

          {/* Activity Feed Section */}
          <ActivityFeed />
        </div>
      </main>
    </div>
  )
}
