'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Markdown from '@/lib/utils/markdown'

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
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [focused, setFocused] = useState<'title' | 'content' | null>(null)
  const [step, setStep] = useState(1)
  const tagInputRef = useRef<HTMLInputElement>(null)

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

  // Determine current step based on content
  useEffect(() => {
    if (formData.title.length >= 10) setStep(2)
    if (formData.title.length >= 10 && formData.content.length >= 30) setStep(3)
    if (formData.title.length < 10) setStep(1)
  }, [formData])

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

  const completionPercent = Math.min(100, Math.round(
    ((formData.title.length >= 10 ? 40 : (formData.title.length / 10) * 40) +
    (formData.content.length >= 30 ? 40 : (formData.content.length / 30) * 40) +
    (selectedTags.length > 0 ? 20 : 0))
  ))

  if (!user) {
    return (
      <div className="min-h-screen bg-[#08080A] flex items-center justify-center px-4">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
          .font-syne { font-family: 'Syne', sans-serif; }
          .font-mono-custom { font-family: 'JetBrains Mono', monospace; }
        `}</style>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full border border-[#a8ff3e]/20 flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-[#a8ff3e]/5"></div>
            <span className="material-symbols-outlined text-3xl text-[#a8ff3e]/40">lock</span>
          </div>
          <h1 className="font-syne text-2xl font-bold text-white mb-3">Authentication Required</h1>
          <p className="text-white/40 font-mono-custom text-sm">Sign in to post your question</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#08080A] relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
        
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono-custom { font-family: 'JetBrains Mono', monospace; }
        
        .lime { color: #a8ff3e; }
        .lime-bg { background: #a8ff3e; }
        
        /* Grid background */
        .grid-bg {
          background-image: 
            linear-gradient(rgba(168,255,62,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,255,62,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        
        /* Glow orb */
        .glow-orb {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(168,255,62,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        
        /* Custom input styles */
        .field-input {
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          color: white;
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          line-height: 1.6;
        }
        
        .field-input::placeholder {
          color: rgba(255,255,255,0.2);
        }
        
        .field-wrap {
          position: relative;
          background: #0D0D0F;
          border: 1px solid #1e1e22;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        
        .field-wrap.focused {
          border-color: rgba(168,255,62,0.4);
          box-shadow: 0 0 0 1px rgba(168,255,62,0.1), inset 0 0 40px rgba(168,255,62,0.02);
        }
        
        .field-wrap.has-error {
          border-color: rgba(239,68,68,0.5);
        }

        /* Step indicator */
        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #1e1e22;
          transition: all 0.4s ease;
        }
        .step-dot.active {
          background: #a8ff3e;
          box-shadow: 0 0 12px rgba(168,255,62,0.6);
        }
        .step-dot.done {
          background: rgba(168,255,62,0.4);
        }

        /* Tag pill */
        .tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: rgba(168,255,62,0.08);
          border: 1px solid rgba(168,255,62,0.2);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: #a8ff3e;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .tag-pill:hover {
          background: rgba(168,255,62,0.15);
        }
        .tag-pill.selected {
          background: rgba(168,255,62,0.15);
          border-color: rgba(168,255,62,0.5);
        }

        /* Submit button */
        .submit-btn {
          position: relative;
          overflow: hidden;
          background: #a8ff3e;
          color: #08080A;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.02em;
          padding: 14px 40px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .submit-btn:hover::before { opacity: 1; }
        .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(168,255,62,0.4); }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled {
          background: #1e1e22;
          color: rgba(255,255,255,0.2);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .submit-btn:disabled::before { display: none; }

        /* Progress bar */
        .progress-bar {
          height: 2px;
          background: #1e1e22;
          position: relative;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #a8ff3e, rgba(168,255,62,0.6));
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .progress-fill::after {
          content: '';
          position: absolute;
          right: 0;
          top: -2px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #a8ff3e;
          box-shadow: 0 0 10px rgba(168,255,62,0.8);
        }

        /* Number label */
        .section-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: rgba(168,255,62,0.5);
          letter-spacing: 0.1em;
        }

        /* Tab buttons */
        .tab-btn {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          padding: 6px 16px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          color: rgba(255,255,255,0.3);
        }
        .tab-btn.active {
          border-color: rgba(168,255,62,0.3);
          color: #a8ff3e;
          background: rgba(168,255,62,0.05);
        }
        .tab-btn:not(.active):hover {
          color: rgba(255,255,255,0.6);
          border-color: rgba(255,255,255,0.1);
        }

        /* Char counter */
        .char-ring {
          width: 32px;
          height: 32px;
        }
        
        /* Animate in */
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: slideUp 0.5s ease forwards;
        }
        .animate-in-delay-1 { animation-delay: 0.1s; opacity: 0; }
        .animate-in-delay-2 { animation-delay: 0.2s; opacity: 0; }
        .animate-in-delay-3 { animation-delay: 0.3s; opacity: 0; }

        /* Scrollbar */
        textarea::-webkit-scrollbar { width: 4px; }
        textarea::-webkit-scrollbar-track { background: transparent; }
        textarea::-webkit-scrollbar-thumb { background: #1e1e22; border-radius: 2px; }
        
        /* Corner accent */
        .corner-accent::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 40px; height: 40px;
          border-top: 2px solid rgba(168,255,62,0.3);
          border-left: 2px solid rgba(168,255,62,0.3);
        }
        .corner-accent::after {
          content: '';
          position: absolute;
          bottom: 0; right: 0;
          width: 40px; height: 40px;
          border-bottom: 2px solid rgba(168,255,62,0.1);
          border-right: 2px solid rgba(168,255,62,0.1);
        }
      `}</style>

      {/* Background */}
      <div className="grid-bg fixed inset-0 pointer-events-none" />
      <div className="glow-orb" style={{ top: '-200px', right: '-100px' }} />
      <div className="glow-orb" style={{ bottom: '-200px', left: '-100px', opacity: 0.5 }} />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        
        {/* Header */}
        <div className="mb-12 animate-in">
          <div className="flex items-center gap-3 mb-6">
            <span className="section-num">ASK / NEW</span>
            <div className="h-px flex-1 bg-gradient-to-r from-[#a8ff3e]/20 to-transparent" />
          </div>
          <h1 className="font-syne text-5xl sm:text-6xl font-800 text-white leading-none tracking-tight mb-4">
            Ask a<br />
            <span style={{ color: '#a8ff3e' }}>Question.</span>
          </h1>
          <p className="font-mono-custom text-sm text-white/30 mt-4">
            Community + AI answers await —
          </p>
        </div>

        {/* Completion progress */}
        <div className="mb-10 animate-in animate-in-delay-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`step-dot ${step >= 1 ? 'active' : ''}`} />
              <div className={`step-dot ${step >= 2 ? 'active' : step >= 1 ? 'done' : ''}`} />
              <div className={`step-dot ${step >= 3 ? 'active' : step >= 2 ? 'done' : ''}`} />
            </div>
            <span className="font-mono-custom text-xs text-white/20">{completionPercent}% complete</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionPercent}%` }} />
          </div>
        </div>

        {/* Main form */}
        <div className="space-y-6 animate-in animate-in-delay-2">

          {/* Title */}
          <div className="relative corner-accent">
            <div className={`field-wrap ${focused === 'title' ? 'focused' : ''} ${errors.title ? 'has-error' : ''} p-6`}>
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-1">
                  <span className="section-num block mb-1">01</span>
                  <div className="w-px h-full bg-[#1e1e22] mx-auto" style={{ minHeight: '40px' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="font-syne text-xs font-600 text-white/50 uppercase tracking-widest block mb-3">
                    Question Title <span style={{ color: '#a8ff3e' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => { setFormData({ ...formData, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: '' }) }}
                    onFocus={() => setFocused('title')}
                    onBlur={() => setFocused(null)}
                    className="field-input text-xl font-syne font-500"
                    placeholder="What are you trying to figure out?"
                    maxLength={300}
                  />
                  <div className="flex items-center justify-between mt-3">
                    {errors.title ? (
                      <p className="font-mono-custom text-xs text-red-400">{errors.title}</p>
                    ) : (
                      <p className="font-mono-custom text-xs text-white/20">Min. 10 characters</p>
                    )}
                    <span className="font-mono-custom text-xs text-white/20">
                      {formData.title.length}<span className="text-white/10">/300</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={`field-wrap ${focused === 'content' ? 'focused' : ''} ${errors.content ? 'has-error' : ''}`}>
            <div className="p-6 pb-0">
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  <span className="section-num block">02</span>
                </div>
                <div className="flex-1">
                  <label className="font-syne text-xs font-600 text-white/50 uppercase tracking-widest">
                    Details <span style={{ color: '#a8ff3e' }}>*</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setActiveTab('write')} className={`tab-btn ${activeTab === 'write' ? 'active' : ''}`}>
                    WRITE
                  </button>
                  <button onClick={() => setActiveTab('preview')} className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}>
                    PREVIEW
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 pt-4 pb-6">
              {activeTab === 'write' ? (
                <textarea
                  value={formData.content}
                  onChange={(e) => {
                    setFormData({ ...formData, content: e.target.value })
                    if (errors.content) setErrors({ ...errors, content: '' })
                  }}
                  onFocus={() => setFocused('content')}
                  onBlur={() => setFocused(null)}
                  className="field-input resize-none text-base text-white/80 leading-relaxed"
                  placeholder="Describe your problem in detail. Include what you've tried, what you expected, and what actually happened. Markdown is supported."
                  rows={10}
                />
              ) : (
                <div className="min-h-[200px] text-white/70 leading-relaxed font-syne text-base">
                  {formData.content.trim() ? (
                    <Markdown content={formData.content} />
                  ) : (
                    <p className="text-white/20 italic font-mono-custom text-sm">Nothing to preview yet...</p>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1e1e22]">
                {errors.content ? (
                  <p className="font-mono-custom text-xs text-red-400">{errors.content}</p>
                ) : (
                  <p className="font-mono-custom text-xs text-white/20">Markdown supported</p>
                )}
                <span className="font-mono-custom text-xs text-white/20">
                  {formData.content.length} chars
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="field-wrap p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <span className="section-num block">03</span>
              </div>
              <div className="flex-1 min-w-0">
                <label className="font-syne text-xs font-600 text-white/50 uppercase tracking-widest block mb-4">
                  Tags <span className="text-white/20">(optional)</span>
                </label>

                {/* Selected tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedTags.map(tagId => {
                      const tag = tags.find(t => t.id === tagId)
                      return tag ? (
                        <span key={tag.id} className="tag-pill selected">
                          #{tag.name}
                          <button
                            onClick={() => toggleTag(tag.id)}
                            className="ml-1 opacity-60 hover:opacity-100 transition-opacity text-base leading-none"
                          >
                            ×
                          </button>
                        </span>
                      ) : null
                    })}
                  </div>
                )}

                {/* Tag input */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-white/20 font-mono-custom text-sm">#</span>
                  <input
                    ref={tagInputRef}
                    type="text"
                    placeholder="type tag + enter"
                    className="field-input font-mono-custom text-sm text-white/60"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        handleAddCustomTag(e.currentTarget.value.trim())
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>

                {/* Suggestion chips */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 12).map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`tag-pill ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
                      >
                        #{tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {errors.general && (
            <div className="p-4 border border-red-500/20 bg-red-500/5 flex items-center gap-3">
              <span className="text-red-400 text-lg">!</span>
              <p className="font-mono-custom text-xs text-red-400">{errors.general}</p>
            </div>
          )}

          {/* Submit row */}
          <div className="flex items-center justify-between pt-2">
            <div className="font-mono-custom text-xs text-white/20 space-y-1">
              <div className={`flex items-center gap-2 transition-colors ${formData.title.length >= 10 ? 'text-[#a8ff3e]/50' : ''}`}>
                <span>{formData.title.length >= 10 ? '✓' : '○'}</span>
                <span>Title complete</span>
              </div>
              <div className={`flex items-center gap-2 transition-colors ${formData.content.length >= 30 ? 'text-[#a8ff3e]/50' : ''}`}>
                <span>{formData.content.length >= 30 ? '✓' : '○'}</span>
                <span>Details added</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
              className="submit-btn"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
                  </svg>
                  Posting...
                </span>
              ) : (
                'Post Question →'
              )}
            </button>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-16 pt-8 border-t border-[#1e1e22] animate-in animate-in-delay-3">
          <p className="font-mono-custom text-xs text-white/15 text-center">
            Questions may receive AI-generated answers alongside community responses.
          </p>
        </div>
      </div>
    </main>
  )
}