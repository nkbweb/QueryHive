'use client'

interface QuestionSidebarProps {
  answersCount: number
  upvotes: number
}

export default function QuestionSidebar({ 
  answersCount, 
  upvotes
}: QuestionSidebarProps) {
  return (
    <aside className="w-[240px] pt-8 pl-6 sticky top-[48px] h-fit">
      <div className="space-y-8">
        {/* Status */}
        <div className="p-4 bg-surface-container/20 rounded-lg border border-surface-container/30">
          <h4 className="label-mono text-white/50 mb-3 uppercase text-xs font-semibold">Status</h4>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-lime-accent animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-lime-accent animate-ping"></div>
            </div>
            <span className="text-sm text-white/90 font-medium">Active Thread</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-4 bg-surface-container/20 rounded-lg border border-surface-container/30">
          <h4 className="label-mono text-white/50 mb-4 uppercase text-xs font-semibold">Statistics</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-surface/30 rounded-lg border border-surface-container/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-lime-accent">question_answer</span>
                <span className="text-xs text-white/60 uppercase font-medium">Answers</span>
              </div>
              <div className="text-lime-accent font-mono font-bold text-lg">{answersCount}</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface/30 rounded-lg border border-surface-container/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary-container">thumb_up</span>
                <span className="text-xs text-white/60 uppercase font-medium">Upvotes</span>
              </div>
              <div className="text-primary-container font-mono font-bold text-lg">{upvotes}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 bg-surface-container/20 rounded-lg border border-surface-container/30">
          <h4 className="label-mono text-white/50 mb-3 uppercase text-xs font-semibold">Quick Actions</h4>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-2 p-2 text-xs text-white/60 hover:text-white hover:bg-surface/30 rounded-lg transition-colors text-left">
              <span className="material-symbols-outlined text-[14px]">share</span>
              Share Question
            </button>
            <button className="w-full flex items-center gap-2 p-2 text-xs text-white/60 hover:text-white hover:bg-surface/30 rounded-lg transition-colors text-left">
              <span className="material-symbols-outlined text-[14px]">flag</span>
              Report Content
            </button>
            <button className="w-full flex items-center gap-2 p-2 text-xs text-white/60 hover:text-white hover:bg-surface/30 rounded-lg transition-colors text-left">
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Suggest Edit
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
