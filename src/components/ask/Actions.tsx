interface ActionsProps {
  onSubmit: () => void
  loading: boolean
  disabled: boolean
  onSaveDraft?: () => void
}

export default function Actions({ onSubmit, loading, disabled, onSaveDraft }: ActionsProps) {
  return (
    <div className="flex items-center justify-between pt-8 border-t border-outline-variant/20">
      <div className="flex items-center gap-8">
        <button
          onClick={onSubmit}
          disabled={loading || disabled}
          className="bg-[#E8FF47] text-[#191e00] px-8 py-3 text-[14px] font-extrabold uppercase tracking-tight hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Posting...' : 'Post question'}
        </button>
        {onSaveDraft && (
          <button
            onClick={onSaveDraft}
            className="text-[13px] font-medium text-white/40 hover:text-white transition-colors border-b border-transparent hover:border-white/20"
          >
            Save draft
          </button>
        )}
      </div>
      
      {/* Post-submission Status */}
      <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-surface-container-low border border-white/5">
        <span className="material-symbols-outlined text-[#E8FF47] text-[16px] animate-pulse">hexagon</span>
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-tight text-white/60">
          <span>AI is drafting...</span>
          <span className="text-[#E8FF47]">{'\u2588\u2588\u2588\u2588\u2590\u2590'}</span>
        </div>
      </div>
    </div>
  )
}
