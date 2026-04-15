import { AnswerGenerationService } from '@/lib/ai/generate-answer'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface AIAnswerJobData {
  questionId: string
  questionTitle: string
  questionContent: string
  tags?: string[]
  userId: string
}

export class AIAnswerJob {
  private static instance: AIAnswerJob
  private aiService: AnswerGenerationService

  private constructor() {
    this.aiService = new AnswerGenerationService()
  }

  public static getInstance(): AIAnswerJob {
    if (!AIAnswerJob.instance) {
      AIAnswerJob.instance = new AIAnswerJob()
    }
    return AIAnswerJob.instance
  }

  async processAIAnswerJob(jobData: AIAnswerJobData): Promise<void> {
    try {
      console.log(`Processing AI answer job for question: ${jobData.questionId}`)
      
      // Check if AI answer already exists for this question
      const supabase = createSupabaseServerClient()
      const { data: existingAnswer } = await supabase
        .from('answers')
        .select('id')
        .eq('question_id', jobData.questionId)
        .eq('is_ai', true)
        .single()

      if (existingAnswer) {
        console.log(`AI answer already exists for question: ${jobData.questionId}`)
        return
      }

      // Generate AI answer
      const result = await this.aiService.generateAndSaveAnswer({
        questionId: jobData.questionId,
        questionTitle: jobData.questionTitle,
        questionContent: jobData.questionContent,
        tags: jobData.tags
      })

      if (result.success) {
        console.log(`✅ AI answer generated successfully for question: ${jobData.questionId}`)
        console.log(`Answer ID: ${result.answerId}, Model: ${result.model}, Tokens: ${result.tokensUsed}`)
      } else {
        console.error(`❌ Failed to generate AI answer for question: ${jobData.questionId}`, result.error)
      }
    } catch (error) {
      console.error(`AI answer job failed for question: ${jobData.questionId}`, error)
    }
  }

  async triggerAIAnswerForQuestion(questionId: string): Promise<void> {
    try {
      const supabase = createSupabaseServerClient()
      
      // Get question details
      const { data: question, error } = await supabase
        .from('questions')
        .select(`
          id,
          title,
          content,
          user_id,
          question_tags (
            tags (
              name
            )
          )
        `)
        .eq('id', questionId)
        .single()

      if (error || !question) {
        console.error('Failed to fetch question for AI answer generation:', error)
        return
      }

      // Extract tag names
      const tags = question.question_tags?.map((qt: any) => qt.tags?.name).filter(Boolean) || []

      // Prepare job data
      const jobData: AIAnswerJobData = {
        questionId: question.id,
        questionTitle: question.title,
        questionContent: question.content,
        tags,
        userId: question.user_id
      }

      // Process the job (in production, this would be queued)
      await this.processAIAnswerJob(jobData)
      
    } catch (error) {
      console.error('Failed to trigger AI answer generation:', error)
    }
  }

  // Rate limiting helper - check if user has exceeded AI answer quota
  async checkUserAIQuota(userId: string, maxPerDay: number = 5): Promise<boolean> {
    try {
      const supabase = createSupabaseServerClient()
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      
      const { count, error } = await supabase
        .from('answers')
        .select('*', { count: 'exact', head: true })
        .eq('is_ai', true)
        .eq('user_id', userId)
        .gte('created_at', today)
        .lt('created_at', `${today}T23:59:59.999Z`)

      if (error) {
        console.error('Failed to check AI quota:', error)
        return false
      }

      return (count || 0) < maxPerDay
    } catch (error) {
      console.error('AI quota check failed:', error)
      return false
    }
  }
}

export default AIAnswerJob
