import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user's bookmarks with question details
    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        id,
        created_at,
        questions (
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
          ),
          question_tags (
            tags (
              id,
              name,
              color
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookmarks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bookmarks' },
        { status: 500 }
      )
    }

    const bookmarks = (data || []).map((bookmark: any) => ({
      id: bookmark.id,
      createdAt: bookmark.created_at,
      question: {
        id: bookmark.questions.id,
        title: bookmark.questions.title,
        content: bookmark.questions.content,
        views: bookmark.questions.views || 0,
        upvotes: bookmark.questions.upvotes || 0,
        createdAt: bookmark.questions.created_at,
        username: bookmark.questions.profiles?.[0]?.username || 'Unknown',
        answersCount: bookmark.questions.answers?.length || 0,
        tags: (bookmark.questions.question_tags || [])
          .filter((qt: any) => qt.tags)
          .map((qt: any) => ({
            id: qt.tags.id,
            name: qt.tags.name,
            color: qt.tags.color || '#6B7280'
          }))
      }
    }))

    return NextResponse.json({ bookmarks })
  } catch (error) {
    console.error('Error in GET /api/bookmarks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const body = await request.json()
    const { questionId } = body

    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if question exists
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('id')
      .eq('id', questionId)
      .single()

    if (questionError || !question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Add bookmark
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        question_id: questionId
      })
      .select()
      .single()

    if (error) {
      // Check if it's a duplicate bookmark
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Question already bookmarked' },
          { status: 409 }
        )
      }
      console.error('Error creating bookmark:', error)
      return NextResponse.json(
        { error: 'Failed to bookmark question' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        bookmark: {
          id: data.id,
          questionId: data.question_id,
          createdAt: data.created_at
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/bookmarks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')

    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Remove bookmark
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('question_id', questionId)

    if (error) {
      console.error('Error removing bookmark:', error)
      return NextResponse.json(
        { error: 'Failed to remove bookmark' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in DELETE /api/bookmarks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
