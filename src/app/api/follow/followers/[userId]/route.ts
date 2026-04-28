import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { userId } = params

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Get followers (people who follow this user)
    const { data: followers, error } = await supabase
      .from('user_follows')
      .select(`
        follower_id,
        created_at,
        profiles!user_follows_follower_id_fkey (
          id,
          username,
          full_name,
          avatar_url,
          reputation,
          created_at
        )
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Get followers error:', error)
      return NextResponse.json({ error: 'Failed to fetch followers' }, { status: 500 })
    }

    const users = followers?.map(follow => ({
      ...follow.profiles,
      followedAt: follow.created_at
    })) || []

    // Get total count for pagination
    const { count } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)

    return NextResponse.json({ 
      users,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      }
    })

  } catch (error) {
    console.error('Followers API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
