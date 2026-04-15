'use client'

import { useState } from 'react'

interface TitleInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export default function TitleInput({ value, onChange, error }: TitleInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="space-y-2">
      <div className="relative group editor-container">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full bg-transparent border-none p-0 text-[26px] font-medium text-white placeholder:text-white/10 focus:ring-0 peer ${error ? 'text-red-400' : ''}`}
          placeholder="What is your question?"
          type="text"
        />
        <div className={`bottom-border absolute bottom-[-8px] left-0 w-full h-[1px] transition-all duration-300 ${isFocused ? 'bg-[#E8FF47]' : 'bg-white/10'}`}></div>
      </div>
      {error && (
        <span className="text-xs text-red-400 font-mono">{error}</span>
      )}
      <div className="flex justify-between">
        <span className="text-xs text-white/30 font-mono">
          {value.length}/300
        </span>
      </div>
    </div>
  )
}
