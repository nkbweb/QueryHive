'use client'

import { useState } from 'react'

interface AnswerFormProps {
  questionId: string
  userId: string
  onAnswerSubmitted: () => void
}

export default function AnswerForm({ questionId, userId, onAnswerSubmitted }: AnswerFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) return

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          questionId,
          userId,
          isAI: false
        })
      })

      const result = await response.json()

      if (result.success) {
        setContent('')
        onAnswerSubmitted()
      } else {
        console.error('Error submitting answer:', result.error)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-16">
      <h3 className="text-lg font-bold text-white mb-6">Your Answer</h3>
      <div className="border border-lime-accent/30 bg-surface-container/50 rounded-lg overflow-hidden shadow-lg">
        <div className="flex gap-4 px-4 py-3 border-b border-lime-accent/20 bg-surface-container-high/30">
          <span className="text-xs font-label text-lime-accent/80">Markdown Supported</span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none min-h-[200px] p-6 text-[15px] text-white/95 placeholder:text-white/40 resize-none"
          placeholder="Type your expert solution...\n\nYou can use markdown for formatting:\n• **bold** and *italic* text\n• `inline code`\n• ```code blocks```"
          disabled={isSubmitting}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !content.trim()}
        className="mt-6 bg-lime-accent hover:bg-lime-accent/90 text-background px-8 py-3 font-bold uppercase tracking-widest text-xs rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
      >
        {isSubmitting ? 'Posting...' : 'Post Your Answer'}
      </button>
    </div>
  )
}
