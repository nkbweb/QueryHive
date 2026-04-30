'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import NotificationsList from '@/components/notifications/NotificationsList'

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState('all')

  const fetchUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirect('/login')
    }
    setUser(user)
  }

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    const supabase = createClient()
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setNotifications(data || [])
  }, [user])

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [user, fetchNotifications])

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'votes', label: 'Votes' },
    { key: 'comments', label: 'Comments' },
    { key: 'answers', label: 'Answers' },
  ]

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'unread') return !notification.read
    if (activeFilter === 'votes') return notification.type === 'vote'
    if (activeFilter === 'comments') return notification.type === 'comment'
    if (activeFilter === 'answers') return notification.type === 'answer'
    return true
  })

  return (
    <div className="flex h-full bg-[#08080A]">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-3xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-white">Notifications</h1>
            <button
              className="px-4 py-2 text-sm bg-white/[0.05] border border-white/[0.1] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors rounded-lg"
            >
              Mark all as read
            </button>
          </div>

          {/* Mobile Filter Tabs */}
          <div className="lg:hidden mb-6">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {filters.map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors
                    ${activeFilter === filter.key
                      ? 'bg-[#E8FF47]/10 text-[#E8FF47] border border-[#E8FF47]/30'
                      : 'bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.1] border border-transparent'
                    }
                  `}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <NotificationsList notifications={filteredNotifications} />
        </div>
      </main>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[220px] h-full bg-[#131315] border-l border-[#1C1B1E] p-4">
        <h3 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-4">Filter</h3>
        <div className="flex flex-col gap-2">
          {filters.map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`
                px-3 py-2 text-sm rounded-lg text-left transition-colors
                ${activeFilter === filter.key
                  ? 'text-white bg-white/[0.05]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </aside>
    </div>
  )
}
