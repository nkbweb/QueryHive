import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Get users that current user follows
    const { data: followingUsers, error: followError } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', user.id)

    if (followError) {
      console.error('Get following users error:', followError)
      return NextResponse.json({ error: 'Failed to fetch following users' }, { status: 500 })
    }

    if (!followingUsers || followingUsers.length === 0) {
      return NextResponse.json({ 
        activities: [],
        pagination: {
          page,
          limit,
          total: 0,
          hasMore: false
        }
      })
    }

    const followingIds = followingUsers.map(f => f.following_id)

    // Get recent activities from followed users
    const [questions, answers, comments] = await Promise.all([
      // Get questions from followed users
      supabase
        .from('questions')
        .select(`
          id,
          title,
          content,
          upvotes,
          created_at,
          user_id,
          profiles!questions_user_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(limit),

      // Get answers from followed users
      supabase
        .from('answers')
        .select(`
          id,
          content,
          upvotes,
          created_at,
          user_id,
          question_id,
          questions!inner (
            id,
            title
          ),
          profiles!answers_user_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(limit),

      // Get comments from followed users
      supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          answer_id,
          answers!inner (
            question_id,
            questions!inner (
              id,
              title
            )
          ),
          profiles!comments_user_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(limit)
    ])

    // Combine and format activities
    const activities = [
      ...(questions.data || []).map(q => ({
        type: 'question' as const,
        id: q.id,
        user: q.profiles,
        content: {
          title: q.title,
          content: q.content,
          upvotes: q.upvotes
        },
        createdAt: q.created_at,
        link: `/questions/${q.id}`
      })),
      ...(answers.data || []).map((a: any) => ({
        type: 'answer' as const,
        id: a.id,
        user: a.profiles,
        content: {
          content: a.content,
          upvotes: a.upvotes,
          question: a.questions
        },
        createdAt: a.created_at,
        link: `/questions/${a.question_id}`
      })),
      ...(comments.data || []).map((c: any) => ({
        type: 'comment' as const,
        id: c.id,
        user: c.profiles,
        content: {
          content: c.content,
          question: c.answers?.questions
        },
        createdAt: c.created_at,
        link: `/questions/${c.answers?.question_id}`
      }))
    ]

    // Sort by creation date (most recent first)
    activities.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Paginate
    const paginatedActivities = activities.slice(offset, offset + limit)

    return NextResponse.json({ 
      activities: paginatedActivities,
      pagination: {
        page,
        limit,
        total: activities.length,
        hasMore: (offset + limit) < activities.length
      }
    })

  } catch (error) {
    console.error('Activity feed API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
