import { NextRequest, NextResponse } from 'next/server'
import { AIAnswerJob } from '@/lib/jobs/ai-answer-job'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { questionId } = body

    if (!questionId) {
      return NextResponse.json(
        { error: 'Missing required field: questionId' },
        { status: 400 }
      )
    }

    // Check user AI quota
    const aiJob = AIAnswerJob.getInstance()
    const hasQuota = await aiJob.checkUserAIQuota(user.id)
    
    if (!hasQuota) {
      return NextResponse.json(
        { error: 'Daily AI answer quota exceeded' },
        { status: 429 }
      )
    }

    // Trigger AI answer generation
    await aiJob.triggerAIAnswerForQuestion(questionId)

    return NextResponse.json({
      success: true,
      message: 'AI answer generation triggered'
    })

  } catch (error) {
    console.error('AI answer trigger error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
