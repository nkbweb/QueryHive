'use client'

import Markdown from '@/lib/utils/markdown'

interface QuestionBodyProps {
  content: string
  hasAIDraft?: boolean
  aiDraftContent?: string
  aiDraftVerified?: boolean
  aiDraftGeneratedTime?: string
}

export default function QuestionBody({ 
  content, 
  hasAIDraft = false, 
  aiDraftContent = '', 
  aiDraftVerified = false,
  aiDraftGeneratedTime = ''
}: QuestionBodyProps) {
  return (
    <>
      {/* Question Body */}
      <Markdown content={content} className="mb-8" />

      {/* AI Draft Block */}
      {hasAIDraft && (
        <div className="border-l-[3px] border-brand-amber bg-[#0D0B08] p-5 mb-12">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-brand-amber text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  hexagon
                </span>
                AI Draft
              </span>
              <span className="text-[11px] text-white/40 font-mono">
                Generated in {aiDraftGeneratedTime || '1.4s'}
              </span>
            </div>
            {aiDraftVerified && (
              <div className="text-xs bg-[#22C55E]/10 text-[#22C55E] px-2 py-0.5 border border-[#22C55E]/20">
                Community Verified
              </div>
            )}
          </div>
          <Markdown content={aiDraftContent} />
          {/* AI Block Footer */}
          <div className="mt-6 pt-4 border-t border-white/5 flex gap-4 text-[11px] font-bold uppercase tracking-tight">
            <button className="flex items-center gap-1.5 text-white/40 hover:text-brand-lime transition-colors">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Looks correct (14)
            </button>
            <button className="flex items-center gap-1.5 text-white/40 hover:text-error transition-colors">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              Flag as inaccurate (2)
            </button>
            <button className="flex items-center gap-1.5 text-brand-lime ml-auto">
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Improve this answer
            </button>
          </div>
        </div>
      )}
    </>
  )
}
