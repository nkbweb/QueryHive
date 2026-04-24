import { NextRequest, NextResponse } from 'next/server'
import { getAIAnsweredQuestions } from '@/lib/queries/explore'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const questions = await getAIAnsweredQuestions(limit, offset)

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error in GET /api/explore/ai-answered:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
