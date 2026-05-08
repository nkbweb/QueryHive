'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, ArrowBigUp, Clock, Tag, Plus, ChevronRight } from 'lucide-react'
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading'

type Question = {
  id: string
  title: string
  upvotes: number
  answersCount: number
  createdAt: string
  tags?: string[]
}

const TABS = [
  { id: 'for-you', label: 'For You' },
  { id: 'newest', label: 'Newest' },
  { id: 'trending', label: 'Trending' },
  { id: 'unanswered', label: 'Unanswered' },
] as const

export default function QuestionFeed({ questions: initialQuestions = [] }: { questions: Question[] }) {
  const { navigate } = useNavigationWithLoading()
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('for-you')
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(initialQuestions)
  const [loading, setLoading] = useState(false)

  const fetchFilteredQuestions = useCallback(async (tab: string) => {
    setLoading(true)
    try {
      const endpoint = tab === 'for-you' ? '/api/questions' : `/api/questions?sort=${tab}`
      const res = await fetch(endpoint)
      const data = await res.json()
      setFilteredQuestions(data.questions || [])
    } catch {
      setFilteredQuestions(initialQuestions)
    } finally {
      setLoading(false)
    }
  }, [initialQuestions])

  useEffect(() => {
    fetchFilteredQuestions(activeTab)
  }, [activeTab, fetchFilteredQuestions])

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short',
    })
  }

  return (
    <section className="flex flex-col h-full bg-[#050505] border-x border-white/[0.05] min-w-0 overflow-hidden">
      {/* Header - Stretches to container width */}
      <header className="w-full px-4 pt-6 pb-2 border-b border-white/[0.05]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-medium text-white tracking-tight">Questions</h1>
            <span className="text-[11px] font-mono bg-white/[0.05] text-gray-500 px-2 py-0.5 rounded border border-white/[0.05]">
              {filteredQuestions.length} TOTAL
            </span>
          </div>
          <button 
            onClick={() => navigate('/ask')}
            className="sm:hidden flex items-center gap-2 bg-white text-black px-4 py-1.5 rounded text-sm font-semibold hover:bg-gray-200 transition-all active:scale-[0.98]"
          >
            <Plus size={16} />
            Ask
          </button>
        </div>

        {/* Minimalist Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabBorder"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white shadow-[0_-2px_6px_rgba(255,255,255,0.3)]" 
                />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {filteredQuestions.map((q) => (
                <Link
                  key={q.id}
                  href={`/questions/${q.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(`/questions/${q.id}`)
                  }}
                  className="group flex items-center w-full px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors gap-6 min-w-0"
                >
                  {/* Stats Group */}
                  <div className="flex items-center gap-2 sm:gap-4 min-w-[40px] sm:min-w-[100px]">
                    <div className="flex items-center gap-1.5 min-w-[40px]">
                      <ArrowBigUp size={16} className={q.upvotes > 0 ? 'text-orange-500' : 'text-gray-700'} />
                      <span className={`text-xs font-mono ${q.upvotes > 0 ? 'text-gray-200' : 'text-gray-600'}`}>
                        {q.upvotes}
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5">
                      <MessageSquare size={14} className={q.answersCount > 0 ? 'text-blue-500' : 'text-gray-700'} />
                      <span className="text-xs font-mono text-gray-600">{q.answersCount}</span>
                    </div>
                  </div>

                  {/* Title and Tags - Space-between layout */}
                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
                    <h2 className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                      {q.title}
                    </h2>

                    {/* Inline Tags - High-End Minimalist Design */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {q.tags?.slice(0, 3).map((tag: any, i: number) => {
                        const colors = [
                          { text: '#22d3ee', glow: 'rgba(34, 211, 238, 0.4)' }, // cyan
                          { text: '#a3e635', glow: 'rgba(163, 230, 53, 0.4)' }, // lime
                          { text: '#c084fc', glow: 'rgba(192, 132, 252, 0.4)' }, // purple
                          { text: '#f472b6', glow: 'rgba(244, 114, 182, 0.4)' }, // pink
                          { text: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' }, // amber
                        ]
                        const color = colors[i % colors.length]
                        return (
                          <span
                            key={i}
                            className="relative group/tag flex items-center px-2 py-0.5 rounded-full overflow-hidden transition-all duration-300 hover:scale-[1.03]"
                          >
                            {/* Subtle Glass Background */}
                            <div className="absolute inset-0 bg-white/[0.03] border border-white/[0.08] rounded-full group-hover/tag:bg-white/[0.06] group-hover/tag:border-white/[0.15] transition-all" />
                            
                            {/* Left Accent Dot */}
                            <div 
                              className="w-1 h-1 rounded-full mr-1.5 transition-all duration-300 group-hover/tag:scale-125"
                              style={{ 
                                backgroundColor: color.text,
                                boxShadow: `0 0 4px ${color.glow}`
                              }} 
                            />

                            {/* Tag Label */}
                            <span 
                              className="relative text-[10px] font-semibold tracking-wide transition-colors duration-300 text-gray-400 group-hover/tag:text-white"
                              style={{ textTransform: 'uppercase' }}
                            >
                              {tag.name || tag}
                            </span>
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  {/* Time & Action */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-600 font-mono">
                      <Clock size={12} />
                      <span>{formatDateTime(q.createdAt)}</span>
                    </div>
                    <ChevronRight size={14} className="text-gray-800 group-hover:text-gray-400 transition-all group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function LoadingSkeleton() {
  return (
    <div className="w-full">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="w-full h-12 border-b border-white/[0.03] flex items-center px-4 gap-6">
          <div className="w-16 h-3 bg-white/[0.05] animate-pulse rounded" />
          <div className="flex-1 h-3 bg-white/[0.05] animate-pulse rounded" />
          <div className="w-20 h-3 bg-white/[0.05] animate-pulse rounded" />
        </div>
      ))}
    </div>
  )
}