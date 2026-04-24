import { getUserCommentVote, voteOnComment } from '@/lib/queries/comments'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/comments/[id]/vote - Vote on a comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { value } = body

    if (typeof value !== 'number' || ![-1, 0, 1].includes(value)) {
      return NextResponse.json(
        { error: 'Invalid vote value. Must be -1, 0, or 1' },
        { status: 400 }
      )
    }

    const result = await voteOnComment(params.id, user.id, value)

    // Get updated vote status
    const currentVote = await getUserCommentVote(params.id, user.id)

    return NextResponse.json({ 
      success: true, 
      data: result,
      currentVote 
    })
  } catch (error) {
    console.error('Error in POST /api/comments/[id]/vote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/comments/[id]/vote - Get user's vote on a comment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const vote = await getUserCommentVote(params.id, user.id)

    return NextResponse.json({ success: true, data: { vote } })
  } catch (error) {
    console.error('Error in GET /api/comments/[id]/vote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
