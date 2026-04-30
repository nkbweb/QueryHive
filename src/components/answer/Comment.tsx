'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCommentVote, useCommentReply } from '@/hooks/useComments'
import { createClient } from '@/lib/supabase/client'
import LoginPopup from '@/components/auth/LoginPopup'

interface CommentProps {
  comment: {
    id: string
    content: string
    parentId: string | null
    upvotes: number
    downvotes: number
    depth: number
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
  allComments: CommentProps['comment'][]
  setAllComments: (comments: CommentProps['comment'][]) => void
  onReply: (parentId: string | null) => void
  replyingTo: string | null
  currentUserId?: string
  answerId: string
}

export default function Comment({ 
  comment, 
  allComments, 
  setAllComments,
  onReply, 
  replyingTo,
  currentUserId,
  answerId
}: CommentProps) {
  const { isVoting, currentUserVote, upvotes, downvotes, handleVote } = useCommentVote(comment.id, comment.upvotes, comment.downvotes)
  const { isSubmitting: isReplySubmitting, handleSubmit: handleReplySubmit } = useCommentReply(answerId, comment.id)
  const [replyContent, setReplyContent] = useState('')
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [loginAction, setLoginAction] = useState('')

  const childComments = allComments.filter(c => c.parentId === comment.id)

  const checkAuthAndShowPopup = (action: string) => {
    if (!currentUserId) {
      setLoginAction(action)
      setShowLoginPopup(true)
      return false
    }
    return true
  }

  const onReplySubmit = async () => {
    if (!checkAuthAndShowPopup('reply')) return
    const newComment = await handleReplySubmit(replyContent)
    if (newComment) {
      setReplyContent('')
      onReply(null)
      setAllComments([...allComments, newComment])
    }
  }

  return (
    <div className={`${comment.depth > 0 ? 'ml-8 mt-3' : 'mt-4'}`}>
      <div className="flex gap-3 items-start">
        {/* Avatar */}
        <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
          <Image
            src={comment.user.avatarUrl || '/default-avatar.png'}
            alt={comment.user.username}
            width={32}
            height={32}
            style={{ width: 32, height: 32, objectFit: 'cover' }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-1">
            <div className="text-[13px] text-white font-semibold">{comment.user.fullName || comment.user.username}</div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-white/40 font-medium">@{comment.user.username}</span>
              <span className="text-white/20 text-[10px]">·</span>
              <span className="text-[11px] text-white/30 font-label">
                {comment.user.reputation >= 1000
                  ? `${(comment.user.reputation / 1000).toFixed(1)}k`
                  : comment.user.reputation}
              </span>
              <span className="text-white/20 text-[10px]">·</span>
              <span className="text-[11px] text-white/30 font-label">{comment.createdAt}</span>
            </div>
          </div>

          {/* Comment Content */}
          <p className="text-white/70 text-sm leading-relaxed mb-2">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Reply */}
            <button
              onClick={() => {
                if (!checkAuthAndShowPopup('reply')) return
                onReply(comment.id)
              }}
              className="text-[11px] text-white/30 hover:text-white/60 font-label transition-colors"
            >
              Reply
            </button>

            {/* Votes */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!checkAuthAndShowPopup('vote')) return
                  handleVote(1)
                }}
                disabled={isVoting}
                className={`flex items-center gap-0.5 transition-colors duration-150 ${
                  currentUserVote === 1 ? 'text-lime-accent' : 'text-white/25 hover:text-white/60'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">arrow_drop_up</span>
                <span className="text-[11px] font-mono tabular-nums">{upvotes}</span>
              </button>

              <button
                onClick={() => {
                  if (!checkAuthAndShowPopup('vote')) return
                  handleVote(-1)
                }}
                disabled={isVoting}
                className={`flex items-center gap-0.5 transition-colors duration-150 ${
                  currentUserVote === -1 ? 'text-error' : 'text-white/25 hover:text-white/60'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                <span className="text-[11px] font-mono tabular-nums">{downvotes}</span>
              </button>
            </div>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/80 text-sm resize-none focus:outline-none focus:border-white/20"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    onReply(null)
                    setReplyContent('')
                  }
                }}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={onReplySubmit}
                  disabled={!replyContent.trim() || isReplySubmitting}
                  className="px-3 py-1 bg-lime-accent text-black text-xs font-medium rounded hover:bg-lime-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isReplySubmitting ? 'Posting...' : 'Reply'}
                </button>
                <button
                  onClick={() => {
                    onReply(null)
                    setReplyContent('')
                  }}
                  className="px-3 py-1 bg-white/10 text-white text-xs font-medium rounded hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Login Popup */}
          <LoginPopup 
            isOpen={showLoginPopup} 
            onClose={() => setShowLoginPopup(false)}
            action={loginAction}
          />

          {/* Nested Comments */}
          {childComments.length > 0 && (
            <div className="mt-3">
              {childComments.map(child => (
                <Comment
                  key={child.id}
                  comment={child}
                  allComments={allComments}
                  setAllComments={setAllComments}
                  onReply={onReply}
                  replyingTo={replyingTo}
                  currentUserId={currentUserId}
                  answerId={answerId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
