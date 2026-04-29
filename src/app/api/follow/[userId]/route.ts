import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId: followingId } = await params
    
    if (!followingId) {
      return NextResponse.json({ error: 'followingId is required' }, { status: 400 })
    }

    if (user.id === followingId) {
      return NextResponse.json({ error: 'Cannot unfollow yourself' }, { status: 400 })
    }

    // Delete follow relationship
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId)

    if (error) {
      console.error('Unfollow error:', error)
      return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      isFollowing: false
    })

  } catch (error) {
    console.error('Unfollow API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
