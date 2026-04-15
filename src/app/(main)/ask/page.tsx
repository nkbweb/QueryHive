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
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })
  const [errors, setErrors] = useState({
    title: '',
    content: '',
    general: ''
  })

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    const fetchTags = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('tags')
        .select('id, name, color')
        .order('name')
      setTags(data || [])
    }

    fetchUser()
    fetchTags()
  }, [])

  const validateForm = () => {
    const newErrors = {
      title: '',
      content: '',
      general: ''
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters'
    } else if (formData.title.length > 300) {
      newErrors.title = 'Title must be less than 300 characters'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    } else if (formData.content.length < 30) {
      newErrors.content = 'Content must be at least 30 characters'
    }

    setErrors(newErrors)
    return !newErrors.title && !newErrors.content
  }

  const handleSubmit = async () => {
    if (!user) {
      setErrors({ ...errors, general: 'You must be logged in to ask a question' })
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({ title: '', content: '', general: '' })

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          userId: user.id,
          tags: selectedTags
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create question')
      }

      // Redirect to the new question page with AI trigger status
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
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleAddCustomTag = async (tagName: string) => {
    // Check if tag already exists
    const existingTag = tags.find(tag => 
      tag.name.toLowerCase() === tagName.toLowerCase()
    )
    
    if (existingTag) {
      // If tag exists, just select it
      if (!selectedTags.includes(existingTag.id)) {
        setSelectedTags(prev => [...prev, existingTag.id])
      }
    } else {
      // Create new tag (we'll need to handle this in the API)
      // For now, we'll add it to a temporary state
      const supabase = createClient()
      const { data: newTag, error } = await supabase
        .from('tags')
        .insert({
          name: tagName.toLowerCase(),
          color: '#6B7280', // Default gray color
          question_count: 0
        })
        .select()
        .single()

      if (!error && newTag) {
        setTags(prev => [...prev, newTag])
        setSelectedTags(prev => [...prev, newTag.id])
      }
    }
  }

  const isFormValid = formData.title.trim() && formData.content.trim() && !errors.title && !errors.content

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Login</h1>
          <p className="text-white/60">You must be logged in to ask a question.</p>
        </div>
      </div>
    )
  }

  return (
    <main className="pt-[80px] pb-24 min-h-screen flex justify-center">
      <div className="flex gap-16 w-full max-w-[1020px] px-6">
        {/* Left/Main Column: 680px Focused writing */}
        <div className="w-[680px]">
          <Breadcrumb currentPage="Ask" />
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-white mb-8">Ask a question</h1>
          
          <AIInfoStrip />
          
          <div className="space-y-8">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Question Title *
              </label>
              <div className="border border-lime-accent/30 bg-surface-container/50 rounded-lg overflow-hidden shadow-lg">
                <div className="flex gap-4 px-4 py-3 border-b border-lime-accent/20 bg-surface-container-high/30">
                  <span className="text-xs font-label text-lime-accent/80">Be specific and clear</span>
                </div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-transparent border-none focus:ring-0 focus:outline-none p-6 text-[15px] text-white/95 placeholder:text-white/40 resize-none"
                  placeholder="What's your programming question? Be specific."
                  maxLength={300}
                />
              </div>
              {errors.title && (
                <span className="text-xs text-red-400 font-mono mt-2 block">{errors.title}</span>
              )}
            </div>
            
            {/* Content Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Details *
              </label>
              <div className="border border-lime-accent/30 bg-surface-container/50 rounded-lg overflow-hidden shadow-lg">
                <div className="flex gap-4 px-4 py-3 border-b border-lime-accent/20 bg-surface-container-high/30">
                  <span className="text-xs font-label text-lime-accent/80">Markdown Supported</span>
                </div>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-transparent border-none focus:ring-0 focus:outline-none min-h-[200px] p-6 text-[15px] text-white/95 placeholder:text-white/40 resize-none"
                  placeholder="Include all the information someone would need to answer your question\n\nYou can use markdown for formatting:\n\n**bold** and *italic* text\n`inline code`\n```code blocks```"
                  rows={8}
                />
              </div>
              {errors.content && (
                <span className="text-xs text-red-400 font-mono mt-2 block">{errors.content}</span>
              )}
            </div>
            
            <TagsSelector
              availableTags={tags}
              selectedTags={selectedTags}
              onToggleTag={toggleTag}
              onAddCustomTag={handleAddCustomTag}
            />
            
            <Actions
              onSubmit={handleSubmit}
              loading={loading}
              disabled={!isFormValid}
            />
          </div>
          
          {/* Error Message */}
          {errors.general && (
            <div className="mt-6 bg-error/10 border border-error/20 rounded-lg p-4">
              <p className="text-sm text-error">{errors.general}</p>
            </div>
          )}
        </div>
        
        {/* Right Column: 200px Sidebar */}
        <aside className="w-[200px] flex-shrink-0">
          <div className="space-y-10 sticky top-[80px]">
            <Guidelines />
            <RelatedQueries />
          </div>
        </aside>
      </div>
    </main>
  )
}
