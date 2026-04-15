'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface BookmarkButtonProps {
  questionId: string
  isBookmarked?: boolean
  onBookmarkChange?: (isBookmarked: boolean) => void
}

export default function BookmarkButton({ 
  questionId, 
  isBookmarked: initialBookmarked = false,
  onBookmarkChange 
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleBookmark = async () => {
    if (!user) return

    setLoading(true)
    const supabase = createClient()

    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(`/api/bookmarks?questionId=${questionId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setIsBookmarked(false)
          onBookmarkChange?.(false)
        }
      } else {
        // Add bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ questionId })
        })
        
        if (response.ok) {
          setIsBookmarked(true)
          onBookmarkChange?.(true)
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBookmark}
      disabled={!user || loading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        !user 
          ? 'text-white/40 cursor-not-allowed'
          : isBookmarked
            ? 'bg-lime-accent/20 text-lime-accent border border-lime-accent/40 hover:bg-lime-accent/30'
            : 'bg-surface-container/50 text-white/60 border border-white/20 hover:bg-surface-container hover:text-white hover:border-white/40'
      } ${loading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
      title={!user ? 'Please login to bookmark' : isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
    >
      <span className="material-symbols-outlined text-[16px]">
        {isBookmarked ? 'bookmark' : 'bookmark_border'}
      </span>
      <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
    </button>
  )
}
