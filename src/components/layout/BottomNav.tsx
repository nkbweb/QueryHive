'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading'

interface NavItem {
  icon: string
  label: string
  route: string
}

const NAV_WIDTH = 390 // max container width — adjust to match your layout
const NOTCH_R = 34
const NOTCH_W = 100
const CORNER_R = 16
const BAR_H = 65

function buildPath(cx: number, w: number): string {
  const left = cx - NOTCH_W / 2
  const right = cx + NOTCH_W / 2
  const notchDepth = 42
  
  return [
    `M 0 ${BAR_H}`, 
    `L 0 ${CORNER_R}`,
    `Q 0 0 ${CORNER_R} 0`,
    `L ${left} 0`,
    `C ${left + 10} 0, ${left + 20} ${notchDepth}, ${cx} ${notchDepth}`,
    `C ${right - 20} ${notchDepth}, ${right - 10} 0, ${right} 0`,
    `L ${w - CORNER_R} 0`,
    `Q ${w} 0 ${w} ${CORNER_R}`,
    `L ${w} ${BAR_H}`,
    `Z`
  ].join(' ')
}

export default function BottomNav() {
  const pathname = usePathname()
  const { navigate } = useNavigationWithLoading()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(NAV_WIDTH)
  const [activeIdx, setActiveIdx] = useState(0)
  const [bubbleX, setBubbleX] = useState(0)
  const [pathD, setPathD] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const items: NavItem[] = useMemo(() => [
    { icon: 'home', label: 'Home', route: '/home' },
    { icon: 'explore', label: 'Explore', route: '/explore' },
    { icon: 'help', label: 'Ask', route: '/ask' },
    { icon: 'menu', label: 'Menu', route: 'menu' },
  ], [])

  const secondaryItems: NavItem[] = useMemo(() => [
    { icon: 'people', label: 'Following', route: '/following' },
    { icon: 'bookmark', label: 'Bookmarks', route: '/bookmarks' },
  ], [])

  // Measure real container width
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setContainerW(entry.contentRect.width || NAV_WIDTH)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Sync active from pathname
  useEffect(() => {
    const idx = items.findIndex(i => i.route === pathname)
    if (idx !== -1) setActiveIdx(idx)
  }, [pathname, items])

  // Recompute bubble position + path whenever activeIdx or containerW changes
  useEffect(() => {
    const segW = containerW / items.length
    const cx = segW * activeIdx + segW / 2
    setBubbleX(cx - 31) // 31 = half of 62px circle
    setPathD(buildPath(cx, containerW))
  }, [activeIdx, containerW, items.length])

  // Init path on first render
  useEffect(() => {
    const segW = containerW / items.length
    const cx = segW / 2 // index 0
    setPathD(buildPath(cx, containerW))
    setBubbleX(cx - 31)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNav = (idx: number, route: string) => {
    setActiveIdx(idx)
    if (route === 'menu') {
      setIsMenuOpen(!isMenuOpen)
      return
    }
    navigate(route)
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* Menu backdrop */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-in fade-in duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Menu Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden fixed bottom-[90px] left-4 right-4 bg-[#1C1B1E] border border-white/10 rounded-2xl z-50 p-4 animate-in slide-in-from-bottom-6 duration-300 shadow-2xl">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <h3 className="text-[11px] font-mono text-gray-500 uppercase tracking-widest px-2 mb-2">More Options</h3>
            {secondaryItems.map(item => (
              <button
                key={item.route}
                onClick={() => {
                  navigate(item.route)
                  setIsMenuOpen(false)
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200
                  ${pathname === item.route
                    ? 'bg-[#E8FF47]/10 text-[#E8FF47]'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <span
                  className="material-symbols-outlined leading-none"
                  style={{
                    fontSize: '20px',
                    fontVariationSettings: pathname === item.route ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <nav
        ref={containerRef}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
        style={{ height: BAR_H + 30 }}
      >
      <div className="relative h-full w-full pointer-events-auto">
        {/* Morphing bar */}
        <svg
          viewBox={`0 0 ${containerW} ${BAR_H}`}
          preserveAspectRatio="none"
          width="100%"
          height={BAR_H}
          className="absolute bottom-0 left-0 w-full"
          style={{ filter: 'drop-shadow(0 -4px 24px rgba(0,0,0,0.4))' }}
        >
          <path
            d={pathD}
            fill="#131315"
            style={{ 
              transition: 'd 0.4s cubic-bezier(0.34,1.4,0.64,1)',
              stroke: '#1C1B1E',
              strokeWidth: 1
            }}
          />
        </svg>

        {/* Floating bubble */}
        <div
          className="absolute top-0 flex items-center justify-center bg-[#131315]"
          style={{
            width: 62,
            height: 62,
            left: bubbleX,
            borderRadius: '50%',
            border: '3px solid #1C1B1E',
            boxShadow: '0 2px 20px rgba(232,255,71,0.14)',
            transition: 'left 0.4s cubic-bezier(0.34,1.4,0.64,1)',
            zIndex: 10,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 28,
              color: '#E8FF47',
              fontVariationSettings: "'FILL' 1",
              lineHeight: 1,
            }}
          >
            {items[activeIdx].icon}
          </span>
        </div>

        {/* Nav items */}
        <div
          className="absolute bottom-0 left-0 right-0 flex"
          style={{ height: BAR_H }}
        >
          {items.map((item, idx) => {
            const isActive = idx === activeIdx
            return (
              <button
                key={item.route}
                onClick={() => handleNav(idx, item.route)}
                className="flex-1 flex flex-col items-center justify-end pb-2 gap-0.5 bg-transparent border-none"
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 26,
                    lineHeight: 1,
                    color: isActive ? 'transparent' : 'rgba(255,255,255,0.6)',
                    fontVariationSettings: "'FILL' 0",
                    transition: 'color 0.2s',
                  }}
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#E8FF47' : 'rgba(255,255,255,0.6)',
                    transition: 'color 0.25s',
                    letterSpacing: '0.1px',
                  }}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
    </>
  )
}

