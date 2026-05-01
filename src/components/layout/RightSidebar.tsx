'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function RightSidebar() {
  const [tags, setTags] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [unansweredQuestions, setUnansweredQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tagsRes, usersRes, questionsRes] = await Promise.all([
          fetch('/api/explore/tags?limit=5'),
          fetch('/api/explore/users?limit=3'),
          fetch('/api/questions?sort=unanswered&limit=3')
        ])

        const [tagsData, usersData, questionsData] = await Promise.all([
          tagsRes.json(),
          usersRes.json(),
          questionsRes.json()
        ])

        console.log('Users data:', usersData.users)
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

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  const formatScore = (score: number) => {
    if (score >= 1000) return `${(score / 1000).toFixed(1)}k`
    return score.toString()
  }

  const tagColors = [
    'from-orange-400/20 to-red-400/20',
    'from-pink-400/20 to-purple-400/20',
    'from-green-400/20 to-emerald-400/20',
    'from-purple-400/20 to-indigo-400/20',
    'from-blue-400/20 to-cyan-400/20'
  ]

  if (loading) {
    return (
      <aside className="hidden lg:block w-[240px] h-screen border-l border-surface-container-low p-4 flex flex-col gap-6 overflow-hidden">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-surface-container-high/30 rounded" />
          <div className="h-3 bg-surface-container-high/20 rounded w-3/4" />
          <div className="h-3 bg-surface-container-high/20 rounded w-1/2" />
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-[360px] h-[calc(100vh-56px)] border-l border-surface-container-low p-4 flex flex-col gap-6 overflow-hidden pointer-events-auto">
      {/* Needs Human Answers */}
      {unansweredQuestions.length > 0 && (
        <section className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-gradient-to-b from-lime-accent to-emerald-400 rounded-full" />
            <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Needs Answer</h3>
          </div>
          <div className="flex flex-col gap-3">
            {unansweredQuestions.slice(0, 3).map((q: any, i: number) => (
              <Link
                key={q.id}
                href={`/questions/${q.id}`}
                className="group flex flex-col gap-1.5 p-2.5 rounded-lg bg-surface-container-high/30 border border-surface-container-high/50 hover:border-lime-accent/30 hover:bg-surface-container-high/50 transition-all duration-200 cursor-pointer relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-lime-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <p className="text-[11px] text-white/70 line-clamp-2 leading-snug group-hover:text-white transition-colors relative z-10">{q.title}</p>
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[9px] font-medium text-lime-accent">
                    {q.answersCount === 0 ? 'NEW' : `${q.answersCount} ANSWERS`}
                  </span>
                  <span className="text-[10px] text-lime-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    Answer <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Hot Tags */}
      {tags.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full" />
            <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Hot Tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: any, i: number) => (
              <Link
                key={tag.id}
                href={`/explore?tag=${tag.id}`}
                className={`px-2.5 py-1 bg-gradient-to-r ${tagColors[i % tagColors.length]} border border-white/10 rounded-full text-[10px] font-medium text-white/70 hover:text-white hover:border-white/30 transition-all cursor-pointer`}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top Contributors */}
      {users.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full" />
            <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Top Contributors</h3>
          </div>
          <div className="flex flex-col gap-2">
            {users.map((user: any, i: number) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="flex items-center justify-between p-2 rounded-lg bg-surface-container-high/30 border border-surface-container-high/50 hover:border-lime-accent/30 hover:bg-surface-container-high/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg overflow-hidden bg-[#1a1a1f] flex-shrink-0">
                    {user.avatar_url || user.avatarUrl ? (
                      <Image
                        src={user.avatar_url || user.avatarUrl}
                        alt={user.username}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-[9px] font-bold ${
                        i === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-black' :
                        i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-black' :
                        'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                      }`}>
                        {getInitials(user.username)}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-white/70 group-hover:text-white transition-colors">{user.username}</span>
                </div>
                <span className={`text-[10px] font-semibold ${
                  i === 0 ? 'text-lime-accent' :
                  i === 1 ? 'text-white/60' :
                  'text-white/40'
                }`}>{formatScore(user.reputation || 0)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-surface-container-low">
        <div className="p-3 rounded-lg bg-gradient-to-br from-lime-accent/5 to-emerald-500/5 border border-lime-accent/10">
          <div className="text-[10px] font-medium text-white/40 flex flex-col gap-0.5">
            <span className="text-lime-accent">QUERYHIVE V2.4.1</span>
            <span>{'\u00a9'} 2024 TERMINAL AUTHORITY</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
