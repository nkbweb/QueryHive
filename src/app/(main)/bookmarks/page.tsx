'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, ArrowBigUp, MessageSquare, Clock, Trash2, BookmarkX } from 'lucide-react'
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading'

interface BookmarkItem {
  id: string
  createdAt: string
  question: {
    id: string
    title: string
    content: string
    views: number
    upvotes: number
    createdAt: string
    username: string
    answersCount: number
    tags: Array<{ id: string; name: string; color: string }>
  }
}

const TAG_COLORS = [
  'text-cyan-300/80 bg-cyan-500/[0.07] border-cyan-400/15',
  'text-lime-300/80 bg-lime-500/[0.07] border-lime-400/15',
  'text-purple-300/80 bg-purple-500/[0.07] border-purple-400/15',
  'text-pink-300/80 bg-pink-500/[0.07] border-pink-400/15',
  'text-amber-300/80 bg-amber-500/[0.07] border-amber-400/15',
]

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

export default function BookmarksPage() {
  const { navigate } = useNavigationWithLoading()
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      try {
        const res = await fetch('/api/bookmarks')
        if (res.ok) {
          const data = await res.json()
          setBookmarks(data.bookmarks || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleRemove = async (questionId: string) => {
    setRemoving(questionId)
    try {
      const res = await fetch(`/api/bookmarks?questionId=${questionId}`, { method: 'DELETE' })
      if (res.ok) setBookmarks(prev => prev.filter(b => b.question.id !== questionId))
    } catch (e) {
      console.error(e)
    } finally {
      setRemoving(null)
    }
  }

  /* ── Auth guard ─────────────────────────────────────────── */
  if (!user && !loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#050505]">
        <div className="text-center">
          <Bookmark size={40} className="text-gray-700 mx-auto mb-4" />
          <h1 className="text-lg font-medium text-white mb-2">Sign in to view bookmarks</h1>
          <p className="text-sm text-gray-600">Save questions to access them anytime.</p>
        </div>
      </div>
    )
  }

  /* ── Loading skeleton ──────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex h-full flex-col bg-[#050505] border-x border-white/[0.05]">
        <header className="px-4 pt-6 pb-4 border-b border-white/[0.05]">
          <div className="h-6 w-32 bg-white/[0.05] animate-pulse rounded" />
        </header>
        <div className="flex-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-full h-12 border-b border-white/[0.03] flex items-center px-4 gap-6">
              <div className="w-16 h-3 bg-white/[0.05] animate-pulse rounded" />
              <div className="flex-1 h-3 bg-white/[0.05] animate-pulse rounded" />
              <div className="w-20 h-3 bg-white/[0.05] animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ── Empty state ────────────────────────────────────────── */
  if (bookmarks.length === 0) {
    return (
      <div className="flex h-full flex-col bg-[#050505] border-x border-white/[0.05]">
        <header className="px-4 pt-6 pb-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-medium text-white tracking-tight">Bookmarks</h1>
            <span className="text-[11px] font-mono bg-white/[0.05] text-gray-500 px-2 py-0.5 rounded border border-white/[0.05]">
              0 SAVED
            </span>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-600">
          <BookmarkX size={40} strokeWidth={1.5} />
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">No bookmarks yet</p>
            <p className="text-xs text-gray-700">Save questions you want to revisit</p>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="mt-2 px-4 py-1.5 border border-white/[0.08] text-xs text-gray-400 hover:text-white hover:border-white/20 transition-colors rounded"
          >
            Browse questions
          </button>
        </div>
      </div>
    )
  }

  /* ── Main list ──────────────────────────────────────────── */
  return (
    <section className="flex flex-col h-full bg-[#050505] border-x border-white/[0.05] min-w-0 overflow-hidden">

      {/* Header */}
      <header className="w-full px-4 pt-6 pb-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-medium text-white tracking-tight">Bookmarks</h1>
          <span className="text-[11px] font-mono bg-white/[0.05] text-gray-500 px-2 py-0.5 rounded border border-white/[0.05]">
            {bookmarks.length} SAVED
          </span>
        </div>
      </header>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence>
          {bookmarks.map((bm) => {
            const q = bm.question
            return (
              <motion.div
                key={bm.id}
                layout
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.2 }}
                className="group flex items-center w-full px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors gap-6 min-w-0"
              >
                {/* Stats column */}
                <div className="flex items-center gap-2 sm:gap-4 min-w-[40px] sm:min-w-[100px]">
                  <div className="flex items-center gap-1.5 min-w-[40px]">
                    <ArrowBigUp
                      size={16}
                      className={q.upvotes > 0 ? 'text-orange-500' : 'text-gray-700'}
                    />
                    <span className={`text-xs font-mono ${q.upvotes > 0 ? 'text-gray-200' : 'text-gray-600'}`}>
                      {q.upvotes}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    <MessageSquare
                      size={14}
                      className={q.answersCount > 0 ? 'text-blue-500' : 'text-gray-700'}
                    />
                    <span className="text-xs font-mono text-gray-600">{q.answersCount}</span>
                  </div>
                </div>

                {/* Title + tags */}
                <div
                  className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0 cursor-pointer"
                  onClick={() => navigate(`/questions/${q.id}`)}
                >
                  <h2 className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                    {q.title}
                  </h2>
                  {q.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {q.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={tag.id}
                          className={`px-2 py-0.5 border text-[10px] rounded font-medium ${TAG_COLORS[idx % TAG_COLORS.length]}`}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date + remove */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-600 font-mono">
                    <Clock size={12} />
                    <span>{formatDate(q.createdAt)}</span>
                  </div>
                  <button
                    onClick={() => handleRemove(q.id)}
                    disabled={removing === q.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-700 hover:text-red-400 disabled:text-gray-700 p-1"
                    title="Remove bookmark"
                  >
                    {removing === q.id ? (
                      <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
                      </svg>
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </section>
  )
}
