'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import ActivityFeed from '@/components/follow/ActivityFeed'
import UserSearch from '@/components/search/UserSearch'
import FollowingList from '@/components/follow/FollowingList'
import { Users, TrendingUp, Sparkles } from 'lucide-react'

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
      <div className="flex h-full bg-surface">
        <main className="flex-1 overflow-y-auto no-scrollbar">
          {/* Hero Section */}
          <div className="bg-gradient-to-b from-surface-container-high/20 to-transparent px-6 py-12 border-b border-surface-container-low">
            <div className="animate-pulse">
              <div className="h-8 bg-surface-container-high rounded-lg w-48 mb-3"></div>
              <div className="h-4 bg-surface-container rounded-lg w-96"></div>
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-surface-container border border-surface-container-high rounded-xl p-6 animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-surface rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-surface rounded w-32 mb-2"></div>
                        <div className="h-3 bg-surface-container rounded w-24"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-surface rounded w-full"></div>
                      <div className="h-4 bg-surface rounded w-4/5"></div>
                      <div className="h-4 bg-surface rounded w-3/5"></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-6">
                <div className="bg-surface-container border border-surface-container-high rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-surface rounded w-32 mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-surface rounded w-24 mb-1"></div>
                          <div className="h-2 bg-surface-container rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!currentUserId) {
    return (
      <div className="flex h-full bg-surface">
        <main className="flex-1 overflow-y-auto no-scrollbar">
          {/* Hero Section */}
          <div className="px-6 py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-accent/10 rounded-full mb-6">
                <Users className="w-8 h-8 text-lime-accent" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Connect with the Community</h1>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Follow interesting users to see their questions, answers, and activity in your personalized feed
              </p>
            </div>
          </div>
          
          {/* Sign In CTA */}
          <div className="px-6 py-12">
            <div className="bg-surface-container border border-surface-container-high rounded-xl p-8 text-center mx-auto max-w-2xl">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-lime-accent/10 rounded-full mb-4">
                <Sparkles className="w-6 h-6 text-lime-accent" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">Sign in to Follow Users</h2>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                Join the community to follow experts, see their activity, and never miss important questions and answers.
              </p>
              <div className="flex items-center justify-center gap-4">
                <a 
                  href="/login" 
                  className="px-6 py-3 bg-surface-container border border-surface-container-high text-white rounded-lg hover:bg-surface-container-high/80 transition-colors"
                >
                  Log in
                </a>
                <a 
                  href="/signup" 
                  className="px-6 py-3 bg-lime-accent text-neutral font-semibold rounded-lg hover:bg-lime-accent/90 transition-colors"
                >
                  Sign up
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-surface">
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {/* Hero Section - Hidden on mobile */}
        <div className="hidden lg:block bg-gradient-to-b from-surface-container-high/20 to-transparent px-6 py-12 border-b border-surface-container-low">
          <div className="flex items-center gap-4 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-lime-accent/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-lime-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Following Feed</h1>
              <p className="text-white/60">Stay updated with activity from users you follow</p>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="px-6 py-8 space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Discover Users - First on mobile, right on desktop */}
          <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
            {/* Discover Users */}
            <div className="bg-surface-container border border-surface-container-high rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-lime-accent" />
                  Discover Users
                </h3>
              </div>
              <p className="text-sm text-white/60 mb-4">
                Find interesting people to follow and expand your network
              </p>
              <UserSearch
                currentUserId={currentUserId}
                placeholder="Search users to follow..."
                showFollowButtons={true}
                className="mb-4"
              />
            </div>
            
            {/* Following List */}
            <FollowingList currentUserId={currentUserId} />
            
            {/* Tips - Hidden on mobile */}
            <div className="hidden lg:block bg-gradient-to-br from-lime-accent/10 to-lime-accent/5 border border-lime-accent/20 rounded-xl p-6">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-lime-accent" />
                Pro Tips
              </h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-lime-accent mt-1">·</span>
                  <span>Follow experts in your field to get curated content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-accent mt-1">·</span>
                  <span>Engage with answers to build your reputation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-accent mt-1">·</span>
                  <span>Share your knowledge by answering questions</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Activity Feed - Second on mobile, left on desktop */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-surface-container border border-surface-container-high rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-lime-accent" />
                  Recent Activity
                </h2>
                <div className="text-xs text-white/40">
                  Live updates
                </div>
              </div>
              <ActivityFeed />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
