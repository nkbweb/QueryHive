'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import QuestionsList from './QuestionsList'
import AnswersList from './AnswersList'
import CommentsList from './CommentsList'
import FollowButton from '@/components/follow/FollowButton'
import FollowStatus from '@/components/follow/FollowStatus'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  reputation: number
  created_at: string
  followers_count?: number
  following_count?: number
}

interface ProfileViewProps {
  profile: Profile
  isOwnProfile: boolean
  currentUserId: string | undefined
  questions: any[]
  answers: any[]
  comments: any[]
}

const TABS = ['questions', 'answers', 'comments'] as const
type Tab = typeof TABS[number]

export default function ProfileView({
  profile,
  isOwnProfile,
  currentUserId,
  questions,
  answers,
  comments,
}: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('questions')

  const tabCounts: Record<Tab, number> = {
    questions: questions.length,
    answers: answers.length,
    comments: comments.length,
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${currentUserId}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', currentUserId)
      if (updateError) throw updateError
      window.location.reload()
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', currentUserId)
      if (error) throw error
      setIsEditing(false)
      window.location.reload()
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex h-full bg-surface">
      <main className="flex-1 overflow-y-auto no-scrollbar">

        {/* ── Profile Header ── */}
        <div className="px-6 pt-8 pb-0">

          {/* Top: avatar + core info */}
          <div className="flex items-start gap-5 mb-6">

            {/* Avatar */}
            <div className="relative flex-shrink-0 group">
              <div className="w-20 h-20 rounded-xl bg-surface-container border border-surface-container-high/40 flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.username}
                    fill
                    className="object-cover transition-opacity group-hover:opacity-80"
                  />
                ) : (
                  <span className="text-3xl font-semibold text-white/30 select-none">
                    {profile.username[0].toUpperCase()}
                  </span>
                )}
              </div>

              {isOwnProfile && (
                <label className={`
                  absolute -bottom-2 -right-2
                  w-6 h-6 rounded-full
                  bg-surface-container-high border border-surface-container-high
                  flex items-center justify-center
                  cursor-pointer transition-all
                  hover:bg-white/10
                  ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                `}>
                  <span className="material-symbols-outlined text-[12px] text-white/60">
                    {isUploading ? 'hourglass_empty' : 'photo_camera'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold text-white tracking-tight leading-tight truncate">
                    {profile.username}
                  </h1>
                  {!isEditing && (
                    <p className="text-[13px] text-white/40 mt-0.5 truncate">
                      {profile.full_name || 'No display name'}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 flex items-center gap-2 mt-0.5">
                  {!isOwnProfile && (
                    <FollowButton
                      userId={profile.id}
                      username={profile.username}
                      currentUserId={currentUserId}
                      size="md"
                    />
                  )}
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-3 py-1.5 text-[13px] font-medium text-white/50 border border-surface-container-high rounded-lg hover:bg-surface-container hover:text-white/80 transition-all"
                    >
                      {isEditing ? 'Cancel' : 'Edit profile'}
                    </button>
                  )}
                </div>
              </div>

              {/* Inline edit form */}
              {isEditing && (
                <div className="flex gap-2 mt-2 mb-3">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your display name"
                    className="flex-1 px-3 py-1.5 bg-surface-container border border-surface-container-high rounded-lg text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
                  />
                  <button
                    onClick={handleProfileUpdate}
                    className="px-4 py-1.5 bg-white/10 border border-white/10 text-white text-sm rounded-lg hover:bg-white/15 transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}

              {/* Meta chips */}
              <div className="flex items-center gap-2 flex-wrap mt-2">
                {/* Reputation */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/15 text-amber-400 text-[12px] font-medium">
                  <span className="material-symbols-outlined text-[13px]">star</span>
                  {profile.reputation.toLocaleString()}
                  <span className="text-amber-500/60 font-normal ml-0.5">rep</span>
                </div>

                {/* Joined */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container border border-surface-container-high text-white/35 text-[12px]">
                  <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                  {joinedDate}
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-stretch gap-px bg-surface-container-low rounded-xl overflow-hidden mb-0 border border-surface-container-low">
            {[
              { label: 'Questions', value: questions.length, icon: 'help' },
              { label: 'Answers', value: answers.length, icon: 'forum' },
              { label: 'Followers', value: profile.followers_count ?? 0, icon: 'group' },
              { label: 'Following', value: profile.following_count ?? 0, icon: 'person_add' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 bg-surface hover:bg-surface-container/50 transition-colors cursor-default"
              >
                <span className="text-[17px] font-semibold text-white leading-tight">
                  {stat.value.toLocaleString()}
                </span>
                <span className="text-[11px] text-white/30 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Activity Section ── */}
        <div className="px-6 py-6">

          {/* Tab bar */}
          <div className="flex gap-1 p-1 bg-surface-container rounded-xl mb-5 border border-surface-container-low">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  flex-1 flex items-center justify-center gap-2
                  py-1.5 px-3 rounded-lg text-[13px] font-medium
                  transition-all capitalize
                  ${activeTab === tab
                    ? 'bg-surface-container-high text-white shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                  }
                `}
              >
                {tab}
                <span className={`
                  text-[11px] px-1.5 py-0.5 rounded-md font-normal
                  ${activeTab === tab
                    ? 'bg-white/10 text-white/70'
                    : 'bg-surface-container text-white/25'
                  }
                `}>
                  {tabCounts[tab]}
                </span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div>
            {activeTab === 'questions' && <QuestionsList questions={questions} />}
            {activeTab === 'answers' && <AnswersList answers={answers} />}
            {activeTab === 'comments' && <CommentsList comments={comments} />}
          </div>
        </div>

      </main>
    </div>
  )
}