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
    <aside className="w-[200px] pt-8 pl-4 sticky top-[48px] h-fit">
      <div className="space-y-8">
        {/* Status */}
        <div>
          <h4 className="label-mono text-white/40 mb-3 uppercase">Status</h4>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></div>
            <span className="text-xs text-white/80 font-medium">Active Thread</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <h4 className="label-mono text-white/40 mb-1 uppercase">Answers</h4>
            <div className="text-white/80 font-mono font-bold">{answersCount}</div>
          </div>
          <div>
            <h4 className="label-mono text-white/40 mb-1 uppercase">Upvotes</h4>
            <div className="text-white/80 font-mono font-bold">{upvotes}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
