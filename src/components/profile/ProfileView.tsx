'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import QuestionsList from './QuestionsList'
import AnswersList from './AnswersList'
import CommentsList from './CommentsList'
import FollowButton from '@/components/follow/FollowButton'
import ProfileEditModal from './ProfileEditModal'
import {
  Globe,
  Briefcase,
  MapPin,
  ExternalLink,
  Star,
  Calendar,
  Users,
  UserPlus,
  MessageSquare,
  HelpCircle,
  CheckSquare,
  Camera,
  Pencil,
} from 'lucide-react'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  reputation: number
  created_at: string
  followers_count?: number
  following_count?: number
  bio?: string | null
  location?: string | null
  job_title?: string | null
  company?: string | null
  website?: string | null
  portfolio_url?: string | null
  github_url?: string | null
  linkedin_url?: string | null
  twitter_url?: string | null
  banner_url?: string | null
  availability_status?: string | null
  last_active_at?: string | null
}

interface ProfileViewProps {
  profile: Profile
  isOwnProfile: boolean
  currentUserId: string | undefined
  questions: any[]
  answers: any[]
  comments: any[]
  skills?: any[]
}

const TABS = ['questions', 'answers', 'comments'] as const
type Tab = typeof TABS[number]

const TAB_META = {
  questions: { icon: HelpCircle },
  answers:   { icon: CheckSquare },
  comments:  { icon: MessageSquare },
} as const

const AVAILABILITY_MAP = {
  open:    { label: 'Open to opportunities', color: '#4ade80' },
  busy:    { label: 'Busy',                  color: '#fbbf24' },
  offline: { label: 'Offline',               color: '#6b7280' },
}

function getLastActive(ts?: string | null): string | null {
  if (!ts) return null
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1)  return 'Active now'
  if (m < 60) return `Active ${m}m ago`
  if (h < 24) return `Active ${h}h ago`
  if (d < 7)  return `Active ${d}d ago`
  return null
}

