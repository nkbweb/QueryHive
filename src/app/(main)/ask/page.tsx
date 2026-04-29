'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Breadcrumb from '@/components/ask/Breadcrumb'
import AIInfoStrip from '@/components/ask/AIInfoStrip'
import TagsSelector from '@/components/ask/TagsSelector'
import Actions from '@/components/ask/Actions'
import Guidelines from '@/components/ask/Guidelines'
import RelatedQueries from '@/components/ask/RelatedQueries'

interface Tag {
  id: string
  name: string
  color: string
}

export default function AskQuestionPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [formData, setFormData] = useState({ title: '', content: '' })
  const [errors, setErrors] = useState({ title: '', content: '', general: '' })

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    const fetchTags = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('tags').select('id, name, color').order('name')
      setTags(data || [])
    }
    fetchUser()
    fetchTags()
  }, [])

  const validateForm = () => {
    const newErrors = { title: '', content: '', general: '' }
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    else if (formData.title.length < 10) newErrors.title = 'Title must be at least 10 characters'
    else if (formData.title.length > 300) newErrors.title = 'Title must be less than 300 characters'
    if (!formData.content.trim()) newErrors.content = 'Content is required'
    else if (formData.content.length < 30) newErrors.content = 'Content must be at least 30 characters'
    setErrors(newErrors)
    return !newErrors.title && !newErrors.content
  }

  const handleSubmit = async () => {
    if (!user) { setErrors({ ...errors, general: 'You must be logged in to ask a question' }); return }
    if (!validateForm()) return
    setLoading(true)
    setErrors({ title: '', content: '', general: '' })
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title.trim(), content: formData.content.trim(), userId: user.id, tags: selectedTags })
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to create question')
      const aiTriggered = result.question.aiAnswerTriggered
      router.push(`/questions/${result.question.id}${aiTriggered ? '?ai=generating' : ''}`)
    } catch (error) {
      console.error('Error creating question:', error)
      setErrors({ ...errors, general: 'Failed to create question. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId])
  }

  const handleAddCustomTag = async (tagName: string) => {
    const existingTag = tags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase())
    if (existingTag) {
      if (!selectedTags.includes(existingTag.id)) setSelectedTags(prev => [...prev, existingTag.id])
    } else {
      const supabase = createClient()
      const { data: newTag, error } = await supabase
        .from('tags').insert({ name: tagName.toLowerCase(), color: '#6B7280', question_count: 0 }).select().single()
      if (!error && newTag) { setTags(prev => [...prev, newTag]); setSelectedTags(prev => [...prev, newTag.id]) }
    }
  }

  const isFormValid = formData.title.trim() && formData.content.trim() && !errors.title && !errors.content
  const titleLen = formData.title.length
  const contentLen = formData.content.length

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-white/30">lock</span>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Sign in required</h1>
          <p className="text-white/40 text-sm">You must be logged in to ask a question.</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-surface via-surface to-surface-container/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-lime-accent/20 to-lime-accent/5">
              <span className="material-symbols-outlined text-2xl text-lime-accent">quiz</span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">Ask a Question</h1>
              <p className="text-white/60 hidden sm:block">Get help from our community and AI assistant. Be specific and provide enough details for others to help you.</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-surface-container/50 backdrop-blur-sm rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6">

          {/* Title Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              Question Title <span className="text-lime-accent">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => { setFormData({ ...formData, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: '' }) }}
                className={`
                  w-full px-4 py-3.5 bg-surface/50 border-2 rounded-xl text-white placeholder:text-white/40
                  focus:outline-none focus:border-lime-accent/50 focus:bg-surface/80
                  transition-all duration-300
                  ${errors.title ? 'border-red-500/50' : 'border-white/10'}
                `}
                placeholder=""
                maxLength={300}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className={`text-xs ${titleLen > 280 ? 'text-red-400' : 'text-white/30'}`}>
                  {titleLen}/300
                </span>
              </div>
            </div>
            {errors.title && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">error_outline</span>
                {errors.title}
              </p>
            )}
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white">
                Details <span className="text-lime-accent">*</span>
              </label>
              <span className="text-xs text-white/40 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">code</span>
                Markdown supported
              </span>
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => { setFormData({ ...formData, content: e.target.value }); if (errors.content) setErrors({ ...errors, content: '' }) }}
              className={`
                w-full px-4 py-3.5 bg-surface/50 border-2 rounded-xl text-white placeholder:text-white/40
                focus:outline-none focus:border-lime-accent/50 focus:bg-surface/80
                resize-none min-h-[180px] leading-relaxed
                transition-all duration-300
                ${errors.content ? 'border-red-500/50' : 'border-white/10'}
              `}
              placeholder=""
              rows={8}
            />
            {errors.content && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">error_outline</span>
                {errors.content}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              Tags
            </label>
            <div className="bg-surface/50 border-2 border-white/10 rounded-xl p-4 focus-within:border-lime-accent/50 transition-all duration-300">
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map(tagId => {
                    const tag = tags.find(t => t.id === tagId)
                    return tag ? (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lime-accent/10 border border-lime-accent/30 rounded-lg text-lime-accent text-sm hover:bg-lime-accent/20 transition-all"
                      >
                        <span>#{tag.name}</span>
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    ) : null
                  })}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-white/30 text-lg">#</span>
                <input
                  type="text"
                  placeholder="Add tags (e.g., javascript, react)"
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleAddCustomTag(e.currentTarget.value.trim())
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-white/40">Press Enter to add tags. Tags help others find your question.</p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-400 text-lg mt-0.5">error</span>
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title.trim() || !formData.content.trim()}
            className="w-full py-4 bg-gradient-to-r from-lime-accent to-lime-accent/90 text-surface font-bold rounded-xl
              hover:from-lime-accent/90 hover:to-lime-accent/80 transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2 shadow-lg shadow-lime-accent/20"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">refresh</span>
                Posting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">send</span>
                Post Question
              </>
            )}
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-sm text-white/40">
          <p>Your question will be analyzed by AI and shared with the community</p>
        </div>
      </div>
    </main>

  )
}