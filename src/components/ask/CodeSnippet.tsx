'use client'

import { useState } from 'react'

export default function CodeSnippet() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [code, setCode] = useState('')

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-[12px] font-mono text-white/40 hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">
          {isExpanded ? 'remove_box' : 'add_box'}
        </span>
        {isExpanded ? 'Remove code snippet' : 'Add code snippet'}
      </button>
      {isExpanded && (
        <div className="mt-4 bg-[#0e0e10] p-4 font-mono text-[13px] border-l border-white/5">
          <div className="text-white/30 mb-2">// Paste your code here</div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-transparent border-none text-[#E8FF47] placeholder:text-white/20 focus:ring-0 resize-none font-mono text-[13px]"
            placeholder="// Your code here..."
            rows={6}
          />
        </div>
      )}
    </div>
  )
}
