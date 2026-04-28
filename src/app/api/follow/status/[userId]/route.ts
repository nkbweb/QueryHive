import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ isFollowing: false }, { status: 200 })
    }

    const { userId } = params

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Check if following
    const { data: follow } = await supabase
      .from('user_follows')
      .select('*')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single()

    return NextResponse.json({ 
      isFollowing: !!follow 
    })

  } catch (error) {
    console.error('Follow status API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
