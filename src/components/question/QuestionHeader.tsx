'use client'

import Image from 'next/image'
import Link from 'next/link'
import MobileVoteButtons from './MobileVoteButtons'

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
  questionId?: string
  upvotes?: number
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
  tags,
  questionId,
  upvotes
}: QuestionHeaderProps) {
  const scrollToAnswerForm = () => {
    const answerForm = document.getElementById('answer-form')
    if (answerForm) {
      answerForm.scrollIntoView({ behavior: 'smooth' })
      
      // Add highlight effect
      answerForm.classList.add('ring-2', 'ring-[#E8FF47]', 'ring-offset-2', 'ring-offset-[#08080A]')
      setTimeout(() => {
        answerForm.classList.remove('ring-2', 'ring-[#E8FF47]', 'ring-offset-2', 'ring-offset-[#08080A]')
      }, 2000)
    }
  }

  return (
    <div className="pb-5 mb-1 border-b border-white/[0.06]">
      {/* Question Title */}
      <h1 className="text-xl font-semibold text-white leading-snug tracking-tight mb-4">
        {title}
      </h1>

      {/* Mobile Voting Controls */}
      {questionId && upvotes !== undefined && (
        <div className="mb-4">
          <MobileVoteButtons questionId={questionId} initialUpvotes={upvotes} />
        </div>
      )}

      {/* Bottom row: meta + tags + answer button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

      {/* User Meta */}
      <div className="flex items-center gap-3 text-[11px] font-label">

        {/* Avatar */}
        <Link
          href={`/profile/${user.username}`}
          className="w-8 h-8 rounded-[9px] overflow-hidden border border-white/10 bg-[#1a1a1f] flex-shrink-0"
        >
          <Image
            src={
              user.avatarUrl ||
              `https://ui-avatars.com/api/?name=${user.username}&background=131315&color=ffffff&size=40&bold=true`
            }
            alt={user.username}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        </Link>

        {/* Text Content */}
        <div className="min-w-0">

          {/* Name */}
          <Link
            href={`/profile/${user.username}`}
            className="block text-[13px] font-semibold text-white hover:text-[#E8FF47] transition-colors leading-tight"
          >
            {user.fullName || user.username}
          </Link>

          {/* Meta Row */}
          <div className="flex items-center gap-2 -mt-0.5 flex-wrap">

            <Link
              href={`/profile/${user.username}`}
              className="text-[12px] text-white/40 hover:text-[#E8FF47] transition-colors"
            >
              @{user.username}
            </Link>

            <span className="text-white/20">•</span>

            <span className="text-white/40">
              asked {createdAt}
            </span>

            <span className="text-white/20">•</span>

            <span className="text-white/40">
              {views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views} views
            </span>

          </div>
        </div>
      </div>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap items-center">
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
          
          {/* Answer Icon Button */}
          <button
            onClick={scrollToAnswerForm}
            className="p-2 text-white/40 hover:text-[#E8FF47] transition-colors rounded-lg hover:bg-[#E8FF47]/5"
            title="Answer question"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>
              edit
            </span>
          </button>
        </div>

      </div>
    </div>
  )
}