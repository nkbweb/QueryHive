'use client'

import Markdown from '@/lib/utils/markdown'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUserVote, updateVote } from '@/lib/queries/votes'

interface AnswerProps {
  answer: {
    id: string
    content: string
    upvotes: number
    downvotes: number
    verificationCount: number
    flagCount: number
    isAI: boolean
    status: string
    createdAt: string
    updatedAt: string
    user: {
      id: string
      username: string
      avatarUrl?: string
      reputation: number
    }
  }
  isAccepted?: boolean
}

export default function Answer({ answer, isAccepted = false }: AnswerProps) {
  const [currentUserVote, setCurrentUserVote] = useState(0)
  const [isVoting, setIsVoting] = useState(false)
  const [upvotes, setUpvotes] = useState(answer.upvotes)
  const [downvotes, setDownvotes] = useState(answer.downvotes)

  // Fetch user's current vote on component mount
  useEffect(() => {
    const fetchUserVote = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Get user's vote from database
      const userVote = await getUserVote(user.id, 'answer', answer.id)
      setCurrentUserVote(userVote)
    }

    fetchUserVote()
  }, [answer.id])

  const handleVote = async (voteValue: 1 | -1 | 0) => {
    if (isVoting) return

    setIsVoting(true)
    const supabase = createClient()

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Prevent double voting - user can only upvote OR downvote, not both
      if (currentUserVote !== 0 && voteValue !== 0) {
        console.log('User already voted, preventing double vote')
        return
      }

      // Update vote using database function
      const success = await updateVote(user.id, 'answer', answer.id, voteValue)
      
      if (success) {
        // Update local state
        let newUpvotes = upvotes
        let newDownvotes = downvotes
        
        if (currentUserVote === voteValue) {
          // Remove vote if clicking same
          if (voteValue === 1) {
            newUpvotes = upvotes - 1
          } else if (voteValue === -1) {
            newDownvotes = downvotes - 1
          }
          setCurrentUserVote(0)
        } else {
          // Change or add vote
          if (voteValue === 1) {
            newUpvotes = upvotes + 1
          } else if (voteValue === -1) {
            newDownvotes = downvotes + 1
          }
          setCurrentUserVote(voteValue)
        }
        
        setUpvotes(newUpvotes)
        setDownvotes(newDownvotes)
      }
    } catch (error) {
      console.error('Vote error:', error)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {isAccepted && (
          <span className="text-xs font-bold text-lime-accent flex items-center gap-1 bg-lime-accent/15 px-3 py-1.5 rounded-full border border-lime-accent/30">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            Community Verified
          </span>
        )}
        
        {answer.isAI && (
          <span className="text-xs font-bold text-blue-accent flex items-center gap-1 bg-blue-accent/15 px-3 py-1.5 rounded-full border border-blue-accent/30">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              smart_toy
            </span>
            AI Generated
          </span>
        )}
      </div>
      
      <Markdown content={answer.content} className="mb-8 text-white/95" />

      <div className="flex items-center justify-between">
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="text-[11px] text-white/50 hover:text-lime-accent hover:bg-lime-accent/10 px-3 py-1.5 rounded-lg font-label uppercase tracking-tight transition-all duration-200">
            Share
          </button>
          <button className="text-[11px] text-white/50 hover:text-lime-accent hover:bg-lime-accent/10 px-3 py-1.5 rounded-lg font-label uppercase tracking-tight transition-all duration-200">
            Edit
          </button>
          <button className="text-[11px] text-white/50 hover:text-lime-accent hover:bg-lime-accent/10 px-3 py-1.5 rounded-lg font-label uppercase tracking-tight transition-all duration-200">
            Follow
          </button>
        </div>
        
        {/* User Info and Vote Buttons */}
        <div className="flex items-center gap-3">
          <div className="text-[11px] text-white/40 font-label">
            answered {answer.createdAt}
          </div>
          <div className="flex items-center gap-2">
            <Image 
              className="w-6 h-6 rounded-sm object-cover" 
              src={answer.user.avatarUrl || '/default-avatar.png'} 
              alt={answer.user.username}
              width={24}
              height={24}
            />
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-white/95">{answer.user.username}</span>
              <span className="text-[11px] text-white/70 font-label">
                {answer.user.reputation >= 1000 
                  ? `${(answer.user.reputation / 1000).toFixed(1)}k` 
                  : answer.user.reputation.toString()} rep
              </span>
            </div>
          </div>

          {/* Vote Buttons */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handleVote(1)}
              disabled={isVoting}
              className={`flex items-center gap-1 transition-all duration-200 ${
                currentUserVote === 1 
                  ? 'text-lime-accent' 
                  : 'text-white/50 hover:text-lime-accent'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                arrow_drop_up
              </span>
              <span className="text-xs font-medium">{upvotes}</span>
            </button>
            
            <button 
              onClick={() => handleVote(-1)}
              disabled={isVoting}
              className={`flex items-center gap-1 transition-all duration-200 ${
                currentUserVote === -1 
                  ? 'text-error' 
                  : 'text-white/50 hover:text-error'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                arrow_drop_down
              </span>
              <span className="text-xs font-medium">{downvotes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
