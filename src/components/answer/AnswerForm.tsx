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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), questionId, userId, isAI: false })
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

  const isEmpty = !content.trim()

  return (
    <div className="mt-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <h3 className="text-base font-semibold text-white">Your Answer</h3>
        <span className="text-[10px] font-label text-white/30 uppercase tracking-wider">Markdown supported</span>
      </div>

      {/* Textarea container */}
      <div className={`relative rounded-sm border transition-colors duration-150 ${
        isSubmitting ? 'border-white/5' : 'border-white/10 focus-within:border-white/20'
      }`}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-white/[0.03] border-none focus:ring-0 focus:outline-none min-h-[180px] px-4 py-4 text-[14px] text-white/90 placeholder:text-white/20 resize-none rounded-sm"
          placeholder={`Write your answer here...\n\n**bold**  *italic*   \`\`\`code blocks\`\`\``}
          disabled={isSubmitting}
        />

        {/* Char count */}
        {content.length > 0 && (
          <span className="absolute bottom-3 right-4 text-[10px] text-white/20 font-mono select-none">
            {content.length}
          </span>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-[11px] text-white/20">
          Be specific and thorough — good answers get upvoted.
        </span>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isEmpty}
          className={`flex items-center gap-2 px-5 py-2 text-[11px] font-label font-semibold uppercase tracking-widest transition-all duration-150 rounded-sm ${
            isEmpty || isSubmitting
              ? 'text-[#E8FF47]/30 border border-[#E8FF47]/20 cursor-not-allowed'
              : 'bg-lime-accent text-background hover:bg-lime-accent/90'
          }`}
        >
          {isSubmitting ? (
            <>
              <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              Posting
            </>
          ) : (
            'Post Answer'
          )}
        </button>
      </div>
    </div>
  )
}