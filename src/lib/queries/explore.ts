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

export async function getTrendingQuestions(limit = 20, offset = 0) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      title,
      content,
      views,
      upvotes,
      answer_count,
      created_at,
      profiles (
        username
      ),
      question_tags (
        tags (
          id,
          name,
          color
        )
      )
    `)
    .order('trending_score', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  console.log('getTrendingQuestions raw data:', data)

  if (error) {
    console.error('Error fetching trending questions:', error)
    return []
  }

  return (data || []).map((q: any) => ({
    id: q.id,
    title: q.title,
    content: q.content,
    views: q.views || 0,
    upvotes: q.upvotes || 0,
    answerCount: q.answer_count || 0,
    createdAt: q.created_at,
    username: q.profiles?.username || 'Unknown',
    tags: (q.question_tags || [])
      .filter((qt: any) => qt.tags)
      .map((qt: any) => ({
        id: qt.tags.id,
        name: qt.tags.name,
        color: qt.tags.color || '#6B7280'
      }))
  }))
}

export async function getRecentQuestions(limit = 20, offset = 0) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      title,
      content,
      views,
      upvotes,
      answer_count,
      created_at,
      profiles (
        username
      ),
      question_tags (
        tags (
          id,
          name,
          color
        )
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching recent questions:', error)
    return []
  }

  return (data || []).map((q: any) => ({
    id: q.id,
    title: q.title,
    content: q.content,
    views: q.views || 0,
    upvotes: q.upvotes || 0,
    answerCount: q.answer_count || 0,
    createdAt: q.created_at,
    username: q.profiles?.username || 'Unknown',
    tags: (q.question_tags || [])
      .filter((qt: any) => qt.tags)
      .map((qt: any) => ({
        id: qt.tags.id,
        name: qt.tags.name,
        color: qt.tags.color || '#6B7280'
      }))
  }))
}

export async function getUnansweredQuestions(limit = 20, offset = 0) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      title,
      content,
      views,
      upvotes,
      answer_count,
      created_at,
      profiles (
        username
      ),
      question_tags (
        tags (
          id,
          name,
          color
        )
      )
    `)
    .eq('answer_count', 0)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching unanswered questions:', error)
    return []
  }

  return (data || []).map((q: any) => ({
    id: q.id,
    title: q.title,
    content: q.content,
    views: q.views || 0,
    upvotes: q.upvotes || 0,
    answerCount: 0,
    createdAt: q.created_at,
    username: q.profiles?.username || 'Unknown',
    tags: (q.question_tags || [])
      .filter((qt: any) => qt.tags)
      .map((qt: any) => ({
        id: qt.tags.id,
        name: qt.tags.name,
        color: qt.tags.color || '#6B7280'
      }))
  }))
}

export async function getAIAnsweredQuestions(limit = 20, offset = 0) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      title,
      content,
      views,
      upvotes,
      answer_count,
      created_at,
      profiles (
        username
      ),
      answers!inner (
        is_ai
      ),
      question_tags (
        tags (
          id,
          name,
          color
        )
      )
    `)
    .eq('answers.is_ai', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  console.log('getAIAnsweredQuestions raw data:', data)

  if (error) {
    console.error('Error fetching AI-answered questions:', error)
    return []
  }

  return (data || []).map((q: any) => ({
    id: q.id,
    title: q.title,
    content: q.content,
    views: q.views || 0,
    upvotes: q.upvotes || 0,
    answerCount: q.answer_count || 0,
    createdAt: q.created_at,
    username: q.profiles?.username || 'Unknown',
    tags: (q.question_tags || [])
      .filter((qt: any) => qt.tags)
      .map((qt: any) => ({
        id: qt.tags.id,
        name: qt.tags.name,
        color: qt.tags.color || '#6B7280'
      }))
  }))
}

export async function getMostViewedQuestions(limit = 20, offset = 0) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      title,
      content,
      views,
      upvotes,
      answer_count,
      created_at,
      profiles (
        username
      ),
      question_tags (
        tags (
          id,
          name,
          color
        )
      )
    `)
    .order('views', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching most viewed questions:', error)
    return []
  }

  return (data || []).map((q: any) => ({
    id: q.id,
    title: q.title,
    content: q.content,
    views: q.views || 0,
    upvotes: q.upvotes || 0,
    answerCount: q.answer_count || 0,
    createdAt: q.created_at,
    username: q.profiles?.username || 'Unknown',
    tags: (q.question_tags || [])
      .filter((qt: any) => qt.tags)
      .map((qt: any) => ({
        id: qt.tags.id,
        name: qt.tags.name,
        color: qt.tags.color || '#6B7280'
      }))
  }))
}

