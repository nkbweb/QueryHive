import { deleteComment, updateComment } from '@/lib/queries/comments'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PUT /api/comments/[id] - Update a comment
export async function PUT(
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
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Missing required field: content' },
        { status: 400 }
      )
    }

    const result = await updateComment(params.id, content.trim(), user.id)

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update comment or unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error in PUT /api/comments/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(
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

    const result = await deleteComment(params.id, user.id)

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to delete comment or unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/comments/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
