'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface NavItem {
  icon: string
  label: string
  route: string
}

export default function LeftSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isManuallyOpened, setIsManuallyOpened] = useState(false)
  const [activeRoute, setActiveRoute] = useState('/home')
  const router = useRouter()
  const pathname = usePathname()

  const navItems = useMemo(() => [
    { icon: 'home', label: 'Home', route: '/home' },
    { icon: 'explore', label: 'Explore', route: '/explore' },
    { icon: 'help', label: 'Ask Question', route: '/ask' },
    { icon: 'bookmark', label: 'Bookmarks', route: '/bookmarks' },
  ], [])

  const bottomItems = useMemo(() => [
    { icon: 'account_circle', label: 'Account', route: '/account' },
    { icon: 'settings', label: 'Settings', route: '/settings' },
  ], [])

  const allItems = useMemo(() => [...navItems, ...bottomItems], [navItems, bottomItems])

  useEffect(() => {
    const match = allItems.find(item => item.route === pathname)
    if (match) setActiveRoute(match.route)
  }, [pathname, allItems])

  const handleNavigation = (route: string) => {
    setActiveRoute(route)
    router.push(route)
  }

  const NavButton = ({
    item,
    isBottom = false,
  }: {
    item: NavItem
    isBottom?: boolean
  }) => {
    const isActive = activeRoute === item.route && !isBottom

    return (
      <button
        onClick={() => handleNavigation(item.route)}
        className={`
          group relative flex items-center w-full rounded-lg
          h-10 cursor-pointer outline-none border-none
          transition-colors duration-150
          ${isActive
            ? 'text-[#E8FF47]'
            : 'text-white hover:bg-white/5'
          }
        `}
      >
        {/* Active pill background */}
        {isActive && (
          <span className="absolute inset-0 rounded-lg bg-[#E8FF47]/10 pointer-events-none" />
        )}

        {/* Icon slot — fixed, never shifts */}
        <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center z-10">
          <span
            className="material-symbols-outlined leading-none"
            style={{
              fontSize: '20px',
              fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            {item.icon}
          </span>
        </span>

        {/* Label */}
        <span
          className={`
            text-[13px] font-medium whitespace-nowrap overflow-hidden leading-none
            transition-all duration-300 ease-in-out
            ${isExpanded ? 'opacity-100 max-w-[140px] ml-0.5' : 'opacity-0 max-w-0'}
          `}
        >
          {item.label}
        </span>
      </button>
    )
  }

  return (
    <aside
      className={`
        h-full bg-[#131315] border-r border-[#1C1B1E]
        flex flex-col py-3
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-52' : 'w-14'}
      `}
    >
      {/* Top nav */}
      <div className="flex flex-col gap-0.5 px-2">
        {navItems.map(item => (
          <NavButton key={item.route} item={item} />
        ))}
      </div>

      {/* Bottom nav */}
      <div className="mt-auto flex flex-col gap-0.5 px-2">
        {bottomItems.map(item => (
          <NavButton key={item.route} item={item} isBottom />
        ))}

        {/* Toggle button */}
        <button
          onClick={() => {
            const newIsExpanded = !isExpanded
            setIsExpanded(newIsExpanded)
            setIsManuallyOpened(newIsExpanded)
          }}
          className="
            flex items-center w-full h-10 rounded-lg
            text-white hover:bg-white/5
            transition-colors duration-150 cursor-pointer outline-none border-none
          "
        >
          <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
            <span className="material-symbols-outlined leading-none" style={{ fontSize: '20px' }}>
              {isExpanded ? 'menu_open' : 'menu'}
            </span>
          </span>
          <span
            className={`
              text-[13px] font-medium whitespace-nowrap overflow-hidden leading-none
              transition-all duration-300 ease-in-out
              ${isExpanded ? 'opacity-100 max-w-[140px] ml-0.5' : 'opacity-0 max-w-0'}
            `}
          >
            Collapse
          </span>
        </button>
      </div>
    </aside>
  )
}