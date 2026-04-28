import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getProfileByUsername(username: string) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

export async function updateProfile(userId: string, updates: {
  full_name?: string
  username?: string
  avatar_url?: string
}) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }

  return data
}

export async function getUserQuestions(userId: string) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('questions')
    .select('id, title, upvotes, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching user questions:', error)
    return []
  }

  return data || []
}

export async function getUserAnswers(userId: string) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('answers')
    .select('id, content, upvotes, created_at, question_id, questions!inner(id, title)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching user answers:', error)
    return []
  }

  return data || []
}

export async function getUserComments(userId: string) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('comments')
    .select('id, content, upvotes, downvotes, created_at, answer_id, answers!inner(question_id, questions!inner(id, title))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching user comments:', error)
    return []
  }

  return data || []
}
