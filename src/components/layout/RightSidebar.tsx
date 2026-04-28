'use client'

export default function RightSidebar() {
  return (
    <aside className="hidden lg:block w-[220px] h-full bg-[#131315] border-l border-[#1C1B1E] p-4 flex flex-col gap-8 overflow-y-auto no-scrollbar">
      {/* Needs Human Answers */}
      <section>
        <h3 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-4">Needs Human</h3>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 group cursor-pointer">
            <p className="text-[12px] text-white/80 line-clamp-2 leading-snug group-hover:text-primary-container transition-colors">Cold start latency in AWS Lambda with custom Runtimes...</p>
            <span className="text-[10px] text-primary-container font-medium">Answer {'\u2192'}</span>
          </div>
          <div className="flex flex-col gap-1 group cursor-pointer">
            <p className="text-[12px] text-white/80 line-clamp-2 leading-snug group-hover:text-primary-container transition-colors">Protobuf version mismatch in gRPC stream headers...</p>
            <span className="text-[10px] text-primary-container font-medium">Answer {'\u2192'}</span>
          </div>
          <div className="flex flex-col gap-1 group cursor-pointer">
            <p className="text-[12px] text-white/80 line-clamp-2 leading-snug group-hover:text-primary-container transition-colors">Why is my Docker build failing on M2 Mac but passing CI?</p>
            <span className="text-[10px] text-primary-container font-medium">Answer {'\u2192'}</span>
          </div>
        </div>
      </section>

      {/* Hot Tags */}
      <section>
        <h3 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-4">Hot Tags</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-0.5 bg-surface-container text-[10px] font-label text-white/60 border border-white/5">WEBASSEMBLY</span>
          <span className="px-2 py-0.5 bg-surface-container text-[10px] font-label text-white/60 border border-white/5">GRAPHQL</span>
          <span className="px-2 py-0.5 bg-surface-container text-[10px] font-label text-white/60 border border-white/5">CUDA</span>
          <span className="px-2 py-0.5 bg-surface-container text-[10px] font-label text-white/60 border border-white/5">ELIXIR</span>
          <span className="px-2 py-0.5 bg-surface-container text-[10px] font-label text-white/60 border border-white/5">DOCKER</span>
        </div>
      </section>

      {/* Top Correctors */}
      <section>
        <h3 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-4">Top Correctors</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-[9px] font-bold">JD</div>
              <span className="text-[11px] text-white/70">j_dorian</span>
            </div>
            <span className="text-[10px] font-label text-primary-container">4.8k</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-bold">ML</div>
              <span className="text-[11px] text-white/70">m_lovelace</span>
            </div>
            <span className="text-[10px] font-label text-white/40">4.2k</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-bold">AK</div>
              <span className="text-[11px] text-white/70">a_kapoor</span>
            </div>
            <span className="text-[10px] font-label text-white/40">3.9k</span>
          </div>
        </div>
      </section>

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="text-[10px] font-label text-white/20 flex flex-col gap-1">
          <span>QUERYHIVE V2.4.1</span>
          <span>{'\u00a9'} 2024 TERMINAL AUTHORITY</span>
        </div>
      </div>
    </aside>
  )
}
