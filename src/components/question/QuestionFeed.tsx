'use client'

import Link from 'next/link'
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading'

type Question = {
  id: string
  title: string
  upvotes: number
  answersCount: number
  createdAt: string
  tags?: string[]
  status?: string
}

export default function QuestionFeed({ questions = [] }: { questions: Question[] }) {
  const { navigate } = useNavigationWithLoading()

  const handleQuestionClick = (e: React.MouseEvent, questionId: string) => {
    e.preventDefault()
    navigate(`/questions/${questionId}`)
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#08080A]">
      
      {/* Header & Filter */}
      <header className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-base font-medium text-white tracking-tight">Home</h1>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary-container/10 border border-primary-container/20">
            <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse"></span>
            <span className="text-[10px] font-label text-primary-container">
              {questions.length} NEW
            </span>
          </div>
        </div>

        {/* Filters (static for now) */}
        <div className="flex gap-6 border-b border-[#1C1B1E] overflow-x-auto no-scrollbar">
          <button className="pb-2 border-b-2 border-primary-container text-[13px] text-white font-medium">For You</button>
          <button className="pb-2 border-b-2 border-transparent text-[13px] text-white/50 hover:text-white">Newest</button>
          <button className="pb-2 border-b-2 border-transparent text-[13px] text-white/50 hover:text-white">Trending</button>
          <button className="pb-2 border-b-2 border-transparent text-[13px] text-white/50 hover:text-white">Unanswered</button>
        </div>
      </header>

      {/* Question List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col">

          {questions.map((q) => (
            <Link
              key={q.id}
              href={`/questions/${q.id}`}
              onClick={(e) => handleQuestionClick(e, q.id)}
              className="h-[52px] px-6 flex items-center gap-4 border-b border-white/[0.03] active-border-hover group cursor-pointer transition-colors block"
            >
              {/* Upvotes */}
              <div className="w-10 text-[11px] font-label text-white/40 flex flex-col items-center group-hover:text-primary-container">
                <span className="text-[8px]">+</span>
                <span>{q.upvotes}</span>
              </div>

              {/* Status Dot */}
              <div className="w-2.5 h-2.5 bg-primary-container"></div>

              {/* Content */}
              <div className="flex-1 flex items-center justify-between min-w-0">
                <div className="flex flex-col">
                  <span className="text-sm text-white hover:text-primary-container">
                    {q.title}
                  </span>
                </div>

                {/* Right Info */}
                <div className="flex items-center gap-4 text-[11px] text-white/30 font-label">
                  <span>{q.createdAt}</span>
                  <span className="text-white/60">
                    {q.answersCount} answers
                  </span>
                </div>
              </div>
            </Link>
          ))}

        </div>
      </div>
    </main>
  )
}