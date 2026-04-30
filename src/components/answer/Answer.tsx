'use client'

import Markdown from '@/lib/utils/markdown'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUserVote, updateVote } from '@/lib/queries/votes'
import { ChevronUp, ChevronDown, MessageCircle } from 'lucide-react'
import Comment from './Comment'
import CommentForm from './CommentForm'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import FollowButton from '@/components/follow/FollowButton'
import LoginPopup from '@/components/auth/LoginPopup'

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
      fullName?: string
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
  const [comments, setComments] = useState<any[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [showAllComments, setShowAllComments] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [loginAction, setLoginAction] = useState('')

  useEffect(() => {
    const fetchUserVote = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)
      const userVote = await getUserVote(user.id, 'answer', answer.id)
      setCurrentUserVote(userVote)
    }
    fetchUserVote()
  }, [answer.id])

  const fetchComments = useCallback(async () => {
    setIsLoadingComments(true)
    try {
      const response = await fetch(`/api/comments?answerId=${answer.id}`)
      const data = await response.json()
      if (data.success) {
        setComments(data.data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoadingComments(false)
    }
  }, [answer.id])

  useEffect(() => {
    // Fetch comments initially to get count
    fetchComments()
  }, [fetchComments])

  useEffect(() => {
    if (showComments) {
      // Refetch when showing comments to ensure latest data
      fetchComments()
    }
  }, [showComments, fetchComments])

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
      if (currentUserVote !== 0 && voteValue !== 0) return
      const success = await updateVote(user.id, 'answer', answer.id, voteValue)
      if (success) {
        let newUpvotes = upvotes
        let newDownvotes = downvotes
        if (currentUserVote === voteValue) {
          if (voteValue === 1) newUpvotes = upvotes - 1
          else if (voteValue === -1) newDownvotes = downvotes - 1
          setCurrentUserVote(0)
        } else {
          if (voteValue === 1) newUpvotes = upvotes + 1
          else if (voteValue === -1) newDownvotes = downvotes + 1
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
    <div className="py-5 border-b border-white/[0.06] last:border-0">

      {/* Badges */}
      {(isAccepted || answer.isAI) && (
        <div className="flex items-center gap-2 mb-3">
          {isAccepted && (
            <span className="inline-flex items-center gap-1 text-[10px] font-label font-semibold text-lime-accent uppercase tracking-wider">
              <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              Accepted
            </span>
          )}
          {answer.isAI && (
            <span className="inline-flex items-center gap-1 text-[10px] font-label font-semibold text-white/40 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                smart_toy
              </span>
              AI
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <Markdown content={answer.content} className="mb-5 text-white/80 text-sm leading-relaxed" />

      {/* Footer */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">

        {/* User Section */}
        <div className="flex items-start gap-3">
          <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
            <Image
              src={answer.user.avatarUrl || '/default-avatar.png'}
              alt={answer.user.username}
              width={32}
              height={32}
              style={{ width: 32, height: 32, objectFit: 'cover' }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <Link
                  href={`/profile/${answer.user.username}`}
                  className="text-[13px] text-white font-semibold hover:text-[#E8FF47] transition-colors truncate"
                >
                  {answer.user.fullName || answer.user.username}
                </Link>
              {/* Follow Button - Mobile Only */}
              {currentUserId !== answer.user.id && (
                <div className="sm:hidden flex-shrink-0">
                  <FollowButton
                    userId={answer.user.id}
                    username={answer.user.username}
                    currentUserId={currentUserId}
                    size="sm"
                    onLoginRequired={() => {
                      setLoginAction('follow')
                      setShowLoginPopup(true)
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <Link
                href={`/profile/${answer.user.username}`}
                className="text-[12px] text-white/40 font-medium hover:text-[#E8FF47] transition-colors"
              >
                @{answer.user.username}
              </Link>
              <span className="text-white/20 text-[10px]">·</span>
              <span className="text-[11px] text-white/30 font-label">
                {answer.user.reputation >= 1000
                  ? `${(answer.user.reputation / 1000).toFixed(1)}k`
                  : answer.user.reputation}
              </span>
              <span className="text-white/20 text-[10px]">·</span>
              <span className="text-[11px] text-white/30 font-label">{answer.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Votes and Comments - Properly aligned */}
        <div className="flex items-center gap-4 sm:gap-3">
          <button
            onClick={() => handleVote(1)}
            disabled={isVoting}
            className={`flex items-center gap-1 transition-colors duration-150 ${
              currentUserVote === 1 ? 'text-lime-accent' : 'text-white/25 hover:text-white/60'
            }`}
          >
            <ChevronUp className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-[11px] font-mono tabular-nums">{upvotes}</span>
          </button>

          <button
            onClick={() => handleVote(-1)}
            disabled={isVoting}
            className={`flex items-center gap-1 transition-colors duration-150 ${
              currentUserVote === -1 ? 'text-error' : 'text-white/25 hover:text-white/60'
            }`}
          >
            <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-[11px] font-mono tabular-nums">{downvotes}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1 transition-colors duration-150 ${
              showComments ? 'text-lime-accent' : 'text-white/25 hover:text-white/60'
            }`}
            title={`${showComments ? 'Hide' : 'Show'} comments`}
          >
            <MessageCircle className={`w-5 h-5 sm:w-6 sm:h-6 ${showComments ? 'fill-current' : ''}`} />
            <span className="text-[11px] font-mono tabular-nums">{comments.length}</span>
          </button>

          {/* Follow Button - Desktop Only */}
          {currentUserId !== answer.user.id && (
            <div className="hidden sm:block ml-auto">
              <FollowButton
                userId={answer.user.id}
                username={answer.user.username}
                currentUserId={currentUserId}
                size="sm"
                onLoginRequired={() => {
                  setLoginAction('follow')
                  setShowLoginPopup(true)
                }}
              />
            </div>
          )}
        </div>

      </div>

      {/* Login Popup */}
      <LoginPopup 
        isOpen={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)}
        action={loginAction}
      />

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <div className="mt-4">
            {isLoadingComments && (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            )}
            {!isLoadingComments && (
              <>
                {/* Top-level Comment Form */}
                <CommentForm
                  answerId={answer.id}
                  onCommentAdded={(newComment) => {
                    setComments([...comments, newComment])
                  }}
                />

                {/* Comments List */}
                {comments.length > 0 && (
                  <div className="mt-4">
                    {comments
                      .filter(c => !c.parentId)
                      .slice(0, showAllComments ? undefined : 3)
                      .map(comment => (
                        <Comment
                          key={comment.id}
                        comment={comment}
                        allComments={comments}
                        setAllComments={setComments}
                        onReply={setReplyingTo}
                        replyingTo={replyingTo}
                        currentUserId={currentUserId}
                        answerId={answer.id}
                      />
                    ))}
                  {comments.filter(c => !c.parentId).length > 3 && !showAllComments && (
                    <button
                      onClick={() => setShowAllComments(true)}
                      className="mt-3 text-[11px] text-white/30 hover:text-white/60 font-label transition-colors"
                    >
                      Show more comments
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      )}
    </div>
  )
}