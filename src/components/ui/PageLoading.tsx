'use client'

import LoadingSpinner from './LoadingSpinner'

export default function PageLoading() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 flex flex-col items-center gap-3 border border-white/20">
        <LoadingSpinner size="lg" />
        <p className="text-white/70 text-sm font-medium">Loading...</p>
      </div>
    </div>
  )
}
