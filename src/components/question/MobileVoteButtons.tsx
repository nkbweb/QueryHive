'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUserVote, updateVote } from '@/lib/queries/votes'
import { ArrowBigUp, ArrowBigDown, Bookmark } from 'lucide-react'
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
    <div className="flex items-center gap-1.5 lg:hidden">
      {/* Bookmark */}
      <button
        onClick={handleBookmark}
        disabled={isBookmarking}
        className={`group p-2 rounded-lg transition-all duration-200 ${
          isBookmarked 
            ? 'text-[#E8FF47] bg-[#E8FF47]/10' 
            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
        } ${isBookmarking ? 'opacity-40 cursor-wait' : ''}`}
        title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
      >
        <Bookmark 
          className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${isBookmarked ? 'fill-current' : ''}`}
          strokeWidth={1.5}
        />
      </button>

      {/* Vote Pill Container */}
      <div className="flex items-center gap-0.5 bg-white/[0.03] border border-white/[0.08] rounded-full px-0.5 py-0.5">
        {/* Upvote */}
        <button
          onClick={() => handleVote(1)}
          disabled={isVoting}
          className={`group flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 ${
            currentUserVote === 1 
              ? 'text-[#E8FF47] bg-[#E8FF47]/10' 
              : 'text-white/40 hover:text-[#E8FF47]/70 hover:bg-white/5'
          } ${isVoting ? 'opacity-40 cursor-wait' : ''}`}
          title="Upvote"
        >
          <ArrowBigUp 
            className="w-5 h-5 transition-all duration-200 group-hover:scale-110"
            strokeWidth={1.5}
          />
        </button>

        {/* Vote Count */}
        <span className={`font-mono font-semibold text-sm leading-none tabular-nums select-none px-1 transition-colors duration-200 ${
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
          className={`group flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 ${
            currentUserVote === -1 
              ? 'text-red-400 bg-red-400/10' 
              : 'text-white/40 hover:text-red-400/70 hover:bg-white/5'
          } ${isVoting ? 'opacity-40 cursor-wait' : ''}`}
          title="Downvote"
        >
          <ArrowBigDown 
            className="w-5 h-5 transition-all duration-200 group-hover:scale-110"
            strokeWidth={1.5}
          />
        </button>
      </div>
      
      {/* Login Popup */}
      <LoginPopup 
        isOpen={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)}
        action={loginAction}
      />
    </div>
  )
}
