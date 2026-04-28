import { NextRequest, NextResponse } from 'next/server'
import { AIAnswerJob } from '@/lib/jobs/ai-answer-job'

export const maxDuration = 300 // 5 minutes timeout for background job

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { questionId } = body

    if (!questionId) {
      return NextResponse.json(
        { error: 'Missing questionId' },
        { status: 400 }
      )
    }

    console.log(`Processing AI answer job for question: ${questionId}`)
    
    const aiJob = AIAnswerJob.getInstance()
    await aiJob.triggerAIAnswerForQuestion(questionId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('AI answer job processing failed:', error)
    return NextResponse.json(
      { error: 'Job processing failed' },
      { status: 500 }
    )
  }
}
