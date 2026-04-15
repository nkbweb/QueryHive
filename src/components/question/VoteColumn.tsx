'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUserVote, updateVote } from '@/lib/queries/votes'

interface VoteColumnProps {
  questionId: string
  initialUpvotes: number
}

export default function VoteColumn({ 
  questionId, 
  initialUpvotes
}: VoteColumnProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [currentUserVote, setCurrentUserVote] = useState(0)
  const [isVoting, setIsVoting] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isBookmarking, setIsBookmarking] = useState(false)

  // Fetch user's current vote and bookmark status on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Get user's vote from database
      const userVote = await getUserVote(user.id, 'question', questionId)
      setCurrentUserVote(userVote)

      // Check if question is bookmarked
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .single()

      setIsBookmarked(!error && !!data)
    }

    fetchUserData()
  }, [questionId])

  const handleVote = async (voteValue: 1 | -1 | 0) => {
    if (isVoting) return

    setIsVoting(true)
    const supabase = createClient()

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update vote using database function
      const success = await updateVote(user.id, 'question', questionId, voteValue)
      
      if (success) {
        // Update local state
        let newUpvotes = upvotes
        
        if (currentUserVote === voteValue) {
          // Remove vote if clicking same
          newUpvotes = upvotes - voteValue
          setCurrentUserVote(0)
        } else {
          // Change or add vote
          const voteDiff = voteValue - currentUserVote
          newUpvotes = upvotes + voteDiff
          setCurrentUserVote(voteValue)
        }
        
        setUpvotes(newUpvotes)
      }
    } catch (error) {
      console.error('Vote error:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const handleBookmark = async () => {
    if (isBookmarking) return

    setIsBookmarking(true)
    const supabase = createClient()

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('question_id', questionId)

        if (!error) {
          setIsBookmarked(false)
        }
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            question_id: questionId
          })

        if (!error) {
          setIsBookmarked(true)
        }
      }
    } catch (error) {
      console.error('Bookmark error:', error)
    } finally {
      setIsBookmarking(false)
    }
  }

  return (
    <aside className="w-[60px] flex flex-col items-center pt-8 sticky top-[48px] h-fit">
      {/* Upvote Button */}
      <button 
        onClick={() => handleVote(1)}
        disabled={isVoting}
        className={`transition-colors ${
          currentUserVote === 1 
            ? 'text-primary-container' 
            : 'text-white/30 hover:text-primary-container'
        }`}
      >
        <span className="material-symbols-outlined text-[32px]">
          arrow_drop_up
        </span>
      </button>

      {/* Vote Count */}
      <span className="font-mono font-bold text-xl leading-none my-1">
        {upvotes}
      </span>

      {/* Downvote Button */}
      <button 
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        className={`transition-colors ${
          currentUserVote === -1 
            ? 'text-error' 
            : 'text-white/30 hover:text-error'
        }`}
      >
        <span className="material-symbols-outlined text-[32px]">
          arrow_drop_down
        </span>
      </button>

      {/* Bookmark Button */}
      <button 
        onClick={handleBookmark}
        disabled={isBookmarking}
        className={`mt-4 transition-colors ${
          isBookmarked 
            ? 'text-primary-container' 
            : 'text-white/30 hover:text-primary-container'
        } ${isBookmarking ? 'opacity-50 cursor-wait' : ''}`}
        title={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
      >
        <span className="material-symbols-outlined text-[20px]">
          {isBookmarked ? 'bookmark' : 'bookmark_border'}
        </span>
      </button>
    </aside>
  )
}
