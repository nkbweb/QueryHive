import { NextRequest, NextResponse } from 'next/server'
import { getPopularTags } from '@/lib/queries/explore'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const tags = await getPopularTags(limit)

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Error in GET /api/explore/tags:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
