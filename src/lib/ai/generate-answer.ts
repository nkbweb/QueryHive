import { GroqClient } from './groq-client'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface GenerateAnswerParams {
  questionId: string
  questionTitle: string
  questionContent: string
  tags?: string[]
}

export interface AIAnswerResult {
  success: boolean
  answerId?: string
  error?: string
  model?: string
  tokensUsed?: number
}

export class AnswerGenerationService {
  private groqClient: GroqClient
  private supabase: any

  constructor() {
    this.groqClient = GroqClient.getInstance()
    this.supabase = createSupabaseServerClient()
  }

  async generateAndSaveAnswer(params: GenerateAnswerParams): Promise<AIAnswerResult> {
    try {
      // Generate AI answer
      const aiResponse = await this.groqClient.generateAnswer(
        params.questionContent,
        this.buildContext(params)
      )

      // Get current user (AI system user)
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Save answer to database
      const { data: answerData, error: insertError } = await this.supabase
        .from('answers')
        .insert({
          content: aiResponse.answer,
          question_id: params.questionId,
          user_id: user.id,
          upvotes: 0,
          downvotes: 0,
          verification_count: 0,
          flag_count: 0,
          is_ai: true,
          ai_model: aiResponse.model,
          ai_tokens_used: aiResponse.usage?.total_tokens || 0,
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Database insert error:', insertError)
        throw new Error('Failed to save AI answer')
      }

      return {
        success: true,
        answerId: answerData.id,
        model: aiResponse.model,
        tokensUsed: aiResponse.usage?.total_tokens || 0
      }

    } catch (error) {
      console.error('Answer generation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private buildContext(params: GenerateAnswerParams): string {
    let context = `Question Title: ${params.questionTitle}\n`
    
    if (params.tags && params.tags.length > 0) {
      context += `Tags: ${params.tags.join(', ')}\n`
    }
    
    context += `Platform: QueryHive Q&A Platform\n`
    context += `Expected: Clear, helpful answer with proper formatting`

    return context
  }

  async testAIIntegration(): Promise<boolean> {
    try {
      const isConnected = await this.groqClient.testConnection()
      return isConnected
    } catch (error) {
      console.error('AI integration test failed:', error)
      return false
    }
  }
}

export default AnswerGenerationService