export async function getPopularTags(limit = 20) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('tags')
    .select(`
      id,
      name,
      description,
      color,
      question_count
    `)
    .order('question_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching popular tags:', error)
    return []
  }

  return (data || []).map((tag: any) => ({
    id: tag.id,
    name: tag.name,
    description: tag.description,
    color: tag.color || '#6B7280',
    questionCount: tag.question_count || 0
  }))
}

export async function getTopContributors(limit = 20) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      full_name,
      avatar_url,
      reputation,
      created_at
    `)
    .order('reputation', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching top contributors:', error)
    return []
  }

  return (data || []).map((user: any) => ({
    id: user.id,
    username: user.username,
    name: user.full_name,
    avatarUrl: user.avatar_url,
    reputation: user.reputation || 0,
    createdAt: formatTime(user.created_at)
  }))
}

export async function getPlatformStats() {
  const supabase = createSupabaseServerClient()

  const [questionsResult, answersResult, usersResult, tagsResult] = await Promise.all([
    supabase.from('questions').select('id', { count: 'exact', head: true }),
    supabase.from('answers').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('tags').select('id', { count: 'exact', head: true })
  ])

  return {
    questionsCount: questionsResult.count || 0,
    answersCount: answersResult.count || 0,
    usersCount: usersResult.count || 0,
    tagsCount: tagsResult.count || 0
  }
}

export async function searchQuestions(query: string, limit = 20, offset = 0) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      title,
      content,
      views,
      upvotes,
      answer_count,
      created_at,
      profiles (
        username
      ),
      question_tags (
        tags (
          id,
          name,
          color
        )
      )
    `)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error searching questions:', error)
    return []
  }

  return (data || []).map((q: any) => ({
    id: q.id,
    title: q.title,
    content: q.content,
    views: q.views || 0,
    upvotes: q.upvotes || 0,
    answerCount: q.answer_count || 0,
    createdAt: q.created_at,
    username: q.profiles?.username || 'Unknown',
    tags: (q.question_tags || [])
      .filter((qt: any) => qt.tags)
      .map((qt: any) => ({
        id: qt.tags.id,
        name: qt.tags.name,
        color: qt.tags.color || '#6B7280'
      }))
  }))
}

export async function getQuestionsByTag(tagId: string, limit = 20, offset = 0) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      title,
      content,
      views,
      upvotes,
      answer_count,
      created_at,
      profiles (
        username
      ),
      question_tags!inner (
        tags (
          id,
          name,
          color
        )
      )
    `)
    .eq('question_tags.tag_id', tagId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching questions by tag:', error)
    return []
  }

  return (data || []).map((q: any) => ({
    id: q.id,
    title: q.title,
    content: q.content,
    views: q.views || 0,
    upvotes: q.upvotes || 0,
    answerCount: q.answer_count || 0,
    createdAt: q.created_at,
    username: q.profiles?.username || 'Unknown',
    tags: (q.question_tags || [])
      .filter((qt: any) => qt.tags)
      .map((qt: any) => ({
        id: qt.tags.id,
        name: qt.tags.name,
        color: qt.tags.color || '#6B7280'
      }))
  }))
}
