'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import ActivityFeed from '@/components/follow/ActivityFeed'
import UserSearch from '@/components/search/UserSearch'
import FollowingList from '@/components/follow/FollowingList'
import { Users, TrendingUp, Sparkles, Zap } from 'lucide-react'

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

  /* ── Loading ──────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex h-full bg-[#050505]">
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <div className="px-6 pt-8 pb-4 border-b border-white/[0.05]">
            <div className="h-6 w-40 bg-white/[0.05] animate-pulse rounded mb-2" />
            <div className="h-3 w-64 bg-white/[0.04] animate-pulse rounded" />
          </div>
          <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-white/[0.03] border border-white/[0.04] rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="space-y-3">
              <div className="h-40 bg-white/[0.03] border border-white/[0.04] rounded-xl animate-pulse" />
              <div className="h-28 bg-white/[0.03] border border-white/[0.04] rounded-xl animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  /* ── Not signed in ────────────────────────────────────────── */
  if (!currentUserId) {
    return (
      <div className="flex h-full bg-[#050505]">
        <main className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center justify-center gap-6 px-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#E8FF47]/[0.07] border border-[#E8FF47]/15">
            <Users className="w-7 h-7 text-[#E8FF47]" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-medium text-white mb-2">Connect with the Community</h1>
            <p className="text-sm text-gray-500 max-w-sm">
              Follow interesting users to see their questions, answers, and activity in your personalised feed.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="px-5 py-2 border border-white/[0.1] text-sm text-gray-400 hover:text-white hover:border-white/20 transition-colors rounded">
              Log in
            </a>
            <a href="/signup" className="px-5 py-2 bg-[#E8FF47] text-black text-sm font-semibold hover:bg-[#d4e83f] transition-colors rounded">
              Sign up
            </a>
          </div>
        </main>
      </div>
    )
  }

  /* ── Authenticated ────────────────────────────────────────── */
  return (
    <div className="flex h-full bg-[#050505]">
      <main className="flex-1 overflow-y-auto no-scrollbar">

        {/* Header */}
        <header className="hidden lg:block px-6 pt-6 pb-5 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#E8FF47]/[0.07] border border-[#E8FF47]/15">
              <TrendingUp className="w-4 h-4 text-[#E8FF47]" />
            </div>
            <div>
              <h1 className="text-base font-medium text-white">Following Feed</h1>
              <p className="text-xs text-gray-600">Activity from users you follow</p>
            </div>
          </div>
        </header>

        {/* Body grid */}
        <div className="px-6 py-6 space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">

          {/* Right column — Discover (first on mobile, right on desktop) */}
          <div className="lg:col-span-1 order-1 lg:order-2 space-y-4">

            {/* Discover Users card */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#E8FF47]" />
                <h3 className="text-sm font-medium text-white">Discover Users</h3>
              </div>
              <p className="text-xs text-gray-600 mb-4">Find interesting people to follow</p>
              <UserSearch
                currentUserId={currentUserId}
                placeholder="Search users…"
                showFollowButtons={true}
                className="mb-0"
              />
            </div>

            {/* Following list */}
            <FollowingList currentUserId={currentUserId} />

            {/* Tips */}
            <div className="hidden lg:block bg-[#E8FF47]/[0.03] border border-[#E8FF47]/[0.08] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[#E8FF47]" />
                <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Pro Tips</h4>
              </div>
              <ul className="space-y-2">
                {[
                  'Follow experts in your field to get curated content',
                  'Engage with answers to build your reputation',
                  'Share your knowledge by answering questions',
                ].map(tip => (
                  <li key={tip} className="flex items-start gap-2 text-xs text-gray-500">
                    <span className="text-[#E8FF47]/50 mt-0.5 flex-shrink-0">·</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Left column — Activity feed (second on mobile, left on desktop) */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#E8FF47]" />
                  <h2 className="text-sm font-medium text-white">Recent Activity</h2>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <ActivityFeed />
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
