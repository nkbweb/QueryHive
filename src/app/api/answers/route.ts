import { createAnswer } from '@/lib/queries/answers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, questionId, userId, isAI } = body

    if (!content || !questionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: content, questionId, userId' },
        { status: 400 }
      )
    }

    const result = await createAnswer({
      content: content.trim(),
      questionId,
      userId,
      isAI: isAI || false
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create answer' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error in POST /api/answers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
