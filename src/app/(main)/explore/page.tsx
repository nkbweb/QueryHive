'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import ExploreSidebar from '@/components/explore/ExploreSidebar'

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

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<'trending' | 'recent' | 'unanswered' | 'ai-answered' | 'most-viewed'>('trending')
  const [questions, setQuestions] = useState<Question[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTagId, setActiveTagId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const endpoint = `/api/explore/${activeTab}`
      const [questionsRes, tagsRes, usersRes, statsRes] = await Promise.all([
        fetch(endpoint),
        fetch('/api/explore/tags?limit=15'),
        fetch('/api/explore/users?limit=5'),
        fetch('/api/explore/stats')
      ])

      const [questionsData, tagsData, usersData, statsData] = await Promise.all([
        questionsRes.json(),
        tagsRes.json(),
        usersRes.json(),
        statsRes.json()
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

  useEffect(() => {
    fetchData()
  }, [activeTab, fetchData])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      // If search is cleared, restore the feed
      fetchData()
      return
    }

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
    if (!value.trim()) {
      // If search is cleared, restore the feed
      fetchData()
    }
  }

  const handleTagClick = async (tagId: string) => {
    // If clicking the same tag, toggle it off
    if (activeTagId === tagId) {
      setActiveTagId(null)
      fetchData() // Restore previous feed
      return
    }

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

  return (
    <div className="flex h-full bg-[#08080A]">
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-base font-medium text-white tracking-tight">Explore</h1>
            {stats && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary-container/10 border border-primary-container/20">
                <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse"></span>
                <span className="text-[10px] font-label text-primary-container">
                  {stats.questionsCount} QUESTIONS
                </span>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search questions..."
              className="w-full px-4 py-2 bg-[#131315] border border-[#1C1B1E] rounded-lg text-sm text-white placeholder:text-white/40 focus:border-primary-container transition-colors"
            />
          </form>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-[#1C1B1E] overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('trending')}
              className={`pb-2 border-b-2 text-[13px] font-medium transition-colors ${
                activeTab === 'trending'
                  ? 'border-primary-container text-white'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`pb-2 border-b-2 text-[13px] font-medium transition-colors ${
                activeTab === 'recent'
                  ? 'border-primary-container text-white'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setActiveTab('unanswered')}
              className={`pb-2 border-b-2 text-[13px] font-medium transition-colors ${
                activeTab === 'unanswered'
                  ? 'border-primary-container text-white'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              Unanswered
            </button>
            <button
              onClick={() => setActiveTab('ai-answered')}
              className={`pb-2 border-b-2 text-[13px] font-medium transition-colors ${
                activeTab === 'ai-answered'
                  ? 'border-primary-container text-white'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              AI Answered
            </button>
            <button
              onClick={() => setActiveTab('most-viewed')}
              className={`pb-2 border-b-2 text-[13px] font-medium transition-colors ${
                activeTab === 'most-viewed'
                  ? 'border-primary-container text-white'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              Most Viewed
            </button>
          </div>
        </header>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-white/40 text-sm">Loading...</div>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-white/40 text-sm">No questions found</div>
            </div>
          ) : (
            <div className="flex flex-col py-4">
              {questions.map((q) => (
                <Link
                  key={q.id}
                  href={`/questions/${q.id}`}
                  className="px-4 py-3 flex items-start gap-4 border-b border-white/[0.03] group block"
                >
                  {/* Upvotes */}
                  <div className="w-10 text-[11px] font-label text-white/40 flex flex-col items-center group-hover:text-primary-container shrink-0">
                    <span className="text-[8px]">+</span>
                    <span>{q.upvotes}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm text-white group-hover:text-primary-container mb-1 line-clamp-2">
                      {q.title}
                    </h3>
                    <p className="text-xs text-white/50 mb-2 line-clamp-2">
                      {q.content}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-white/30 font-label">
                      <span>{q.username}</span>
                      <span>•</span>
                      <span>{q.createdAt}</span>
                      <span>•</span>
                      <span className="text-white/60">{q.answerCount} answers</span>
                    </div>
                    {q.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {q.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-0.5 bg-surface-container text-[10px] font-label text-white/60 border border-white/5"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Sidebar */}
      <ExploreSidebar tags={tags} users={users} stats={stats} onTagClick={handleTagClick} activeTagId={activeTagId} />
    </div>
  )
}
