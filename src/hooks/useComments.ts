import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCommentVote(commentId: string, initialUpvotes: number = 0, initialDownvotes: number = 0) {
  const [isVoting, setIsVoting] = useState(false)
  const [currentUserVote, setCurrentUserVote] = useState(0)
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)

  useEffect(() => {
    const fetchUserVote = async (retryCount = 0) => {
      try {
        const response = await fetch(`/api/comments/${commentId}/vote`)
        console.log('Vote fetch response:', response.status, response.ok)
        if (response.ok) {
          const data = await response.json()
          console.log('Vote data received:', data)
          setCurrentUserVote(data.currentVote || 0)
        } else {
          console.error('Vote fetch failed:', response.status)
        }
      } catch (error) {
        console.error('Error fetching user vote:', error)
        // Retry on network errors
        if (retryCount < 2) {
          setTimeout(() => fetchUserVote(retryCount + 1), 100)
        }
      }
    }
    fetchUserVote()
  }, [commentId])

  const handleVote = async (voteValue: 1 | -1 | 0) => {
    if (isVoting) return
    setIsVoting(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      console.log('Submitting vote:', { commentId, voteValue, currentUserVote })

      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: voteValue })
      })

      console.log('Vote response status:', response.status, response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('Vote response data:', data)

        // Use the values from API response to ensure they match database
        setCurrentUserVote(data.currentVote || 0)
        setUpvotes(data.upvotes || 0)
        setDownvotes(data.downvotes || 0)

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

  return {
    isVoting,
    currentUserVote,
    upvotes,
    downvotes,
    handleVote
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