export default function ProfileView({
  profile,
  isOwnProfile,
  currentUserId,
  questions,
  answers,
  comments,
  skills = [],
}: ProfileViewProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('questions')

  const tabCounts: Record<Tab, number> = {
    questions: questions.length,
    answers:   answers.length,
    comments:  comments.length,
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const supabase = createClient()
      const ext      = file.name.split('.').pop()
      const fileName = `${currentUserId}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file)
      if (uploadErr) throw uploadErr
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName)
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', currentUserId)
      if (updateErr) throw updateErr
      window.location.reload()
    } catch (err) {
      console.error('Avatar upload failed:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year:  'numeric',
  })

  const availability = profile.availability_status
    ? AVAILABILITY_MAP[profile.availability_status as keyof typeof AVAILABILITY_MAP]
    : null

  const lastActive = getLastActive(profile.last_active_at)

  const socialLinks = [
    { href: profile.website,       icon: Globe,        label: 'Website'   },
    { href: profile.portfolio_url, icon: ExternalLink,  label: 'Portfolio' },
    { href: profile.github_url,    icon: Globe,        label: 'GitHub'    },
    { href: profile.linkedin_url,  icon: Globe,        label: 'LinkedIn'  },
    { href: profile.twitter_url,   icon: Globe,        label: 'Twitter'   },
  ].filter((l) => Boolean(l.href))

  const initials = (profile.full_name || profile.username)
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="w-full min-h-screen bg-[#0c0c0e]">

      {/* ─── Banner ─────────────────────────────────────────────────── */}
      <div className="relative w-full h-44 sm:h-80 overflow-hidden">
        <Image
          src={profile.banner_url || '/images/nature.jpg'}
          alt="Profile banner"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/30 to-transparent" />
      </div>

      {/* ─── Page body ──────────────────────────────────────────────── */}
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14">

        {/* ─── Avatar + header ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14 mb-5">

          {/* Avatar */}
          <div className="relative group flex-shrink-0 self-start">
            <div className="w-24 h-24 sm:w-[104px] sm:h-[104px] rounded-2xl overflow-hidden border-[3px] border-[#0c0c0e] bg-[#1a1a1f]">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || profile.username}
                  width={104}
                  height={104}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#1e2028]">
                  <span className="text-2xl font-bold text-white/20 select-none tracking-tight">
                    {initials}
                  </span>
                </div>
              )}
            </div>

            {isOwnProfile && (
              <label className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/70 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Camera className="w-4 h-4 text-white" />
                    <span className="text-[10px] text-white/60 font-medium">Change</span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* Name / actions */}
          <div className="flex-1 min-w-0 sm:pb-0.5">
            <div className="flex flex-wrap items-start justify-between gap-3">

              <div className="min-w-0 flex-1">
                {/* Name + badges */}
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-[22px] sm:text-[26px] font-bold text-white tracking-tight leading-none">
                    {profile.full_name || profile.username}
                  </h1>

                  {isOwnProfile && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/25 rounded-full">
                      You
                    </span>
                  )}

                  {availability && (
                    <span
                      className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border"
                      style={{
                        color:       availability.color,
                        background:  `${availability.color}14`,
                        borderColor: `${availability.color}2e`,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: availability.color }} />
                      {availability.label}
                    </span>
                  )}
                </div>

                <p className="text-[13px] text-white/30">@{profile.username}</p>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                {isOwnProfile && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-white/50 border border-white/10 rounded-lg hover:bg-white/[0.05] hover:text-white/80 hover:border-white/[0.18] transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                )}
                {!isOwnProfile && (
                  <FollowButton
                    userId={profile.id}
                    username={profile.username}
                    currentUserId={currentUserId}
                    size="md"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bio ─────────────────────────────────────────────────── */}
        {profile.bio && (
          <p className="text-[14px] sm:text-[15px] text-white/55 leading-relaxed mb-5 max-w-3xl">
            {profile.bio}
          </p>
        )}

        {/* ─── Meta row ────────────────────────────────────────────── */}
        {(profile.job_title || profile.company || profile.location || lastActive) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-white/35 mb-5">
            {(profile.job_title || profile.company) && (
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                {[profile.job_title, profile.company].filter(Boolean).join(' at ')}
              </span>
            )}
            {profile.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              Joined {joinedDate}
            </span>
            {lastActive && (
              <span className="flex items-center gap-1.5" style={{ color: '#4ade8099' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                {lastActive}
              </span>
            )}
          </div>
        )}

        {/* ─── Social links ─────────────────────────────────────────── */}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-white/40 hover:text-white/80 hover:bg-white/[0.07] hover:border-white/[0.14] transition-all"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </a>
            ))}
          </div>
        )}

        {/* ─── Skills ──────────────────────────────────────────────── */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {skills.slice(0, 12).map((skill: any) => (
              <span
                key={skill.id}
                className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.07] rounded-md text-[12px] text-white/40 font-medium"
              >
                {skill.name}
              </span>
            ))}
            {skills.length > 12 && (
              <span className="px-2.5 py-1 text-[12px] text-white/20">+{skills.length - 12} more</span>
            )}
          </div>
        )}

        {/* ─── Stats + rep ─────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {/* Stats strip */}
          <div className="flex flex-1 min-w-[260px] divide-x divide-white/[0.06] bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
            {([
              { label: 'Questions', value: questions.length,            icon: HelpCircle  },
              { label: 'Answers',   value: answers.length,              icon: CheckSquare },
              { label: 'Followers', value: profile.followers_count ?? 0, icon: Users       },
              { label: 'Following', value: profile.following_count ?? 0, icon: UserPlus    },
            ] as const).map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex-1 flex flex-col items-center justify-center py-3 px-1 hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-base font-bold text-white tabular-nums leading-none mb-0.5">
                  {value.toLocaleString()}
                </span>
                <div className="flex items-center gap-1 text-white/25">
                  <Icon className="w-3 h-3 flex-shrink-0" />
                  <span className="text-[10px] uppercase tracking-wider hidden sm:inline">{label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Reputation */}
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/[0.07] border border-amber-500/[0.15] rounded-xl">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400/20 flex-shrink-0" />
            <div>
              <p className="text-base font-bold text-amber-400 leading-none tabular-nums">
                {profile.reputation.toLocaleString()}
              </p>
              <p className="text-[10px] text-amber-500/45 uppercase tracking-wider mt-0.5">Reputation</p>
            </div>
          </div>
        </div>

        {/* ─── Activity tabs ───────────────────────────────────────── */}
        <div className="mb-16">

          {/* Tab bar */}
          <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.07] rounded-xl mb-5 w-full sm:w-fit">
            {TABS.map((tab) => {
              const Icon   = TAB_META[tab].icon
              const active = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={[
                    'flex flex-1 sm:flex-none items-center justify-center gap-1.5',
                    'px-3 sm:px-4 py-2 rounded-lg text-[13px] font-medium capitalize transition-all',
                    active
                      ? 'bg-white/[0.09] text-white border border-white/[0.10]'
                      : 'text-white/35 hover:text-white/60 hover:bg-white/[0.03]',
                  ].join(' ')}
                >
                  
                  {tab}
                  <span
                    className={[
                      'min-w-[20px] text-center text-[11px] px-1.5 py-0.5 rounded-md tabular-nums',
                      active ? 'bg-white/10 text-white/60' : 'bg-white/[0.05] text-white/20',
                    ].join(' ')}
                  >
                    {tabCounts[tab]}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Content */}
          {tabCounts[activeTab] === 0 ? (
            <div className="py-16 flex flex-col items-center gap-0.5 text-center border border-white/[0.05] rounded-xl bg-white/[0.015]">
              <p className="text-[13px] text-white/20">No {activeTab} yet</p>
            </div>
          ) : (
            <>
              {activeTab === 'questions' && <QuestionsList questions={questions} />}
              {activeTab === 'answers'   && <AnswersList   answers={answers}     />}
              {activeTab === 'comments'  && <CommentsList  comments={comments}   />}
            </>
          )}
        </div>
      </div>

      {/* ─── Edit Modal ──────────────────────────────────────────────── */}
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        currentUserId={currentUserId || ''}
        onSuccess={() => window.location.reload()}
      />
    </div>
  )
}