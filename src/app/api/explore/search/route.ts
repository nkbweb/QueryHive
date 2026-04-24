import { NextRequest, NextResponse } from 'next/server'
import { searchQuestions } from '@/lib/queries/explore'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    const questions = await searchQuestions(query, limit, offset)

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error in GET /api/explore/search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
