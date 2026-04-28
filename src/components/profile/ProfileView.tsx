'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
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

export default function ProfileView({ profile, isOwnProfile, currentUserId, questions, answers, comments }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'questions' | 'answers' | 'comments'>('questions')

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarFile(file)
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

  return (
    <div className="flex h-full bg-[#08080A]">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {/* Profile Header */}
        <div className="p-6 border-b border-white/[0.03]">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#131315] border border-white/[0.05] flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white/40">
                    {profile.username[0].toUpperCase()}
                  </span>
                )}
              </div>
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-container rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-container/80 transition-colors">
                  <span className="material-symbols-outlined text-[16px] text-black">edit</span>
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

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-white">{profile.username}</h1>
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
                    className="px-3 py-1 text-xs bg-white/[0.05] border border-white/[0.1] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="mb-4">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2 bg-[#131315] border border-white/[0.1] rounded-lg text-white text-sm focus:outline-none focus:border-primary-container/50"
                  />
                  <button
                    onClick={handleProfileUpdate}
                    className="mt-2 px-4 py-1.5 bg-primary-container text-black text-sm font-medium rounded-lg hover:bg-primary-container/80 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <p className="text-white/60 text-sm mb-4">
                  {profile.full_name || 'No name set'}
                </p>
              )}

              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-white/40">Reputation</span>
                  <span className="ml-2 text-primary-container font-medium">{profile.reputation}</span>
                </div>
                <div>
                  <span className="text-white/40">Joined</span>
                  <span className="ml-2 text-white/60">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Follow Status */}
              <div className="mt-4">
                <FollowStatus
                  followersCount={profile.followers_count || 0}
                  followingCount={profile.following_count || 0}
                  userId={profile.id}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="p-6">
          <h2 className="text-lg font-medium text-white mb-4">Activity</h2>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-white/[0.03] mb-4">
            <button
              onClick={() => setActiveTab('questions')}
              className={`pb-2 border-b-2 text-sm transition-colors ${
                activeTab === 'questions'
                  ? 'border-primary-container text-white'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              Questions ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('answers')}
              className={`pb-2 border-b-2 text-sm transition-colors ${
                activeTab === 'answers'
                  ? 'border-primary-container text-white'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              Answers ({answers.length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-2 border-b-2 text-sm transition-colors ${
                activeTab === 'comments'
                  ? 'border-primary-container text-white'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              Comments ({comments.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === 'questions' && <QuestionsList questions={questions} />}
            {activeTab === 'answers' && <AnswersList answers={answers} />}
            {activeTab === 'comments' && <CommentsList comments={comments} />}
          </div>
        </div>
      </main>

      {/* Sidebar */}
      <aside className="w-[220px] h-full bg-[#131315] border-l border-[#1C1B1E] p-4">
        <h3 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-4">Stats</h3>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
            <span className="text-[11px] text-white/60">Questions</span>
            <span className="text-[11px] text-white/40">{questions.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-white/60">Answers</span>
            <span className="text-[11px] text-white/40">{answers.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-white/60">Comments</span>
            <span className="text-[11px] text-white/40">{comments.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-white/60">Reputation</span>
            <span className="text-[11px] text-primary-container">{profile.reputation}</span>
          </div>
        </div>
      </aside>
    </div>
  )
}
