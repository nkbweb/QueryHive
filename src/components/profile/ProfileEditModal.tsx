'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Save, Globe, Briefcase, MapPin, Calendar, ExternalLink } from 'lucide-react'
import SkillsSelector from './SkillsSelector'
import BannerUpload from './BannerUpload'

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  profile: any
  currentUserId: string
  onSuccess: () => void
}

export default function ProfileEditModal({ isOpen, onClose, profile, currentUserId, onSuccess }: ProfileEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'professional' | 'links' | 'skills' | 'images'>('basic')
  
  // Basic info
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  
  // Professional
  const [jobTitle, setJobTitle] = useState(profile.job_title || '')
  const [company, setCompany] = useState(profile.company || '')
  const [location, setLocation] = useState(profile.location || '')
  const [availabilityStatus, setAvailabilityStatus] = useState(profile.availability_status || '')
  
  // Links
  const [website, setWebsite] = useState(profile.website || '')
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolio_url || '')
  const [githubUrl, setGithubUrl] = useState(profile.github_url || '')
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url || '')
  const [twitterUrl, setTwitterUrl] = useState(profile.twitter_url || '')
  
  // Images
  const [bannerUrl, setBannerUrl] = useState(profile.banner_url || '')
  
  // Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      // Reset form with current profile data
      setFullName(profile.full_name || '')
      setBio(profile.bio || '')
      setJobTitle(profile.job_title || '')
      setCompany(profile.company || '')
      setLocation(profile.location || '')
      setAvailabilityStatus(profile.availability_status || '')
      setWebsite(profile.website || '')
      setPortfolioUrl(profile.portfolio_url || '')
      setGithubUrl(profile.github_url || '')
      setLinkedinUrl(profile.linkedin_url || '')
      setTwitterUrl(profile.twitter_url || '')
      setBannerUrl(profile.banner_url || '')
      
      // Fetch user skills
      fetchUserSkills()
    }
  }, [isOpen, profile])

  const fetchUserSkills = async () => {
    try {
      const response = await fetch('/api/user/skills')
      const data = await response.json()
      if (data.skills) {
        setSelectedSkills(data.skills.map((s: any) => s.id))
      }
    } catch (error) {
      console.error('Error fetching skills:', error)
    }
  }

  const validateUrl = (url: string) => {
    if (!url) return true
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSave = async () => {
    // Validate URLs
    if (!validateUrl(website) || !validateUrl(portfolioUrl) || 
        !validateUrl(githubUrl) || !validateUrl(linkedinUrl) || !validateUrl(twitterUrl)) {
      alert('Please enter valid URLs')
      return
    }

    if (bio.length > 500) {
      alert('Bio must be 500 characters or less')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio,
          job_title: jobTitle,
          company,
          location,
          availability_status: availabilityStatus,
          website,
          portfolio_url: portfolioUrl,
          github_url: githubUrl,
          linkedin_url: linkedinUrl,
          twitter_url: twitterUrl,
          banner_url: bannerUrl,
        })
        .eq('id', currentUserId)

      if (profileError) throw profileError

      // Update skills
      await fetch('/api/user/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillIds: selectedSkills })
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'professional', label: 'Professional' },
    { id: 'links', label: 'Links' },
    { id: 'skills', label: 'Skills' },
    { id: 'images', label: 'Images' },
  ] as const

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-surface-container-high rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-high">
          <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-3 border-b border-surface-container-high overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-surface-container-high text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Display Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container border border-surface-container-high rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="Your display name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-surface-container border border-surface-container-high rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors resize-none"
                  placeholder="Tell us about yourself..."
                />
                <div className="text-right text-xs text-white/30 mt-1">{bio.length}/500</div>
              </div>
            </div>
          )}

          {/* Professional Tab */}
          {activeTab === 'professional' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container border border-surface-container-high rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="e.g., Senior Frontend Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container border border-surface-container-high rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="e.g., Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container border border-surface-container-high rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Availability Status</label>
                <select
                  value={availabilityStatus}
                  onChange={(e) => setAvailabilityStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container border border-surface-container-high rounded-lg text-white focus:outline-none focus:border-white/20 transition-colors"
                >
                  <option value="">Not set</option>
                  <option value="open">Open to opportunities</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
          )}

          {/* Links Tab */}
          {activeTab === 'links' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container border border-surface-container-high rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Portfolio
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container border border-surface-container-high rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="https://yourportfolio.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                  <span className="text-[10px] font-bold">GH</span> GitHub
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container border border-surface-container-high rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                  <span className="text-[10px] font-bold">LI</span> LinkedIn
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container border border-surface-container-high rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                  <span className="text-[10px] font-bold">X</span> Twitter
                </label>
                <input
                  type="url"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container border border-surface-container-high rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <SkillsSelector
              selectedSkills={selectedSkills}
              onSkillsChange={setSelectedSkills}
            />
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <BannerUpload
              currentBannerUrl={bannerUrl}
              onBannerChange={setBannerUrl}
              userId={currentUserId}
            />
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-container-high">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-lime-accent text-on-primary text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
