'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading'
import { createClient } from '@/lib/supabase/client'

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
  const [activeTab, setActiveTab] = useState<'for-you' | 'newest' | 'trending' | 'unanswered'>('for-you')
  const [filteredQuestions, setFilteredQuestions] = useState(questions)

  const handleQuestionClick = (e: React.MouseEvent, questionId: string) => {
    e.preventDefault()
    navigate(`/questions/${questionId}`)
  }

  const fetchFilteredQuestions = useCallback(async (tab: typeof activeTab) => {
    try {
      let endpoint = '/api/questions'
      
      switch (tab) {
        case 'newest':
          endpoint = '/api/questions?sort=newest'
          break
        case 'trending':
          endpoint = '/api/questions?sort=trending'
          break
        case 'unanswered':
          endpoint = '/api/questions?sort=unanswered'
          break
        default:
          endpoint = '/api/questions'
      }

      const response = await fetch(endpoint)
      const data = await response.json()
      setFilteredQuestions(data.questions || [])
    } catch (error) {
      console.error('Error fetching filtered questions:', error)
      setFilteredQuestions(questions)
    }
  }, [questions])

  useEffect(() => {
    fetchFilteredQuestions(activeTab)
  }, [activeTab, fetchFilteredQuestions])

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#08080A]">
      
      {/* Header & Filter */}
      <header className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <h1 className="text-base sm:text-lg font-medium text-white tracking-tight">Home</h1>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary-container/10 border border-primary-container/20">
            <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse"></span>
            <span className="text-[10px] sm:text-[11px] font-label text-primary-container">
              {filteredQuestions.length} <span className="hidden sm:inline">NEW</span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 sm:gap-6 border-b border-[#1C1B1E] overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('for-you')}
            className={`pb-2 border-b-2 text-[10px] sm:text-[13px] font-medium px-2 sm:px-3 transition-colors ${
              activeTab === 'for-you' 
                ? 'border-primary-container text-white' 
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            For You
          </button>
          <button 
            onClick={() => setActiveTab('newest')}
            className={`pb-2 border-b-2 text-[10px] sm:text-[13px] font-medium px-2 sm:px-3 transition-colors ${
              activeTab === 'newest' 
                ? 'border-primary-container text-white' 
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Newest
          </button>
          <button 
            onClick={() => setActiveTab('trending')}
            className={`pb-2 border-b-2 text-[10px] sm:text-[13px] font-medium px-2 sm:px-3 transition-colors ${
              activeTab === 'trending' 
                ? 'border-primary-container text-white' 
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Trending
          </button>
          <button 
            onClick={() => setActiveTab('unanswered')}
            className={`pb-2 border-b-2 text-[10px] sm:text-[13px] font-medium px-2 sm:px-3 transition-colors ${
              activeTab === 'unanswered' 
                ? 'border-primary-container text-white' 
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Unanswered
          </button>
        </div>
      </header>

      {/* Question List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 sm:px-0">
        <div className="flex flex-col gap-3 sm:gap-4">

          {filteredQuestions.map((q) => (
            <Link
              key={q.id}
              href={`/questions/${q.id}`}
              onClick={(e) => handleQuestionClick(e, q.id)}
              className="h-[48px] sm:h-[52px] px-4 sm:px-6 flex items-center gap-3 sm:gap-4 border-b border-white/[0.03] active-border-hover group cursor-pointer transition-colors block"
            >
              {/* Upvotes */}
              <div className="hidden sm:flex w-10 text-[11px] font-label text-white/40 flex flex-col items-center group-hover:text-primary-container">
                <span className="text-[8px]">+</span>
                <span>{q.upvotes}</span>
              </div>

              {/* Status Dot */}
              <div className="w-2.5 h-2.5 bg-primary-container"></div>

              {/* Content */}
              <div className="flex-1 flex items-center justify-between min-w-0">
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base text-white hover:text-primary-container line-clamp-1 sm:line-clamp-2">
                    {q.title}
                  </span>
                </div>

                {/* Right Info */}
                <div className="hidden sm:flex items-center gap-2 sm:gap-4 text-[11px] text-white/30 font-label">
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