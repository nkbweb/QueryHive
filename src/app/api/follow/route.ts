import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { followingId } = await request.json()
    
    if (!followingId) {
      return NextResponse.json({ error: 'followingId is required' }, { status: 400 })
    }

    if (user.id === followingId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('user_follows')
      .select('*')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .single()

    if (existingFollow) {
      return NextResponse.json({ 
        success: false, 
        message: 'Already following',
        isFollowing: true 
      }, { status: 409 })
    }

    // Create follow relationship
    const { data: follow, error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: user.id,
        following_id: followingId
      })
      .select()
      .single()

    if (error) {
      console.error('Follow error:', error)
      return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      isFollowing: true,
      follow 
    })

  } catch (error) {
    console.error('Follow API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const followingId = url.pathname.split('/').pop()
    
    if (!followingId) {
      return NextResponse.json({ error: 'followingId is required' }, { status: 400 })
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
