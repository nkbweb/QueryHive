'use client'

import { ReactNode } from 'react'
import TopNavBar from './TopNavBar'
import LeftSidebar from './LeftSidebar'
import BottomNav from './BottomNav'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="text-on-surface select-none h-screen flex flex-col">
      
      <TopNavBar />
      
      <div className="flex flex-1 pt-[48px] overflow-hidden">
        {/* Left Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block">
          <LeftSidebar />
        </div>
        <main className="flex-1 min-w-0 overflow-y-auto pb-[60px] lg:pb-0">
          {children}
        </main>
      </div>

      {/* Bottom Navigation - Visible on mobile only */}
      <BottomNav />
    </div>
  )
}
