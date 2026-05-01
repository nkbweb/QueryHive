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

export default function ExploreSidebar({
  tags,
  users,
  stats,
  onTagClick,
  activeTagId,
}: ExploreSidebarProps) {
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  const formatNumber = (num: number) =>
    num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString()

  const tagColors = [
    'text-cyan-300 bg-cyan-500/10 border-cyan-400/20 hover:bg-cyan-500/15',
    'text-lime-300 bg-lime-500/10 border-lime-400/20 hover:bg-lime-500/15',
    'text-purple-300 bg-purple-500/10 border-purple-400/20 hover:bg-purple-500/15',
    'text-pink-300 bg-pink-500/10 border-pink-400/20 hover:bg-pink-500/15',
    'text-amber-300 bg-amber-500/10 border-amber-400/20 hover:bg-amber-500/15',
  ]

  return (
    <aside className="w-[230px] h-full bg-[#121214] border-l border-white/5 p-4 flex flex-col gap-7 overflow-y-auto no-scrollbar">

      {/* HOT TAGS */}
      <section>
        <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.2em] mb-3">
          Hot Tags
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 12).map((tag, idx) => {
            const isActive = activeTagId === tag.id

            return (
              <button
                key={tag.id}
                onClick={() => onTagClick(tag.id)}
                className={`px-2 py-[2px] text-[10px] border rounded-md transition-all duration-150
                  ${
                    isActive
                      ? 'bg-primary-container/20 border-primary-container/40 text-primary-container'
                      : tagColors[idx % tagColors.length]
                  }`}
              >
                {tag.name}
              </button>
            )
          })}
        </div>
      </section>

      {/* USERS */}
      <section>
        <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.2em] mb-3">
          Top Users
        </h3>

        <div className="flex flex-col gap-2">
          {users.slice(0, 5).map((user, index) => (
            <Link
              key={user.id}
              href={`/profile/${user.username}`}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-2 min-w-0">

                {/* Avatar */}
                <div className="w-6 h-6 rounded-md overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center text-[9px] text-white/60">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.username}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(user.name || user.username)
                  )}
                </div>

                <span className="text-[11px] text-white/70 group-hover:text-primary-container transition truncate">
                  {user.username}
                </span>
              </div>

              <span
                className={`text-[10px] ${
                  index === 0 ? 'text-primary-container' : 'text-white/30'
                }`}
              >
                {formatNumber(user.reputation)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* STATS */}
      {stats && (
        <section>
          <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.2em] mb-3">
            Platform
          </h3>

          <div className="space-y-1.5 text-[11px] text-white/50">
            <div className="flex justify-between">
              <span>{formatNumber(stats.questionsCount)} questions</span>
              <span className="text-white/20">/</span>
              <span>{formatNumber(stats.answersCount)} answers</span>
            </div>

            <div className="flex justify-between">
              <span>{formatNumber(stats.usersCount)} users</span>
              <span className="text-white/20">/</span>
              <span>{formatNumber(stats.tagsCount)} tags</span>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <div className="mt-auto pt-5 border-t border-white/5">
        <div className="text-[9px] text-white/20 tracking-wider space-y-1">
          <div>QUERYHIVE V2.4.1</div>
          <div>© 2024 TERMINAL AUTHORITY</div>
        </div>
      </div>
    </aside>
  )
}