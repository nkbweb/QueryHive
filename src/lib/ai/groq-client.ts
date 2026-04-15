import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export interface AIAnswerResponse {
  answer: string
  model: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class GroqClient {
  private static instance: GroqClient
  private client: Groq

  private constructor() {
    this.client = groq
  }

  public static getInstance(): GroqClient {
    if (!GroqClient.instance) {
      GroqClient.instance = new GroqClient()
    }
    return GroqClient.instance
  }

  async generateAnswer(question: string, context?: string): Promise<AIAnswerResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt()
      const userPrompt = this.buildUserPrompt(question, context)

      const completion = await this.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // Using Llama 3.3 70B for quality answers
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
      })

      const answer = completion.choices[0]?.message?.content || ''
      
      return {
        answer: answer.trim(),
        model: completion.model,
        usage: completion.usage ? {
          prompt_tokens: completion.usage.prompt_tokens,
          completion_tokens: completion.usage.completion_tokens,
          total_tokens: completion.usage.total_tokens
        } : undefined
      }
    } catch (error) {
      console.error('Groq API Error:', error)
      throw new Error('Failed to generate AI answer')
    }
  }

  private buildSystemPrompt(): string {
    return `You are a helpful AI assistant providing answers to user questions on a Q&A platform. 

Guidelines:
- Provide clear, accurate, and concise answers
- Use markdown formatting for better readability
- Be professional but approachable
- If you're unsure about something, acknowledge it
- Focus on practical, actionable information
- Keep answers under 500 words when possible
- Use proper headings, lists, and code blocks where appropriate

Your goal is to help users get the information they need quickly and effectively.`
  }

  private buildUserPrompt(question: string, context?: string): string {
    let prompt = `Question: ${question}`
    
    if (context) {
      prompt += `\n\nAdditional Context: ${context}`
    }
    
    prompt += `\n\nPlease provide a helpful answer to this question.`
    
    return prompt
  }

  async testConnection(): Promise<boolean> {
    try {
      const testResponse = await this.generateAnswer(
        'What is 2 + 2?',
        'This is a simple test to verify the AI connection.'
      )
      return testResponse.answer.length > 0
    } catch (error) {
      console.error('Groq connection test failed:', error)
      return false
    }
  }
}

export default GroqClient
