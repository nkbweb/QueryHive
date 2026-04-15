'use client'

import { useState } from 'react'

interface BodyEditorProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export default function BodyEditor({ value, onChange, error }: BodyEditorProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="space-y-2">
      <div className="relative">
        {/* Floating Toolbar */}
        <div className="absolute -top-12 left-0 flex items-center bg-surface-container-highest border border-outline-variant/20 p-1 shadow-xl z-10">
          <button className="p-2 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <span className="material-symbols-outlined">format_bold</span>
          </button>
          <button className="p-2 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <span className="material-symbols-outlined">format_italic</span>
          </button>
          <button className="p-2 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <span className="material-symbols-outlined">code</span>
          </button>
          <button className="p-2 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <span className="material-symbols-outlined">link</span>
          </button>
          <div className="w-[1px] h-4 bg-outline-variant/40 mx-1"></div>
          <button className="p-2 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full bg-transparent border-none p-0 text-[16px] leading-relaxed text-white/80 placeholder:text-white/20 focus:ring-0 resize-none font-['Inter'] ${error ? 'text-red-400/80' : ''}`}
          placeholder="Add more context..."
          rows={12}
        />
      </div>
      {error && (
        <span className="text-xs text-red-400 font-mono">{error}</span>
      )}
      <div className="flex justify-between">
        <span className="text-xs text-white/30 font-mono">
          {value.length} characters
        </span>
      </div>
    </div>
  )
}
