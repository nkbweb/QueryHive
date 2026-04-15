'use client'

import AIMarkdown from '@/lib/utils/ai-markdown'

interface AIAnswerProps {
  answer: {
    id: string
    content: string
    upvotes: number
    downvotes: number
    verificationCount: number
    flagCount: number
    isAI: boolean
    status: string
    createdAt: string
    updatedAt: string
    user: {
      id: string
      username: string
      avatarUrl?: string
      reputation: number
    }
  }
  generationTime?: string
}

export default function AIAnswer({ answer, generationTime = "1.4s" }: AIAnswerProps) {
  return (
    <div className="border-l-[3px] border-orange-500 bg-[#0D0B08] p-5 mb-12">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-brand-amber text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              hexagon
            </span>
            AI Draft
          </span>
          <span className="text-[11px] text-white/40 font-mono">Generated in {generationTime}</span>
        </div>
        <div className={`text-xs px-2 py-0.5 border ${
          answer.verificationCount > 10 
            ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' 
            : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
        }`}>
          {answer.verificationCount > 10 
            ? `Verified (${answer.verificationCount})` 
            : `Verification Pending (${answer.verificationCount})`
          }
        </div>
      </div>
      <div className="text-[15px] text-[#D4D4D8] leading-relaxed space-y-4">
        <AIMarkdown content={answer.content} />
      </div>
    </div>
  )
}
