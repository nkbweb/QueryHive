'use client'

import Link from 'next/link'
import { ArrowBigUp, MessageSquare, Clock, ChevronRight } from 'lucide-react'

interface Question {
  id: string
  title: string
  upvotes: number
  answers_count: number
  created_at: string
}

const formatTime = (d: string) => {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function QuestionsList({ questions }: { questions: Question[] }) {
  if (questions.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-gray-600">No questions asked yet</div>
    )
  }

  return (
    <div className="flex flex-col border border-white/[0.05] rounded-xl overflow-hidden">
      {questions.map((q) => (
        <Link
          key={q.id}
          href={`/questions/${q.id}`}
          className="group flex items-center px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors gap-5 min-w-0"
        >
          {/* Stats */}
          <div className="flex items-center gap-3 min-w-[80px]">
            <div className="flex items-center gap-1">
              <ArrowBigUp size={15} className={q.upvotes > 0 ? 'text-orange-500' : 'text-gray-700'} />
              <span className={`text-xs font-mono ${q.upvotes > 0 ? 'text-gray-300' : 'text-gray-600'}`}>
                {q.upvotes}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare size={13} className={q.answers_count > 0 ? 'text-blue-500' : 'text-gray-700'} />
              <span className="text-xs font-mono text-gray-600">{q.answers_count}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="flex-1 text-sm text-gray-300 group-hover:text-white transition-colors truncate">
            {q.title}
          </h3>

          {/* Time + chevron */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-gray-700 font-mono">
              <Clock size={11} />
              <span>{formatTime(q.created_at)}</span>
            </div>
            <ChevronRight size={13} className="text-gray-800 group-hover:text-gray-500 transition-all group-hover:translate-x-0.5" />
          </div>
        </Link>
      ))}
    </div>
  )
}
