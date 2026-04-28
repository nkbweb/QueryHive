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

    // Get following (people this user follows)
    const { data: following, error } = await supabase
      .from('user_follows')
      .select(`
        following_id,
        created_at,
        profiles!user_follows_following_id_fkey (
          id,
          username,
          full_name,
          avatar_url,
          reputation,
          created_at
        )
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Get following error:', error)
      return NextResponse.json({ error: 'Failed to fetch following' }, { status: 500 })
    }

    const users = following?.map(follow => ({
      ...follow.profiles,
      followedAt: follow.created_at
    })) || []

    // Get total count for pagination
    const { count } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)

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
    console.error('Following API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
