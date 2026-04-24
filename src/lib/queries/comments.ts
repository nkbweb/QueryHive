import { createSupabaseServerClient } from '@/lib/supabase/server'

function formatTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()

  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export async function getCommentsByAnswerId(answerId: string) {
  const supabase = createSupabaseServerClient()

  // Use the recursive function to get the comment tree
  const { data, error } = await supabase
    .rpc('get_comment_tree', { p_answer_id: answerId })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  // Fetch user profiles for all comments
  const userIds = Array.from(new Set(data?.map((c: any) => c.user_id) || []))
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, reputation')
    .in('id', userIds)

  const profileMap = new Map(
    profiles?.map((p: any) => [p.id, p]) || []
  )

  return (data || []).map((comment: any) => {
    const profile = profileMap.get(comment.user_id)
    return {
      id: comment.id,
      content: comment.content,
      parentId: comment.parent_id,
      upvotes: comment.upvotes || 0,
      downvotes: comment.downvotes || 0,
      depth: comment.depth || 0,
      createdAt: formatTime(comment.created_at),
      updatedAt: formatTime(comment.updated_at),
      user: {
        id: profile?.id,
        username: profile?.username || 'Unknown',
        fullName: profile?.full_name,
        avatarUrl: profile?.avatar_url,
        reputation: profile?.reputation || 0
      }
    }
  })
}

export async function createComment(commentData: {
  content: string
  answerId: string
  userId: string
  parentId?: string
}) {
  const supabase = createSupabaseServerClient()

  // First, try to get the user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, reputation')
    .eq('id', commentData.userId)
    .single()

  // If profile doesn't exist, try to get from auth.users
  let userProfile = profile
  if (!profile) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      userProfile = {
        id: user.id,
        username: user.user_metadata?.username || 'Unknown',
        full_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        reputation: 0
      }
    }
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      content: commentData.content,
      answer_id: commentData.answerId,
      user_id: commentData.userId,
      parent_id: commentData.parentId || null,
      upvotes: 0,
      downvotes: 0
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    return null
  }

  return {
    id: data.id,
    content: data.content,
    parentId: data.parent_id,
    upvotes: data.upvotes || 0,
    downvotes: data.downvotes || 0,
    depth: 0,
    createdAt: formatTime(data.created_at),
    updatedAt: formatTime(data.updated_at),
    user: {
      id: userProfile?.id || commentData.userId,
      username: userProfile?.username || 'Unknown',
      fullName: userProfile?.full_name,
      avatarUrl: userProfile?.avatar_url,
      reputation: userProfile?.reputation || 0
    }
  }
}

export async function updateComment(commentId: string, content: string, userId: string) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating comment:', error)
    return null
  }

  return data
}

export async function deleteComment(commentId: string, userId: string) {
  const supabase = createSupabaseServerClient()

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting comment:', error)
    return false
  }

  return true
}

export async function voteOnComment(commentId: string, userId: string, value: number) {
  const supabase = createSupabaseServerClient()

  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', userId)
    .eq('target_type', 'comment')
    .eq('target_id', commentId)
    .single()

  if (existingVote) {
    // Update existing vote
    if (value === 0) {
      // Remove vote
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', existingVote.id)

      if (error) {
        console.error('Error removing vote:', error)
        return null
      }
    } else {
      // Update vote value
      const { data, error } = await supabase
        .from('votes')
        .update({ value })
        .eq('id', existingVote.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating vote:', error)
        return null
      }
      return data
    }
  } else {
    // Create new vote
    const { data, error } = await supabase
      .from('votes')
      .insert({
        user_id: userId,
        target_type: 'comment',
        target_id: commentId,
        value
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating vote:', error)
      return null
    }
    return data
  }

  return null
}

export async function getUserCommentVote(commentId: string, userId: string) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('votes')
    .select('value')
    .eq('user_id', userId)
    .eq('target_type', 'comment')
    .eq('target_id', commentId)
    .single()

  if (error || !data) {
    return 0
  }

  return data.value
}
