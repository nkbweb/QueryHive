'use client'

import { ReactNode } from 'react'
import TopNavBar from './TopNavBar'
import LeftSidebar from './LeftSidebar'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="text-on-surface select-none h-screen flex flex-col">
      
      <TopNavBar />

      <div className="flex flex-1 pt-[48px] overflow-hidden">
        <LeftSidebar />

        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  )
}
