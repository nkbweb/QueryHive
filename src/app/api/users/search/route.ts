import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        error: 'Query must be at least 2 characters long' 
      }, { status: 400 })
    }

    // Search users by username or full_name
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        reputation,
        created_at,
        followers_count,
        following_count
      `)
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .order('reputation', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('User search error:', error)
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)

    return NextResponse.json({ 
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      }
    })

  } catch (error) {
    console.error('User search API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
