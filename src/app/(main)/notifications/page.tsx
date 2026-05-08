'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ArrowUpCircle, MessageSquare, MessageCircle, CheckCircle, UserPlus, BellOff, CheckCheck } from 'lucide-react'
import Link from 'next/link'

type NotifType = 'vote' | 'comment' | 'answer' | 'verification' | 'follow'

interface Notification {
  id: string
  type: NotifType
  title: string
  message: string
  read: boolean
  created_at: string
  link?: string
}

const FILTERS = [
  { key: 'all',       label: 'All' },
  { key: 'unread',   label: 'Unread' },
  { key: 'votes',    label: 'Votes' },
  { key: 'answers',  label: 'Answers' },
  { key: 'comments', label: 'Comments' },
] as const

type FilterKey = typeof FILTERS[number]['key']

const TYPE_CONFIG: Record<NotifType, { icon: React.ReactNode; color: string; dot: string }> = {
  vote:         { icon: <ArrowUpCircle size={16} />,  color: 'text-[#E8FF47]',   dot: 'bg-[#E8FF47]'  },
  answer:       { icon: <MessageSquare size={16} />,  color: 'text-blue-400',    dot: 'bg-blue-400'   },
  comment:      { icon: <MessageCircle size={16} />,  color: 'text-purple-400',  dot: 'bg-purple-400' },
  verification: { icon: <CheckCircle size={16} />,    color: 'text-emerald-400', dot: 'bg-emerald-400'},
  follow:       { icon: <UserPlus size={16} />,       color: 'text-pink-400',    dot: 'bg-pink-400'   },
}

const formatTime = (d: string) => {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setNotifications(data || [])
      setLoading(false)
    }
    init()
  }, [])

  const filtered = notifications.filter(n => {
    if (activeFilter === 'all')      return true
    if (activeFilter === 'unread')   return !n.read
    if (activeFilter === 'votes')    return n.type === 'vote'
    if (activeFilter === 'answers')  return n.type === 'answer'
    if (activeFilter === 'comments') return n.type === 'comment'
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    // optimistic
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    await Promise.all(
      notifications.filter(n => !n.read).map(n =>
        fetch(`/api/notifications/${n.id}`, { method: 'PATCH' })
      )
    )
  }

  return (
    <section className="flex flex-col h-full bg-[#050505] border-x border-white/[0.05] min-w-0 overflow-hidden">

      {/* Header */}
      <header className="w-full px-4 pt-6 pb-2 border-b border-white/[0.05]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-medium text-white tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="text-[11px] font-mono bg-[#E8FF47]/10 text-[#E8FF47] px-2 py-0.5 rounded border border-[#E8FF47]/20">
                {unreadCount} NEW
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs — identical pattern to QuestionFeed */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`relative px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                activeFilter === f.key ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {f.label}
              {activeFilter === f.key && (
                <motion.div
                  layoutId="notifTabBorder"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white shadow-[0_-2px_6px_rgba(255,255,255,0.3)]"
                />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-full px-4 py-3.5 border-b border-white/[0.03] flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/[0.05] animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/[0.05] animate-pulse rounded w-3/4" />
                    <div className="h-2.5 bg-white/[0.04] animate-pulse rounded w-1/2" />
                  </div>
                  <div className="w-10 h-2.5 bg-white/[0.04] animate-pulse rounded" />
                </div>
              ))}
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-3 h-48 text-gray-600"
            >
              <BellOff size={28} strokeWidth={1.5} />
              <span className="text-sm">No notifications here</span>
            </motion.div>
          ) : (
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {filtered.map(n => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG['vote']
                const Row = (
                  <div
                    className={`group flex items-start w-full px-4 py-3.5 border-b border-white/[0.03] gap-4 transition-colors cursor-pointer ${
                      !n.read
                        ? 'bg-white/[0.015] hover:bg-white/[0.03]'
                        : 'hover:bg-white/[0.02]'
                    }`}
                    onClick={() => !n.read && markAsRead(n.id)}
                  >
                    {/* Icon badge */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.04] ${cfg.color}`}>
                      {cfg.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${n.read ? 'text-gray-400' : 'text-white'}`}>
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{n.message}</p>
                      )}
                    </div>

                    {/* Right: time + unread dot */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-[11px] font-mono text-gray-700">{formatTime(n.created_at)}</span>
                      {!n.read && <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                    </div>
                  </div>
                )

                return n.link ? (
                  <Link key={n.id} href={n.link}>{Row}</Link>
                ) : (
                  <div key={n.id}>{Row}</div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
