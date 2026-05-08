'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUserVote, updateVote } from '@/lib/queries/votes'
import { ArrowBigUp, ArrowBigDown, Bookmark } from 'lucide-react'
import LoginPopup from '@/components/auth/LoginPopup'

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [loginAction, setLoginAction] = useState('')

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

        if (!user) return

        setCurrentUserId(user.id)

        const userVote = await getUserVote(user.id, 'question', questionId)
        setCurrentUserVote(userVote)

        const { data, error: bookmarkError } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('question_id', questionId)
          .maybeSingle()

        setIsBookmarked(!bookmarkError && !!data)
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const success = await updateVote(user.id, 'question', questionId, voteValue)
      
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('question_id', questionId)
        if (!error) setIsBookmarked(false)
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({ user_id: user.id, question_id: questionId })
        if (!error) setIsBookmarked(true)
      }
    } catch (error) {
      console.error('Bookmark error:', error)
    } finally {
      setIsBookmarking(false)
    }
  }

  return (
    <aside className="w-[52px] flex flex-col items-center sticky top-[48px] h-fit gap-0.5">

      {/* Upvote */}
      <button
        onClick={() => handleVote(1)}
        disabled={isVoting}
        className={`group p-1 transition-all duration-200 ${
          currentUserVote === 1 ? 'text-[#E8FF47]' : 'text-white/30 hover:text-[#E8FF47]/70'
        } ${isVoting ? 'opacity-40 cursor-wait' : ''}`}
        title="Upvote"
      >
        <ArrowBigUp 
          className="w-7 h-7 transition-all duration-200 group-hover:scale-110 group-hover:-translate-y-0.5 block"
          strokeWidth={1.5}
        />
      </button>

      {/* Count */}
      <span className={`font-mono font-semibold text-base leading-none tabular-nums select-none transition-colors duration-200 ${
        currentUserVote === 1 ? 'text-[#E8FF47]' :
        currentUserVote === -1 ? 'text-red-400' :
        'text-white/50'
      }`}>
        {upvotes}
      </span>

      {/* Downvote */}
      <button
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        className={`group p-1 transition-all duration-200 ${
          currentUserVote === -1 ? 'text-red-400' : 'text-white/30 hover:text-red-400/70'
        } ${isVoting ? 'opacity-40 cursor-wait' : ''}`}
        title="Downvote"
      >
        <ArrowBigDown 
          className="w-7 h-7 transition-all duration-200 group-hover:scale-110 group-hover:translate-y-0.5 block"
          strokeWidth={1.5}
        />
      </button>

      {/* Divider */}
      <div className="w-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-3" />

      {/* Bookmark */}
      <button
        onClick={handleBookmark}
        disabled={isBookmarking}
        className={`group p-1.5 rounded-lg transition-all duration-200 ${
          isBookmarked 
            ? 'text-[#E8FF47] bg-[#E8FF47]/10' 
            : 'text-white/30 hover:text-white/70 hover:bg-white/5'
        } ${isBookmarking ? 'opacity-40 cursor-wait' : ''}`}
        title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
      >
        <Bookmark 
          className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 block ${isBookmarked ? 'fill-current' : ''}`} 
          strokeWidth={1.5}
        />
      </button>

      {/* Login Popup */}
      <LoginPopup 
        isOpen={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)}
        action={loginAction}
      />

    </aside>
  )
}