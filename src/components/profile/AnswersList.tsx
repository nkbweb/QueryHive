'use client'

import Link from 'next/link'
import { ArrowBigUp, Clock, ChevronRight, MessageSquare } from 'lucide-react'

interface Answer {
  id: string
  content: string
  upvotes: number
  created_at: string
  question?: { id: string; title: string }
  questions?: { id: string; title: string }
  question_id?: string
}

const formatTime = (d: string) => {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function AnswersList({ answers }: { answers: Answer[] }) {
  if (answers.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-gray-600">No answers given yet</div>
    )
  }

  return (
    <div className="flex flex-col border border-white/[0.05] rounded-xl overflow-hidden">
      {answers.map((answer) => {
        const q = (answer as any).questions || (answer as any).question
        const questionId = q?.id || (answer as any).question_id
        if (!questionId) return null
        const questionTitle = q?.title || 'Unknown question'

        return (
          <Link
            key={answer.id}
            href={`/questions/${questionId}`}
            className="group flex items-start px-4 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors gap-5 min-w-0"
          >
            {/* Upvote stat */}
            <div className="flex items-center gap-1 min-w-[48px] pt-0.5">
              <ArrowBigUp size={15} className={answer.upvotes > 0 ? 'text-orange-500' : 'text-gray-700'} />
              <span className={`text-xs font-mono ${answer.upvotes > 0 ? 'text-gray-300' : 'text-gray-600'}`}>
                {answer.upvotes}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Parent question */}
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare size={11} className="text-gray-700 flex-shrink-0" />
                <span className="text-[11px] text-gray-600 truncate">
                  on: <span className="text-gray-500 group-hover:text-gray-400 transition-colors">{questionTitle}</span>
                </span>
              </div>
              {/* Answer excerpt */}
              <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors line-clamp-2 leading-snug">
                {answer.content}
              </p>
            </div>

            {/* Time + chevron */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0 pt-0.5">
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-gray-700 font-mono">
                <Clock size={11} />
                <span>{formatTime(answer.created_at)}</span>
              </div>
              <ChevronRight size={13} className="text-gray-800 group-hover:text-gray-500 transition-all group-hover:translate-x-0.5" />
            </div>
          </Link>
        )
      }).filter(Boolean)}
    </div>
  )
}
