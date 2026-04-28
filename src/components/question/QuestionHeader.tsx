'use client'

import Image from 'next/image'
import Link from 'next/link'

interface QuestionHeaderProps {
  title: string
  user: {
    username: string
    fullName?: string
    avatarUrl?: string
    reputation?: number
  }
  createdAt: string
  views: number
  tags: Array<{
    id: string
    name: string
    color?: string
  }>
}

// Generate random colors for tags
const getRandomTagColor = (tagId: string) => {
  const colors = [
    '#E8FF47', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#FFD93D', '#6BCF7F', '#C9B6E4', '#FFB6C1',
    '#87CEEB', '#F4A460',
  ]
  const index = tagId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return colors[index]
}

export default function QuestionHeader({ 
  title, 
  user, 
  createdAt, 
  views, 
  tags
}: QuestionHeaderProps) {
  return (
    <div className="pb-5 mb-1 border-b border-white/[0.06]">
      {/* Question Title */}
      <h1 className="text-xl font-semibold text-white leading-snug tracking-tight mb-4">
        {title}
      </h1>

      {/* Bottom row: meta + tags */}
      <div className="flex items-center justify-between gap-3 flex-wrap">

        {/* User Meta */}
        <div className="flex items-center gap-3 text-[11px] font-label">
          <Image
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=131315&color=ffffff&size=40&bold=true`}
            alt={user.username}
            width={32}
            height={32}
            style={{ borderRadius: '50%', width: 32, height: 32, objectFit: 'cover' }}
          />
          <div>
            <Link
              href={`/profile/${user.username}`}
              className="text-[13px] text-white font-semibold hover:text-[#E8FF47] transition-colors"
            >
              {user.fullName || user.username}
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${user.username}`}
                className="text-[12px] text-white/40 font-medium hover:text-[#E8FF47] transition-colors"
              >
                @{user.username}
              </Link>
              <span className="text-white/20">·</span>
              <span className="text-white/40">asked {createdAt}</span>
              <span className="text-white/20">·</span>
              <span className="text-white/40">{views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views} views</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap">
          {tags && tags.length > 0 ? (
            tags.map((tag) => (
              <span 
                key={tag.id}
                className="px-2 py-0.5 bg-surface-container text-[10px] font-label text-white/60 border border-white/5 rounded-sm"
              >
                {tag.name}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-white/40 italic">No tags assigned</span>
          )}
        </div>

      </div>
    </div>
  )
}