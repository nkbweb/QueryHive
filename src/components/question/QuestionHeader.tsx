'use client'

import Image from 'next/image'
import Link from 'next/link'

interface QuestionHeaderProps {
  title: string
  user: {
    username: string
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
    '#E8FF47', // lime
    '#FF6B6B', // red
    '#4ECDC4', // teal
    '#45B7D1', // blue
    '#FFA07A', // light salmon
    '#98D8C8', // mint
    '#FFD93D', // yellow
    '#6BCF7F', // green
    '#C9B6E4', // lavender
    '#FFB6C1', // pink
    '#87CEEB', // sky blue
    '#F4A460', // sandy brown
  ]
  
  // Use tag ID to generate consistent random color
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
    <>
      {/* Question Title */}
      <h1 className="text-[22px] font-bold text-white leading-tight tracking-[-0.02em] mb-4">
        {title}
      </h1>

      {/* User Meta */}
      <div className="flex items-center gap-3 text-xs text-white/50 mb-6">
        <Image 
          src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=131315&color=ffffff&size=32&bold=true`}
          alt={user.username}
          width={24}
          height={24}
          className="rounded-full"
        />
        <span className="font-medium text-white/70">@{user.username}</span>
        <span>·</span>
        <span>Asked {createdAt}</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">visibility</span> 
          {views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views} views
        </span>
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {tags && tags.length > 0 ? (
          tags.map((tag) => {
            const randomColor = getRandomTagColor(tag.id)
            return (
              <span 
                key={tag.id}
                className="label-mono px-3 py-1.5 rounded-full text-xs font-medium border"
                style={{
                  backgroundColor: `${randomColor}20`,
                  color: randomColor,
                  borderColor: `${randomColor}40`
                }}
              >
                #{tag.name}
              </span>
            )
          })
        ) : (
          <span className="text-xs text-white/40 italic">No tags assigned</span>
        )}
      </div>
    </>
  )
}
