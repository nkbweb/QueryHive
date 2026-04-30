'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUserVote, updateVote } from '@/lib/queries/votes'
import LoginPopup from '@/components/auth/LoginPopup'

interface MobileVoteButtonsProps {
  questionId: string
  initialUpvotes: number
}

export default function MobileVoteButtons({ questionId, initialUpvotes }: MobileVoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [currentUserVote, setCurrentUserVote] = useState(0)
  const [isVoting, setIsVoting] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isBookmarking, setIsBookmarking] = useState(false)
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loginAction, setLoginAction] = useState<string>('')

  useEffect(() => {
    const fetchUserData = async (retryCount = 0) => {
      try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        // Handle auth lock errors by retrying
        if (error && error.message?.includes('Lock') && retryCount < 2) {
          setTimeout(() => fetchUserData(retryCount + 1), 100)
          return
        }

        if (error) {
          console.error('Error getting user:', error)
          return
        }

        setCurrentUserId(user?.id || null)
        
        if (user) {
          // Fetch user's vote and bookmark status
          const userVote = await getUserVote(user.id, 'question', questionId)
          setCurrentUserVote(userVote)

          const { data, error: bookmarkError } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('question_id', questionId)
            .maybeSingle()

          setIsBookmarked(!bookmarkError && !!data)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [questionId])

  const checkAuthAndShowPopup = (action: string) => {
    if (!currentUserId) {
      setLoginAction(action)
      setShowLoginPopup(true)
      return false
    }
    return true
  }

  const handleVote = async (voteValue: 1 | -1 | 0) => {
    if (!checkAuthAndShowPopup('vote')) return
    if (isVoting) return
    setIsVoting(true)
    const supabase = createClient()

    try {
      if (!currentUserId) return

      const success = await updateVote(currentUserId, 'question', questionId, voteValue)
      
      if (success) {
        let newUpvotes = upvotes
        if (currentUserVote === voteValue) {
          newUpvotes = upvotes - voteValue
          setCurrentUserVote(0)
        } else {
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
    if (!checkAuthAndShowPopup('bookmark')) return
    if (isBookmarking) return
    setIsBookmarking(true)
    const supabase = createClient()

    try {
      if (!currentUserId) return

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', currentUserId)
          .eq('question_id', questionId)

        if (!error) {
          setIsBookmarked(false)
        }
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: currentUserId,
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
    <div className="flex items-center gap-2 lg:hidden">
      {/* Bookmark */}
      <button
        onClick={handleBookmark}
        disabled={isBookmarking}
        className={`p-2 rounded-lg transition-all duration-150 ${
          isBookmarked ? 'text-white/70 bg-white/10' : 'text-white/40 hover:text-white/60 hover:bg-white/5'
        } ${isBookmarking ? 'opacity-40 cursor-wait' : ''}`}
        title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
      >
        <span className="material-symbols-outlined text-[20px] leading-none">
          {isBookmarked ? 'bookmark' : 'bookmark_border'}
        </span>
      </button>

      {/* Upvote */}
      <button
        onClick={() => handleVote(1)}
        disabled={isVoting}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-150 ${
          currentUserVote === 1 
            ? 'text-[#E8FF47] bg-[#E8FF47]/10' 
            : 'text-white/40 hover:text-white/60 hover:bg-white/5'
        } ${isVoting ? 'opacity-40 cursor-wait' : ''}`}
        title="Upvote"
      >
        <span className="material-symbols-outlined text-[20px] leading-none">
          {currentUserVote === 1 ? 'arrow_upward' : 'arrow_upward_alt'}
        </span>
      </button>

      {/* Vote Count */}
      <span className={`font-mono font-semibold text-sm leading-none tabular-nums select-none transition-colors duration-150 ${
        currentUserVote === 1 ? 'text-[#E8FF47]' :
        currentUserVote === -1 ? 'text-red-400' :
        'text-white/60'
      }`}>
        {upvotes}
      </span>

      {/* Downvote */}
      <button
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-150 ${
          currentUserVote === -1 
            ? 'text-red-400 bg-red-400/10' 
            : 'text-white/40 hover:text-white/60 hover:bg-white/5'
        } ${isVoting ? 'opacity-40 cursor-wait' : ''}`}
        title="Downvote"
      >
        <span className="material-symbols-outlined text-[20px] leading-none">
          {currentUserVote === -1 ? 'arrow_downward' : 'arrow_downward_alt'}
        </span>
      </button>
      
      {/* Login Popup */}
      <LoginPopup 
        isOpen={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)}
        action={loginAction}
      />
    </div>
  )
}
