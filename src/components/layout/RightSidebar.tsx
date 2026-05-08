'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Tag {
  id: string
  name: string
  questionsCount?: number
}

interface User {
  id: string
  username: string
  avatar_url?: string
  avatarUrl?: string
  reputation?: number
}

interface Question {
  id: string
  title: string
  answersCount: number
}

export default function RightSidebar() {
  const [tags, setTags] = useState<Tag[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [unansweredQuestions, setUnansweredQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tagsRes, usersRes, questionsRes] = await Promise.all([
          fetch('/api/explore/tags?limit=6'),
          fetch('/api/explore/users?limit=5'),
          fetch('/api/questions?sort=unanswered&limit=3')
        ])

        const [tagsData, usersData, questionsData] = await Promise.all([
          tagsRes.json(),
          usersRes.json(),
          questionsRes.json()
        ])

        setTags(tagsData.tags || [])
        setUsers(usersData.users || [])
        setUnansweredQuestions(questionsData.questions || [])
      } catch (error) {
        console.error('Error fetching sidebar data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatScore = (score: number) => {
    if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`
    if (score >= 1000) return `${(score / 1000).toFixed(1)}k`
    return score.toString()
  }

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <aside className="w-80 h-[calc(100vh-56px)] border-l border-white/[0.05] bg-[#050505] p-6">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-4 bg-white/[0.05] rounded w-1/3 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-white/[0.03] rounded" />
              ))}
            </div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-white/[0.05] rounded w-1/4 mb-4" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-8 w-20 bg-white/[0.03] rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-80 h-[calc(100vh-56px)] border-l border-white/[0.05] bg-[#050505] overflow-y-auto overflow-x-hidden no-scrollbar pointer-events-auto">
      <div className="p-6 space-y-8">
        
        {/* Top Contributors */}
        {users.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-white tracking-tight">Top Contributors</h3>
              <Link 
                href="/leaderboard" 
                className="text-xs text-gray-500 hover:text-gray-300 font-medium transition-colors"
              >
                Full list
              </Link>
            </div>
            <div className="space-y-1">
              {users.map((user, index) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="group flex items-center w-full px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors gap-1.5 min-w-0"
                >
                  {/* Rank */}
                  <div className="flex items-center">
                    <span className="text-xs font-mono text-gray-600">
                      {index + 1}
                    </span>
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white/[0.05] border border-white/[0.08] flex-shrink-0">
                    {(user.avatar_url || user.avatarUrl) ? (
                      <Image
                        src={user.avatar_url || user.avatarUrl!}
                        alt={user.username}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-600">
                        {getInitials(user.username)}
                      </div>
                    )}
                  </div>

                  {/* Name & Reputation */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                      {user.username}
                    </p>
                    {user.reputation !== undefined && (
                      <p className="text-xs text-gray-600">
                        {formatScore(user.reputation)} rep
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-gray-800 group-hover:text-gray-400 transition-all group-hover:translate-x-0.5">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Popular Tags */}
        {tags.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-white tracking-tight">Popular Tags</h3>
              <Link 
                href="/explore" 
                className="text-xs text-gray-500 hover:text-gray-300 font-medium transition-colors"
              >
                Explore
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => {
                const colors = [
                  { text: '#22d3ee', glow: 'rgba(34, 211, 238, 0.4)' }, // cyan
                  { text: '#a3e635', glow: 'rgba(163, 230, 53, 0.4)' }, // lime
                  { text: '#c084fc', glow: 'rgba(192, 132, 252, 0.4)' }, // purple
                  { text: '#f472b6', glow: 'rgba(244, 114, 182, 0.4)' }, // pink
                  { text: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' }, // amber
                ]
                const color = colors[i % colors.length]
                return (
                  <Link
                    key={tag.id}
                    href={`/explore?tag=${tag.id}`}
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
                      {tag.name}
                    </span>
                    {tag.questionsCount && (
                      <span className="text-[9px] text-gray-600 ml-1">
                        {formatScore(tag.questionsCount)}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Unanswered Questions */}
        {unansweredQuestions.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-white tracking-tight">Unanswered Questions</h3>
              <Link 
                href="/explore" 
                className="text-xs text-gray-500 hover:text-gray-300 font-medium transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="space-y-1">
              {unansweredQuestions.map((question) => (
                <Link
                  key={question.id}
                  href={`/questions/${question.id}`}
                  className="group flex items-center w-full px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors gap-6 min-w-0"
                >
                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                      {question.title}
                    </h4>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-gray-800 group-hover:text-gray-400 transition-all group-hover:translate-x-0.5">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-white/[0.05]">
          <div className="text-center">
            <h4 className="text-sm font-medium text-white tracking-tight mb-2">QueryHive</h4>
            <div className="flex justify-center gap-4 text-xs text-gray-600 mb-2">
              <a href="#" className="hover:text-gray-300 transition-colors">About</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Help</a>
            </div>
            <p className="text-xs text-gray-700">© 2024 QueryHive</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
