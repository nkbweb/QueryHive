'use client'

import { useState } from 'react'

interface Tag {
  id: string
  name: string
  color: string
}

interface TagsSelectorProps {
  availableTags: Tag[]
  selectedTags: string[]
  onToggleTag: (tagId: string) => void
  onAddCustomTag: (tagName: string) => void
}

export default function TagsSelector({ availableTags, selectedTags, onToggleTag, onAddCustomTag }: TagsSelectorProps) {
  const [newTag, setNewTag] = useState('')

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      const tagName = newTag.trim().replace('#', '') // Remove # if user adds it
      onAddCustomTag(tagName)
      setNewTag('')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="border border-lime-accent/30 bg-surface-container/50 rounded-lg overflow-hidden shadow-lg">
          <div className="flex gap-4 px-4 py-3 border-b border-lime-accent/20 bg-surface-container-high/30">
            <span className="text-xs font-label text-lime-accent/80">Create tags for your question</span>
          </div>
          <div className="p-4">
            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map(tagId => {
                  const tag = availableTags.find(t => t.id === tagId)
                  return tag ? (
                    <button
                      key={tag.id}
                      onClick={() => onToggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ring-2 ring-offset-2 ring-offset-background`}
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        borderColor: tag.color
                      }}
                    >
                      #{tag.name}
                    </button>
                  ) : null
                })}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Add tag:</span>
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded px-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-lime-accent focus:ring-1 focus:ring-lime-accent/20"
                placeholder="Type tag name and press Enter..."
                type="text"
              />
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-white/40">
        <span className="text-lime-accent/80">Tip:</span> Type tag names (e.g., javascript, react) and press Enter to add them
      </p>
    </div>
  )
}
