'use client'

export default function StatusBar() {
  return (
    <div className="fixed bottom-0 left-0 w-full h-6 bg-[#0F0F12] border-t border-[#1C1B1E] z-50 flex items-center px-4 justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-primary-container rounded-full"></span>
          <span className="text-[9px] font-label text-white/40">SYSTEM READY</span>
        </div>
        <div className="text-[9px] font-label text-white/20">LATENCY: 14MS</div>
      </div>
      <div className="flex items-center gap-4 text-[9px] font-label text-white/40">
        <span>UTF-8</span>
        <span>LINE 45, COL 12</span>
        <span className="text-primary-container">CONNECTED TO HIVE-NODE-01</span>
      </div>
    </div>
  )
}
