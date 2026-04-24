import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCommentVote(commentId: string) {
  const [isVoting, setIsVoting] = useState(false)
  const [currentUserVote, setCurrentUserVote] = useState(0)
  const [upvotes, setUpvotes] = useState(0)
  const [downvotes, setDownvotes] = useState(0)

  const handleVote = async (voteValue: 1 | -1 | 0) => {
    if (isVoting) return
    setIsVoting(true)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false
      if (currentUserVote !== 0 && voteValue !== 0) return false
      
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: voteValue })
      })

      if (response.ok) {
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
        return true
      }
      return false
    } catch (error) {
      console.error('Vote error:', error)
      return false
    } finally {
      setIsVoting(false)
    }
  }

  const initialize = (vote: number, up: number, down: number) => {
    setCurrentUserVote(vote)
    setUpvotes(up)
    setDownvotes(down)
  }

  return {
    isVoting,
    currentUserVote,
    upvotes,
    downvotes,
    handleVote,
    initialize
  }
}

export function useCommentActions(commentId: string) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = async (content: string) => {
    const supabase = createClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false
      
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() })
      })

      if (response.ok) {
        setIsEditing(false)
        return true
      }
      return false
    } catch (error) {
      console.error('Edit error:', error)
      return false
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return false
    
    setIsDeleting(true)
    const supabase = createClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false
      
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        return true
      }
      return false
    } catch (error) {
      console.error('Delete error:', error)
      return false
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    isEditing,
    setIsEditing,
    isDeleting,
    handleEdit,
    handleDelete
  }
}

export function useCommentReply(answerId: string, parentId?: string) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (content: string) => {
    if (!content.trim() || isSubmitting) return null
    
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          answerId,
          parentId
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.data
      }
      return null
    } catch (error) {
      console.error('Submit error:', error)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,
    handleSubmit
  }
}
