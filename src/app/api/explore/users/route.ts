import { NextRequest, NextResponse } from 'next/server'
import { getTopContributors } from '@/lib/queries/explore'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const users = await getTopContributors(limit)

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error in GET /api/explore/users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
