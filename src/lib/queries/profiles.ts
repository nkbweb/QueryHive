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
  bio?: string
  location?: string
  job_title?: string
  company?: string
  website?: string
  portfolio_url?: string
  github_url?: string
  linkedin_url?: string
  twitter_url?: string
  banner_url?: string
  availability_status?: string
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

export async function getUserSkills(userId: string) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('user_skills')
    .select('skill_id, skills!inner(id, name, category)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user skills:', error)
    return []
  }

  return data?.map(item => item.skills) || []
}

export async function updateUserSkills(userId: string, skillIds: string[]) {
  const supabase = createSupabaseServerClient()

  // First, remove all existing skills
  const { error: deleteError } = await supabase
    .from('user_skills')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    console.error('Error removing existing skills:', deleteError)
    return null
  }

  // Then, add new skills
  if (skillIds.length > 0) {
    const skillsToInsert = skillIds.map(skillId => ({
      user_id: userId,
      skill_id: skillId
    }))

    const { error: insertError } = await supabase
      .from('user_skills')
      .insert(skillsToInsert)

    if (insertError) {
      console.error('Error adding skills:', insertError)
      return null
    }
  }

  return true
}
