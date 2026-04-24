import { createComment, getCommentsByAnswerId } from '@/lib/queries/comments'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/comments?answerId=xxx - Get all comments for an answer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const answerId = searchParams.get('answerId')

    if (!answerId) {
      return NextResponse.json(
        { error: 'Missing required parameter: answerId' },
        { status: 400 }
      )
    }

    const comments = await getCommentsByAnswerId(answerId)

    return NextResponse.json({ success: true, data: comments })
  } catch (error) {
    console.error('Error in GET /api/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content, answerId, parentId } = body

    if (!content || !answerId) {
      return NextResponse.json(
        { error: 'Missing required fields: content, answerId' },
        { status: 400 }
      )
    }

    const result = await createComment({
      content: content.trim(),
      answerId,
      userId: user.id,
      parentId
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error in POST /api/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
