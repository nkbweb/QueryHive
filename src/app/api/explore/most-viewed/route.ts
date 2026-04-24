import { NextRequest, NextResponse } from 'next/server'
import { getMostViewedQuestions } from '@/lib/queries/explore'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const questions = await getMostViewedQuestions(limit, offset)

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error in GET /api/explore/most-viewed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
