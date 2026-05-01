'use client'

import { useState, useEffect, useCallback } from 'react'
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
  const [activeTab, setActiveTab] =
    useState<'for-you' | 'newest' | 'trending' | 'unanswered'>('for-you')

  const [filteredQuestions, setFilteredQuestions] = useState(questions)

  const handleQuestionClick = (e: React.MouseEvent, questionId: string) => {
    e.preventDefault()
    navigate(`/questions/${questionId}`)
  }

  const fetchFilteredQuestions = useCallback(async (tab: typeof activeTab) => {
    try {
      let endpoint = '/api/questions'

      if (tab === 'newest') endpoint = '/api/questions?sort=newest'
      if (tab === 'trending') endpoint = '/api/questions?sort=trending'
      if (tab === 'unanswered') endpoint = '/api/questions?sort=unanswered'

      const res = await fetch(endpoint)
      const data = await res.json()

      setFilteredQuestions(data.questions || [])
    } catch {
      setFilteredQuestions(questions)
    }
  }, [questions])

  useEffect(() => {
    fetchFilteredQuestions(activeTab)
  }, [activeTab, fetchFilteredQuestions])

  // ✅ Date formatter
  const formatDateTime = (iso: string) => {
    const date = new Date(iso)

    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden">

      {/* Header */}
      <header className="px-4 sm:px-6 pt-5 pb-3">

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-semibold text-white">
              Home
            </h1>
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-lime-accent to-emerald-400 animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-lime-accent/10 to-emerald-500/10 border border-lime-accent/20 rounded-full">
            <span className="w-1.5 h-1.5 bg-lime-accent rounded-full animate-pulse" />
            <span className="text-[10px] sm:text-[11px] text-lime-accent font-medium">
              {filteredQuestions.length} NEW
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-surface-container-low overflow-x-auto no-scrollbar">

          {(['for-you', 'newest', 'trending', 'unanswered'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-lg text-[12px] font-medium capitalize transition-all duration-200 whitespace-nowrap relative
                ${activeTab === tab
                  ? 'text-white bg-surface-container-high/50'
                  : 'text-white/50 hover:text-white hover:bg-surface-container-high/30'
                }`}
            >
              {tab.replace('-', ' ')}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-lime-accent to-emerald-400 rounded-full" />
              )}
            </button>
          ))}

        </div>
      </header>

      {/* List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-0 scrollbar-thin scrollbar-track-surface-container-high/20 scrollbar-thumb-surface-container-high/40">

        <div className="flex flex-col">

          {filteredQuestions.map((q, index) => (
            <Link
              key={q.id}
              href={`/questions/${q.id}`}
              onClick={(e) => handleQuestionClick(e, q.id)}
              className="group flex items-center gap-2.5 px-4 sm:px-6 py-2.5 border-b border-surface-container-low/50 hover:bg-surface-container-high/20 transition-all duration-200 relative overflow-hidden"
              style={{
                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
              }}
            >
              {/* Gradient accent on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-lime-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Upvotes */}
              <div className="hidden sm:flex flex-col items-center w-10 text-[11px] text-white/40 group-hover:text-lime-accent transition-colors relative z-10">
                <div className="flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  <span className="font-semibold">{q.upvotes}</span>
                </div>
              </div>

              {/* Status indicator */}
              <div className={`w-2 h-2 rounded-full shrink-0 relative z-10 ${
                q.status === 'answered' ? 'bg-emerald-400 shadow-lg shadow-emerald-400/30' :
                q.status === 'unanswered' ? 'bg-lime-accent shadow-lg shadow-lime-accent/30' :
                'bg-white/30'
              }`} />

              {/* Content */}
              <div className="flex-1 min-w-0 relative z-10">

                {/* Title and Tags */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <div className="text-sm sm:text-base text-white group-hover:text-lime-accent transition-colors line-clamp-1 flex-1">
                      {q.title}
                    </div>
                    
                    {/* Tags */}
                    {q.tags && q.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {q.tags.slice(0, 2).map((tag: any, i: number) => {
                          const tagColors = [
                            'bg-orange-500/20 text-orange-300 border-orange-400/30',
                            'bg-pink-500/20 text-pink-300 border-pink-400/30',
                            'bg-green-500/20 text-green-300 border-green-400/30',
                            'bg-purple-500/20 text-purple-300 border-purple-400/30',
                            'bg-blue-500/20 text-blue-300 border-blue-400/30'
                          ]
                          return (
                            <span
                              key={i}
                              className={`px-1.5 py-0.5 border rounded text-[9px] font-medium ${tagColors[i % tagColors.length]} group-hover:opacity-80 transition-all`}
                            >
                              {tag.name || tag}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Meta */}
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-white/30">
                    <span className="group-hover:text-white/50 transition-colors">{formatDateTime(q.createdAt)}</span>
                    <span className="text-white/20">•</span>
                    <span className="group-hover:text-white/50 transition-colors">
                      {q.answersCount} {q.answersCount === 1 ? 'answer' : 'answers'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Chevron */}
              <div className="text-white/20 group-hover:text-lime-accent group-hover:translate-x-1 transition-all duration-200 relative z-10 ml-1">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </div>

            </Link>
          ))}

        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Custom scrollbar styling */
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          width: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </main>
  )
}