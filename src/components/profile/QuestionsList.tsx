'use client'

import Link from 'next/link'

interface Question {
  id: string
  title: string
  upvotes: number
  answers_count: number
  created_at: string
}

interface QuestionsListProps {
  questions: Question[]
}

export default function QuestionsList({ questions }: QuestionsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  if (questions.length === 0) {
    return (
      <div className="text-white/40 text-sm">
        <p>No questions asked yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {questions.map((question) => (
        <Link
          key={question.id}
          href={`/questions/${question.id}`}
          className="p-4 bg-[#131315] border border-white/[0.05] rounded-lg hover:border-white/[0.1] transition-colors group"
        >
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center min-w-[40px]">
              <span className="text-primary-container font-medium">{question.upvotes}</span>
              <span className="text-[10px] text-white/40">votes</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm text-white group-hover:text-primary-container transition-colors mb-2">
                {question.title}
              </h3>
              <div className="flex items-center gap-4 text-[11px] text-white/40">
                <span>{formatDate(question.created_at)}</span>
                <span>{question.answers_count} answers</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
