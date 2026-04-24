'use client'

import Link from 'next/link'
import Image from 'next/image'

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

type ExploreSidebarProps = {
  tags: Tag[]
  users: User[]
  stats: Stats | null
  onTagClick: (tagId: string) => void
  activeTagId: string | null
}

export default function ExploreSidebar({ tags, users, stats, onTagClick, activeTagId }: ExploreSidebarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  return (
    <aside className="w-[220px] h-full bg-[#131315] border-l border-[#1C1B1E] p-4 flex flex-col gap-8 overflow-y-auto no-scrollbar">
      {/* Popular Tags */}
      <section>
        <h3 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-4">Hot Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 10).map((tag) => (
            <button
              key={tag.id}
              onClick={() => onTagClick(tag.id)}
              className={`px-2 py-0.5 text-[10px] font-label border transition-colors ${
                activeTagId === tag.id
                  ? 'bg-primary-container/20 border-primary-container/40 text-primary-container'
                  : 'bg-surface-container border-white/5 text-white/60 hover:border-primary-container/30 hover:text-primary-container'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </section>

      {/* Top Contributors */}
      <section>
        <h3 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-4">Top Contributors</h3>
        <div className="flex flex-col gap-3">
          {users.map((user, index) => (
            <Link
              key={user.id}
              href={`/profile/${user.username}`}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 flex items-center justify-center text-[9px] font-bold rounded-sm ${
                  index === 0 ? 'bg-primary-container/20 border border-primary-container/30 text-primary-container' : 'bg-white/5 border border-white/10 text-white/60'
                }`}>
                  {user.avatarUrl ? (
                    <Image src={user.avatarUrl} alt={user.username} width={20} height={20} className="w-full h-full rounded-sm object-cover" />
                  ) : (
                    getInitials(user.name || user.username)
                  )}
                </div>
                <span className="text-[11px] text-white/70 group-hover:text-primary-container transition-colors">{user.username}</span>
              </div>
              <span className={`text-[10px] font-label ${
                index === 0 ? 'text-primary-container' : 'text-white/40'
              }`}>
                {formatNumber(user.reputation)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Platform Stats - Simplified */}
      {stats && (
        <section>
          <h3 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-4">Platform</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-white/50">{formatNumber(stats.questionsCount)} questions</span>
              <span className="text-white/30">•</span>
              <span className="text-white/50">{formatNumber(stats.answersCount)} answers</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-white/50">{formatNumber(stats.usersCount)} users</span>
              <span className="text-white/30">•</span>
              <span className="text-white/50">{formatNumber(stats.tagsCount)} tags</span>
            </div>
          </div>
        </section>
      )}

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="text-[10px] font-label text-white/20 flex flex-col gap-1">
          <span>QUERYHIVE V2.4.1</span>
          <span>{'\u00a9'} 2024 TERMINAL AUTHORITY</span>
        </div>
      </div>
    </aside>
  )
}
