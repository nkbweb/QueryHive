'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowBigUp, MessageSquare, Clock, ChevronRight, Search, Plus } from 'lucide-react'
import ExploreSidebar from '@/components/explore/ExploreSidebar'
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading'

type Question = {
  id: string
  title: string
  content: string
  views: number
  upvotes: number
  answerCount: number
  createdAt: string
  username: string
  tags: Array<{
    id: string
    name: string
    color: string
  }>
}

type Tag = {
  id: string
  name: string
  color: string
  questionCount: number
}

type User = {
  id: string
  username: string
  name: string
  avatarUrl: string | null
  reputation: number
}

type Stats = {
  questionsCount: number
  answersCount: number
  usersCount: number
  tagsCount: number
}

const TABS = [
  { id: 'trending',    label: 'Trending' },
  { id: 'recent',     label: 'Recent' },
  { id: 'unanswered', label: 'Unanswered' },
  { id: 'ai-answered',label: 'AI Answered' },
  { id: 'most-viewed',label: 'Most Viewed' },
] as const

type TabId = typeof TABS[number]['id']

export default function ExplorePage() {
  const { navigate } = useNavigationWithLoading()

  const [activeTab, setActiveTab] = useState<TabId>('trending')
  const [questions, setQuestions]  = useState<Question[]>([])
  const [tags, setTags]            = useState<Tag[]>([])
  const [users, setUsers]          = useState<User[]>([])
  const [stats, setStats]          = useState<Stats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading]      = useState(true)
  const [activeTagId, setActiveTagId] = useState<string | null>(null)

  /* ── data fetching ───────────────────────────────────────── */
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const endpoint = `/api/explore/${activeTab}`
      const [questionsRes, tagsRes, usersRes, statsRes] = await Promise.all([
        fetch(endpoint),
        fetch('/api/explore/tags?limit=15'),
        fetch('/api/explore/users?limit=5'),
        fetch('/api/explore/stats'),
      ])
      const [questionsData, tagsData, usersData, statsData] = await Promise.all([
        questionsRes.json(),
        tagsRes.json(),
        usersRes.json(),
        statsRes.json(),
      ])
      setQuestions(questionsData.questions || [])
      setTags(tagsData.tags || [])
      setUsers(usersData.users || [])
      setStats(statsData.stats)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => { fetchData() }, [activeTab, fetchData])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) { fetchData(); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/explore/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setQuestions(data.questions || [])
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (!value.trim()) fetchData()
  }

  const handleTagClick = async (tagId: string) => {
    if (activeTagId === tagId) { setActiveTagId(null); fetchData(); return }
    setActiveTagId(tagId)
    setLoading(true)
    try {
      const res = await fetch(`/api/questions?tag=${tagId}`)
      const data = await res.json()
      setQuestions(data.questions || [])
    } catch (error) {
      console.error('Error fetching questions by tag:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    navigate(`/questions/${id}`)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

  /* ── render ──────────────────────────────────────────────── */
  return (
    <div className="flex h-full bg-[#050505]">

      {/* ── MAIN ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden border-x border-white/[0.05]">

        {/* Header — matches QuestionFeed header exactly */}
        <header className="w-full px-4 pt-6 pb-2 border-b border-white/[0.05]">

          {/* Title row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-medium text-white tracking-tight">Explore</h1>
              {stats && (
                <span className="text-[11px] font-mono bg-white/[0.05] text-gray-500 px-2 py-0.5 rounded border border-white/[0.05]">
                  {stats.questionsCount} QUESTIONS
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/ask')}
              className="sm:hidden flex items-center gap-2 bg-white text-black px-4 py-1.5 rounded text-sm font-semibold hover:bg-gray-200 transition-all active:scale-[0.98]"
            >
              <Plus size={16} />
              Ask
            </button>
          </div>

          {/* Search — styled to match the feed's monochrome terminal feel */}
          <form onSubmit={handleSearch} className="relative mb-5">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
            />
            <input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search questions…"
              className="w-full pl-8 pr-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded text-sm text-white/80 placeholder:text-gray-600 focus:border-white/20 focus:bg-white/[0.05] outline-none transition"
            />
          </form>

          {/* Tabs — identical to QuestionFeed tabs */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTagId(null); setActiveTab(tab.id) }}
                className={`relative px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="exploreTabBorder"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white shadow-[0_-2px_6px_rgba(255,255,255,0.3)]"
                  />
                )}
              </button>
            ))}
          </div>
        </header>

        {/* Question List — pixel-perfect match to QuestionFeed */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            {loading ? (
              <LoadingSkeleton />
            ) : questions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-3 h-48 text-gray-600"
              >
                <Search size={28} strokeWidth={1.5} />
                <span className="text-sm">No questions found</span>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab + activeTagId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {questions.map((q) => (
                  <Link
                    key={q.id}
                    href={`/questions/${q.id}`}
                    onClick={(e) => handleQuestionClick(e, q.id)}
                    className="group flex items-center w-full px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors gap-6 min-w-0"
                  >
                    {/* Stats column */}
                    <div className="flex items-center gap-2 sm:gap-4 min-w-[40px] sm:min-w-[100px]">
                      <div className="flex items-center gap-1.5 min-w-[40px]">
                        <ArrowBigUp
                          size={16}
                          className={q.upvotes > 0 ? 'text-orange-500' : 'text-gray-700'}
                        />
                        <span className={`text-xs font-mono ${q.upvotes > 0 ? 'text-gray-200' : 'text-gray-600'}`}>
                          {q.upvotes}
                        </span>
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5">
                        <MessageSquare
                          size={14}
                          className={q.answerCount > 0 ? 'text-blue-500' : 'text-gray-700'}
                        />
                        <span className="text-xs font-mono text-gray-600">{q.answerCount}</span>
                      </div>
                    </div>

                    {/* Title + tags */}
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

                    {/* Date + chevron */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-600 font-mono">
                        <Clock size={12} />
                        <span>{formatDate(q.createdAt)}</span>
                      </div>
                      <ChevronRight
                        size={14}
                        className="text-gray-800 group-hover:text-gray-400 transition-all group-hover:translate-x-0.5"
                      />
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <ExploreSidebar
          tags={tags}
          users={users}
          stats={stats}
          onTagClick={handleTagClick}
          activeTagId={activeTagId}
        />
      </div>

    </div>
  )
}

/* Loading skeleton — identical to QuestionFeed's LoadingSkeleton */
function LoadingSkeleton() {
  return (
    <motion.div
      key="skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      {[...Array(10)].map((_, i) => (
        <div key={i} className="w-full h-12 border-b border-white/[0.03] flex items-center px-4 gap-6">
          <div className="w-16 h-3 bg-white/[0.05] animate-pulse rounded" />
          <div className="flex-1 h-3 bg-white/[0.05] animate-pulse rounded" />
          <div className="w-20 h-3 bg-white/[0.05] animate-pulse rounded" />
        </div>
      ))}
    </motion.div>
  )
}