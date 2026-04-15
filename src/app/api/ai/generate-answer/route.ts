import { NextRequest, NextResponse } from 'next/server'
import { AnswerGenerationService } from '@/lib/ai/generate-answer'
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
    const { questionId, questionTitle, questionContent, tags } = body

    if (!questionId || !questionTitle || !questionContent) {
      return NextResponse.json(
        { error: 'Missing required fields: questionId, questionTitle, questionContent' },
        { status: 400 }
      )
    }

    // Initialize AI service
    const aiService = new AnswerGenerationService()

    // Generate and save answer
    const result = await aiService.generateAndSaveAnswer({
      questionId,
      questionTitle,
      questionContent,
      tags: tags || []
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        answerId: result.answerId,
        model: result.model,
        tokensUsed: result.tokensUsed
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to generate answer' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('AI answer generation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Test AI integration
    const aiService = new AnswerGenerationService()
    const isWorking = await aiService.testAIIntegration()

    return NextResponse.json({
      working: isWorking,
      message: isWorking ? 'AI integration is working' : 'AI integration test failed'
    })
  } catch (error) {
    console.error('AI test API error:', error)
    return NextResponse.json(
      { working: false, error: 'Failed to test AI integration' },
      { status: 500 }
    )
  }
}
