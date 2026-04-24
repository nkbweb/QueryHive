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

export async function getAnswersByQuestionId(questionId: string) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('answers')
    .select(`
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
        avatar_url,
        reputation
      )
    `)
    .eq('question_id', questionId)
    .eq('status', 'published')
    .order('verification_count', { ascending: false })
    .order('upvotes', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching answers:', error)
    return []
  }

  return (data || []).map((answer) => {
    console.log(`Processing answer ${answer.id}:`, {
      user_id: answer.user_id,
      is_ai: answer.is_ai,
      profiles: answer.profiles,
      profiles_length: answer.profiles?.length
    });
    
    const profile = answer.profiles?.[0];
    console.log(`Answer ${answer.id} profile data:`, profile);
    
    // Handle AI answers with null user_id
    if (answer.is_ai || !answer.user_id) {
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
          id: null,
          username: 'AI Assistant',
          avatarUrl: null,
          reputation: 0
        }
      };
    }
    
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
        avatarUrl: profile?.avatar_url,
        reputation: profile?.reputation || 0
      }
    };
  })
}

export async function createAnswer(answerData: {
  content: string
  questionId: string
  userId: string
  isAI?: boolean
}) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('answers')
    .insert({
      content: answerData.content,
      question_id: answerData.questionId,
      user_id: answerData.userId,
      is_ai: answerData.isAI || false,
      status: 'published',
      upvotes: 0,
      downvotes: 0,
      verification_count: 0,
      flag_count: 0
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating answer:', error)
    return null
  }

  return data
}
