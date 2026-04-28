'use client'

import Link from 'next/link'

interface Answer {
  id: string
  content: string
  upvotes: number
  created_at: string
  question: {
    id: string
    title: string
  }
}

interface AnswersListProps {
  answers: Answer[]
}

export default function AnswersList({ answers }: AnswersListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (answers.length === 0) {
    return (
      <div className="text-white/40 text-sm">
        <p>No answers given yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {answers.map((answer) => {
        const question = (answer as any).questions || (answer as any).question
        const questionId = question?.id || (answer as any).question_id

        // Skip if no valid question ID
        if (!questionId) {
          console.warn('Answer has no valid question ID:', answer.id)
          return null
        }

        const questionTitle = question?.title || 'Unknown question'

        return (
          <Link
            key={answer.id}
            href={`/questions/${questionId}`}
            className="p-4 bg-[#131315] border border-white/[0.05] rounded-lg hover:border-white/[0.1] transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center min-w-[40px]">
                <span className="text-primary-container font-medium">{answer.upvotes}</span>
                <span className="text-[10px] text-white/40">votes</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/70 mb-2 line-clamp-2">
                  {truncateContent(answer.content)}
                </p>
                <p className="text-xs text-white/40 mb-2">
                  on: <span className="text-white/60">{questionTitle}</span>
                </p>
                <div className="text-[11px] text-white/40">
                  {formatDate(answer.created_at)}
                </div>
              </div>
            </div>
          </Link>
        )
      }).filter(Boolean)}
    </div>
  )
}
