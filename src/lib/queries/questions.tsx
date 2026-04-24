import { createSupabaseServerClient } from '@/lib/supabase/server'

// Type definitions for Supabase profiles
// interface Profile {
//   id: string
//   username: string
//   avatar_url: string | null
//   reputation: number
// }

function formatTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()

  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export async function getQuestions() {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      title,
      content,
      views,
      upvotes,
      created_at,
      profiles (
        username
      ),
      answers (
        id
      )
    `)
    .order('created_at', { ascending: false })

  console.log('getQuestions raw data:', data)

  if (error) {
    console.error('Error fetching questions:', error)
    return []
  }

  return (data || []).map((q) => ({
    id: q.id,
    title: q.title,
    content: q.content,

    upvotes: q.upvotes ?? 0,

    answersCount: q.answers?.length ?? 0,

    createdAt: formatTime(q.created_at),

    username: (q.profiles as any)?.username ?? 'Unknown',
  }))
}

export async function getQuestionById(questionId: string) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      title,
      content,
      views,
      upvotes,
      created_at,
      updated_at,
      profiles (
        id,
        username,
        full_name,
        avatar_url,
        reputation
      ),
      answers (
        id,
        content,
        upvotes,
        downvotes,
        verification_count,
        flag_count,
        is_ai,
        status,
        created_at,
        updated_at,
        user_id,
        profiles (
          id,
          username,
          full_name,
          avatar_url,
          reputation
        )
      ),
      question_tags (
        tags (
          id,
          name,
          color
        )
      )
    `)
    .eq('id', questionId)
    .single()


  if (error) {
    console.error('Error fetching question details:', error)
    return null
  }

  if (!data) return null

  // Increment view count
  await supabase
    .from('questions')
    .update({ views: (data.views || 0) + 1 })
    .eq('id', questionId)

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    views: data.views || 0,
    upvotes: data.upvotes || 0,
    createdAt: formatTime(data.created_at),
    updatedAt: formatTime(data.updated_at),
    user: {
      id: (data.profiles as any)?.id,
      username: (data.profiles as any)?.username || 'Unknown',
      fullName: (data.profiles as any)?.full_name,
      avatarUrl: (data.profiles as any)?.avatar_url,
      reputation: (data.profiles as any)?.reputation || 0
    },
    answers: (data.answers || []).map((answer) => {
      // Handle AI answers - check multiple indicators
      const isAIAnswer = answer.is_ai === true || answer.user_id === null || (answer.profiles && answer.profiles[0]?.username === 'AI Assistant')
      
      if (isAIAnswer) {
        return {
          id: answer.id,
          content: answer.content,
          upvotes: answer.upvotes || 0,
          downvotes: answer.downvotes || 0,
          verificationCount: answer.verification_count || 0,
          flagCount: answer.flag_count || 0,
          isAI: true,
          status: answer.status || 'draft',
          createdAt: formatTime(answer.created_at),
          updatedAt: formatTime(answer.updated_at),
          user: {
            id: null,
            username: 'AI Assistant',
            avatarUrl: null,
            reputation: 0
          }
        };
      }
      
      const profile = answer.profiles as any;
      return {
        id: answer.id,
        content: answer.content,
        upvotes: answer.upvotes || 0,
        downvotes: answer.downvotes || 0,
        verificationCount: answer.verification_count || 0,
        flagCount: answer.flag_count || 0,
        isAI: answer.is_ai || false,
        status: answer.status || 'draft',
        createdAt: formatTime(answer.created_at),
        updatedAt: formatTime(answer.updated_at),
        user: {
          id: profile?.id,
          username: profile?.username || 'Unknown',
          fullName: profile?.full_name,
          avatarUrl: profile?.avatar_url,
          reputation: profile?.reputation || 0
        }
      };
    }).sort((a, b) => {
      // Sort by: verified answers first, then by upvotes, then by creation date
      if (a.verificationCount > 0 && b.verificationCount === 0) return -1
      if (a.verificationCount === 0 && b.verificationCount > 0) return 1
      if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }),
    tags: (data.question_tags || [])
      .filter(qt => qt.tags && typeof qt.tags === 'object' && 'id' in qt.tags)
      .map((qt) => ({
        id: (qt.tags as any).id,
        name: (qt.tags as any).name,
        color: (qt.tags as any).color || '#6B7280'
      }))
  }
}