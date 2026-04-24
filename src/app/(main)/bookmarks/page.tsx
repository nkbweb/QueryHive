'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Bookmark {
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
    tags: Array<{
      id: string
      name: string
      color: string
    }>
  }
}

// Generate random colors for tags
const getRandomTagColor = (tagId: string) => {
  const colors = [
    '#E8FF47', // lime
    '#FF6B6B', // red
    '#4ECDC4', // teal
    '#45B7D1', // blue
    '#FFA07A', // light salmon
    '#98D8C8', // mint
    '#FFD93D', // yellow
    '#6BCF7F', // green
    '#C9B6E4', // lavender
    '#FFB6C1', // pink
    '#87CEEB', // sky blue
    '#F4A460', // sandy brown
  ]
  
  const index = tagId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return colors[index]
}

// Format date to show only date without time
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    const fetchBookmarks = async () => {
      try {
        const response = await fetch('/api/bookmarks')
        if (response.ok) {
          const data = await response.json()
          setBookmarks(data.bookmarks || [])
        }
      } catch (error) {
        console.error('Error fetching bookmarks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
    fetchBookmarks()
  }, [])

  const handleRemoveBookmark = async (questionId: string) => {
    try {
      const response = await fetch(`/api/bookmarks?questionId=${questionId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setBookmarks(prev => prev.filter(bookmark => bookmark.question.id !== questionId))
      }
    } catch (error) {
      console.error('Error removing bookmark:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Login</h1>
          <p className="text-white/60">You must be logged in to view your bookmarks.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading bookmarks...</div>
      </div>
    )
  }

  return (
    <main className="pt-[80px] pb-24 min-h-screen flex justify-center">
      <div className="flex gap-16 w-full max-w-[1020px] px-6">
        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-white mb-2">Bookmarks</h1>
            <p className="text-sm text-white/60">Questions you&apos;ve saved for later</p>
          </div>

          {bookmarks.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-lime-accent/20 to-blue-accent/20 rounded-full blur-xl"></div>
                <span className="material-symbols-outlined text-6xl text-lime-accent relative">bookmark_border</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-3 bg-gradient-to-r from-lime-accent to-blue-accent bg-clip-text text-transparent">No bookmarks yet</h2>
              <p className="text-white/60 mb-8 max-w-md mx-auto">Start bookmarking questions to build your personal collection and never lose track of important content</p>
              <Link 
                href="/home"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-lime-accent to-blue-accent hover:from-lime-accent/90 hover:to-blue-accent/90 text-background px-6 py-3 font-bold uppercase tracking-widest text-xs rounded-lg shadow-lg"
              >
                <span className="material-symbols-outlined text-[16px]">explore</span>
                Explore Questions
              </Link>
            </div>
          ) : (
            <div className="flex flex-col">
              {bookmarks.map((bookmark, index) => (
                <div key={bookmark.id} className="h-[52px] px-6 flex items-center gap-4 border-b border-white/[0.03] active-border-hover group">
                  {/* Bookmark Icon */}
                  <div className="w-10 text-[11px] font-label text-lime-accent/60 flex flex-col items-center group-hover:text-lime-accent">
                    <span className="material-symbols-outlined text-[16px]">bookmark</span>
                  </div>

                  {/* Status Dot */}
                  <div className="w-2.5 h-2.5 bg-lime-accent"></div>

                  {/* Content */}
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <div className="flex flex-col max-w-[600px]">
                      <Link 
                        href={`/questions/${bookmark.question.id}`}
                        className="text-sm text-white hover:text-lime-accent truncate"
                      >
                        {bookmark.question.title}
                      </Link>
                    </div>

                    {/* Right Info */}
                    <div className="flex items-center gap-6 text-[11px] text-white/30 font-label">
                      <span>{formatDate(bookmark.question.createdAt)}</span>
                      <span className="text-white/60">
                        {bookmark.question.answersCount} answers
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveBookmark(bookmark.question.id)}
                    className="text-white/30 hover:text-red-400 transition-colors"
                    title="Remove bookmark"
                  >
                    <span className="material-symbols-outlined text-[16px]">bookmark_remove</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
