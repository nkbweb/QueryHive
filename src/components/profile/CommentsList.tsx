'use client'

import Link from 'next/link'
import { Clock, ChevronRight, MessageSquare, ArrowBigUp } from 'lucide-react'

interface Comment {
  id: string
  content: string
  upvotes: number
  downvotes: number
  created_at: string
  answer?: { id: string; question?: { id: string; title: string }; questions?: { id: string; title: string }; question_id?: string }
  answers?: { id: string; question?: { id: string; title: string }; questions?: { id: string; title: string }; question_id?: string }
}

const formatTime = (d: string) => {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function CommentsList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-gray-600">No comments made yet</div>
    )
  }

  return (
    <div className="flex flex-col border border-white/[0.05] rounded-xl overflow-hidden">
      {comments.map((comment) => {
        const answer = (comment as any).answers || (comment as any).answer
        const question = answer?.question || answer?.questions
        const questionId = question?.id || answer?.question_id
        if (!questionId) return null
        const questionTitle = question?.title || 'Unknown question'

        return (
          <Link
            key={comment.id}
            href={`/questions/${questionId}`}
            className="group flex items-start px-4 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors gap-5 min-w-0"
          >
            {/* Upvote stat */}
            <div className="flex items-center gap-1 min-w-[48px] pt-0.5">
              <ArrowBigUp size={15} className={comment.upvotes > 0 ? 'text-orange-500' : 'text-gray-700'} />
              <span className={`text-xs font-mono ${comment.upvotes > 0 ? 'text-gray-300' : 'text-gray-600'}`}>
                {comment.upvotes}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Parent label */}
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare size={11} className="text-gray-700 flex-shrink-0" />
                <span className="text-[11px] text-gray-600 truncate">
                  reply on: <span className="text-gray-500 group-hover:text-gray-400 transition-colors">{questionTitle}</span>
                </span>
              </div>
              {/* Comment text */}
              <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors line-clamp-2 leading-snug">
                {comment.content}
              </p>
            </div>

            {/* Time + chevron */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0 pt-0.5">
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-gray-700 font-mono">
                <Clock size={11} />
                <span>{formatTime(comment.created_at)}</span>
              </div>
              <ChevronRight size={13} className="text-gray-800 group-hover:text-gray-500 transition-all group-hover:translate-x-0.5" />
            </div>
          </Link>
        )
      }).filter(Boolean)}
    </div>
  )
}
