'use client'

import { useState, useEffect } from 'react'
import { X, Search, Check } from 'lucide-react'

interface Skill {
  id: string
  name: string
  category: string
}

interface SkillsSelectorProps {
  selectedSkills: string[]
  onSkillsChange: (skillIds: string[]) => void
}

export default function SkillsSelector({ selectedSkills, onSkillsChange }: SkillsSelectorProps) {
  const [allSkills, setAllSkills] = useState<Record<string, Skill[]>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills')
      const data = await response.json()
      setAllSkills(data.skills || {})
    } catch (error) {
      console.error('Error fetching skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSkill = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      onSkillsChange(selectedSkills.filter(id => id !== skillId))
    } else {
      onSkillsChange([...selectedSkills, skillId])
    }
  }

  const filteredSkills = Object.entries(allSkills).reduce((acc, [category, skills]) => {
    const filtered = skills.filter(skill =>
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (filtered.length > 0) {
      acc[category] = filtered
    }
    return acc
  }, {} as Record<string, Skill[]>)

  const selectedSkillObjects = Object.values(allSkills).flat().filter(skill => 
    selectedSkills.includes(skill.id)
  )

  if (loading) {
    return <div className="text-white/50 text-sm">Loading skills...</div>
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search skills..."
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-surface-container-high rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
        />
      </div>

      {/* Selected Skills */}
      {selectedSkillObjects.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Selected Skills</label>
          <div className="flex flex-wrap gap-2">
            {selectedSkillObjects.map(skill => (
              <button
                key={skill.id}
                onClick={() => toggleSkill(skill.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-lime-accent/10 border border-lime-accent/30 text-lime-accent rounded-lg text-sm hover:bg-lime-accent/20 transition-colors"
              >
                {skill.name}
                <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Skills by Category */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">All Skills</label>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {Object.entries(filteredSkills).map(([category, skills]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedSkills.includes(skill.id)
                        ? 'bg-lime-accent text-on-primary font-medium'
                        : 'bg-surface-container border border-surface-container-high text-white/70 hover:bg-surface-container-high hover:text-white'
                    }`}
                  >
                    {selectedSkills.includes(skill.id) && <Check className="w-3 h-3" />}
                    {skill.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(filteredSkills).length === 0 && (
            <p className="text-white/30 text-sm">No skills found</p>
          )}
        </div>
      </div>
    </div>
  )
}
