'use client'

import { useState, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading'

interface NavItem {
  icon: string
  label: string
  route: string
}

export default function BottomNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeRoute, setActiveRoute] = useState('/home')
  const pathname = usePathname()
  const { navigate } = useNavigationWithLoading()

  const mainItems: NavItem[] = useMemo(() => [
    { icon: 'home', label: 'Home', route: '/home' },
    { icon: 'explore', label: 'Explore', route: '/explore' },
    { icon: 'help', label: 'Ask', route: '/ask' },
  ], [])

  const secondaryItems: NavItem[] = useMemo(() => [
    { icon: 'people', label: 'Following', route: '/following' },
    { icon: 'bookmark', label: 'Bookmarks', route: '/bookmarks' },
  ], [])

  useEffect(() => {
    const allItems = [...mainItems, ...secondaryItems]
    const match = allItems.find(item => item.route === pathname)
    if (match) setActiveRoute(match.route)
  }, [pathname, mainItems, secondaryItems])

  const handleNavigation = (route: string) => {
    setActiveRoute(route)
    navigate(route)
    setIsMenuOpen(false)
  }

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuOpen])

  const NavButton = ({ item }: { item: NavItem }) => {
    const isActive = activeRoute === item.route

    return (
      <button
        onClick={() => handleNavigation(item.route)}
        className={`
          flex flex-col items-center justify-center gap-1 px-4 py-2
          transition-colors duration-150
          ${isActive ? 'text-[#E8FF47]' : 'text-white/60 hover:text-white'}
        `}
      >
        <span
          className="material-symbols-outlined leading-none"
          style={{
            fontSize: '24px',
            fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          {item.icon}
        </span>
        <span className="text-[10px] font-medium">{item.label}</span>
      </button>
    )
  }

  return (
    <>
      {/* Menu backdrop */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-[#131315] border-t border-[#1C1B1E] z-50">
        <div className="flex items-center justify-around h-full px-2">
          {mainItems.map(item => (
            <NavButton key={item.route} item={item} />
          ))}

          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`
              flex flex-col items-center justify-center gap-1 px-4 py-2
              transition-colors duration-150
              ${isMenuOpen ? 'text-[#E8FF47]' : 'text-white/60 hover:text-white'}
            `}
          >
            <span
              className="material-symbols-outlined leading-none"
              style={{
                fontSize: '24px',
                fontVariationSettings: isMenuOpen ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              menu
            </span>
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </nav>

      {/* Menu Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden fixed bottom-[60px] left-0 right-0 bg-[#1C1B1E] border-t border-[#1C1B1E] rounded-t-2xl z-50 p-4 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex flex-col gap-1">
            {secondaryItems.map(item => (
              <button
                key={item.route}
                onClick={() => handleNavigation(item.route)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors duration-150
                  ${activeRoute === item.route
                    ? 'bg-[#E8FF47]/10 text-[#E8FF47]'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <span
                  className="material-symbols-outlined leading-none"
                  style={{
                    fontSize: '20px',
                    fontVariationSettings: activeRoute === item.route ? "'FILL' 1" : "'FILL' 0",
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
    </>
  )
}
