'use client'

import { useState, useEffect } from 'react'
import { useCommentReply } from '@/hooks/useComments'
import { createClient } from '@/lib/supabase/client'
import LoginPopup from '@/components/auth/LoginPopup'

interface CommentFormProps {
  answerId: string
  parentId?: string
  onCommentAdded?: (comment: any) => void
}

export default function CommentForm({ answerId, parentId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const { isSubmitting, handleSubmit } = useCommentReply(answerId, parentId)

  useEffect(() => {
    const fetchUserId = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    fetchUserId()
  }, [])

  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    if (!currentUserId) {
      setShowLoginPopup(true)
      return
    }

    const newComment = await handleSubmit(content)
    if (newComment) {
      setContent('')
      onCommentAdded?.(newComment)
    }
  }

  return (
    <>
      <form onSubmit={onSubmitForm} className="mt-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? 'Write a reply...' : 'Add a comment...'}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/80 text-sm resize-none focus:outline-none focus:border-white/20"
          rows={2}
        />
        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="px-3 py-1 bg-lime-accent text-black text-xs font-medium rounded hover:bg-lime-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : parentId ? 'Reply' : 'Comment'}
          </button>
        </div>
      </form>
      <LoginPopup 
        isOpen={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)}
        action={parentId ? 'reply' : 'comment'}
      />
    </>
  )
}
