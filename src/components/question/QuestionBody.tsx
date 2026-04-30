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
      <div className="prose prose-invert prose-lg max-w-none mb-12 p-4 sm:p-6 bg-surface/10 rounded-lg border border-surface-container/20">
        <Markdown content={content} className="text-white/90 leading-relaxed" />
      </div>

      {/* AI Draft Block */}
      {hasAIDraft && (
        <div className="border-l-[4px] border-lime-accent bg-gradient-to-r from-lime-accent/5 to-transparent p-4 sm:p-6 mb-12 rounded-r-lg shadow-lg">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-lime-accent/20 rounded-full">
                <span className="material-symbols-outlined text-[18px] text-lime-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
                  hexagon
                </span>
                <span className="text-sm font-bold text-lime-accent uppercase tracking-wider">AI Draft</span>
              </div>
              <span className="text-xs text-white/50 font-mono bg-surface-container/30 px-2 py-1 rounded">
                Generated in {aiDraftGeneratedTime || '1.4s'}
              </span>
            </div>
            {aiDraftVerified && (
              <div className="flex items-center gap-2 text-xs bg-green-500/10 text-green-400 px-3 py-1.5 border border-green-500/20 rounded-full">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Community Verified
              </div>
            )}
          </div>
          <div className="prose prose-invert prose-md max-w-none mb-6">
            <Markdown content={aiDraftContent} className="text-white/85" />
          </div>
          {/* AI Block Footer */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs font-semibold uppercase tracking-tight pt-4 border-t border-white/10">
            <button className="flex items-center gap-2 text-white/40 hover:text-lime-accent transition-colors px-3 py-2 rounded-lg hover:bg-lime-accent/5">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Looks correct (14)
            </button>
            <button className="flex items-center gap-2 text-white/40 hover:text-error transition-colors px-3 py-2 rounded-lg hover:bg-error/5">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              Flag as inaccurate (2)
            </button>
            <button className="flex items-center gap-2 text-lime-accent sm:ml-auto px-3 py-2 rounded-lg bg-lime-accent/5 hover:bg-lime-accent/10 transition-colors">
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Improve this answer
            </button>
          </div>
        </div>
      )}
    </>
  )
}
