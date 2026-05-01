'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
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

export default function ExplorePage() {
  const { navigate } = useNavigationWithLoading()

  const [activeTab, setActiveTab] = useState<
    'trending' | 'recent' | 'unanswered' | 'ai-answered' | 'most-viewed'
  >('trending')

  const [questions, setQuestions] = useState<Question[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTagId, setActiveTagId] = useState<string | null>(null)

  const handleQuestionClick = (e: React.MouseEvent, questionId: string) => {
    e.preventDefault()
    navigate(`/questions/${questionId}`)
  }

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

      const [questionsData, tagsData, usersData, statsData] =
        await Promise.all([
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

  useEffect(() => {
    fetchData()
  }, [activeTab, fetchData])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      fetchData()
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `/api/explore/search?q=${encodeURIComponent(searchQuery)}`
      )
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
    if (activeTagId === tagId) {
      setActiveTagId(null)
      fetchData()
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

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="px-6 pt-6 pb-3">

          <div className="flex items-center gap-3 mb-5">
            <h1 className="text-base font-medium text-white">Explore</h1>

            {stats && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/[0.03] border border-white/[0.06] rounded">
                <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse" />
                <span className="text-[10px] text-primary-container font-medium">
                  {stats.questionsCount} QUESTIONS
                </span>
              </div>
            )}
          </div>

          {/* SEARCH */}
          <form onSubmit={handleSearch} className="mb-3">
            <input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search questions..."
              className="w-full px-3 py-2 bg-[#131315] border border-[#1C1B1E] rounded-md text-sm text-white placeholder:text-white/40 focus:border-primary-container outline-none"
            />
          </form>

          {/* TABS */}
          <div className="flex gap-5 border-b border-[#1C1B1E] overflow-x-auto no-scrollbar">

            {['trending', 'recent', 'unanswered', 'ai-answered', 'most-viewed'].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-2 text-[12px] font-medium border-b-2 transition ${
                    activeTab === tab
                      ? 'border-primary-container text-white'
                      : 'border-transparent text-white/50 hover:text-white'
                  }`}
                >
                  {tab.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </button>
              )
            )}
          </div>
        </header>

        {/* FEED */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3">

          {loading ? (
            <div className="flex items-center justify-center h-24 text-white/40 text-sm">
              Loading...
            </div>
          ) : questions.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-white/40 text-sm">
              No questions found
            </div>
          ) : (
            <div className="flex flex-col">

              {questions.map((q) => (
                <Link
                  key={q.id}
                  href={`/questions/${q.id}`}
                  onClick={(e) => handleQuestionClick(e, q.id)}
                  className="group flex gap-3 px-3 py-2.5 border-b border-white/[0.04] hover:bg-white/[0.015] transition"
                >

                  {/* VOTES */}
                  <div className="hidden md:flex flex-col items-center w-7 text-white/40 group-hover:text-[#E8FF47] transition">
                    <span className="text-[9px]">▲</span>
                    <span className="text-xs">{q.upvotes}</span>
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1 min-w-0">

                    <h3 className="text-[13.5px] font-medium text-white group-hover:text-[#E8FF47] line-clamp-1">
                      {q.title}
                    </h3>

                    <div className="flex items-center gap-2 text-[10.5px] text-white/40 mt-0.5">
                      <span className="text-white/60">{q.username}</span>
                      <span>•</span>
                      <span>{q.answerCount} answers</span>
                      <span>•</span>
                      <span>{q.createdAt}</span>
                    </div>

                    {/* TAGS */}
                    {q.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1.5">
                        {q.tags.map((tag, idx) => {
                          const colors = [
                            'text-cyan-300 bg-cyan-500/10 border-cyan-400/20 hover:bg-cyan-500/15',
                            'text-lime-300 bg-lime-500/10 border-lime-400/20 hover:bg-lime-500/15',
                            'text-purple-300 bg-purple-500/10 border-purple-400/20 hover:bg-purple-500/15',
                            'text-pink-300 bg-pink-500/10 border-pink-400/20 hover:bg-pink-500/15',
                            'text-amber-300 bg-amber-500/10 border-amber-400/20 hover:bg-amber-500/15',
                          ]

                          return (
                            <span
                              key={tag.id}
                              className={`px-2 py-[1px] text-[9.5px] rounded border ${colors[idx % colors.length]} transition`}
                            >
                              {tag.name}
                            </span>
                          )
                        })}
                      </div>
                    )}

                  </div>
                </Link>
              ))}

            </div>
          )}
        </div>
      </main>

      {/* SIDEBAR */}
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