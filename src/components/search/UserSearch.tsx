'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Users } from 'lucide-react'
import FollowButton from '@/components/follow/FollowButton'

interface User {
  id: string
  username: string
  full_name?: string
  avatar_url?: string
  reputation: number
  created_at: string
  followers_count?: number
  following_count?: number
}

interface UserSearchProps {
  currentUserId?: string
  className?: string
  placeholder?: string
  showFollowButtons?: boolean
}

export default function UserSearch({ 
  currentUserId, 
  className = '',
  placeholder = 'Search users...',
  showFollowButtons = true
}: UserSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search users
  const searchUsers = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.users || [])
        setIsOpen(data.users && data.users.length > 0)
      } else {
        console.error('Search failed')
        setResults([])
        setIsOpen(false)
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (value.length >= 2) {
      setIsOpen(true)
    }
  }

  const handleUserClick = () => {
    setIsOpen(false)
    setQuery('')
  }

  const formatReputation = (rep: number) => {
    if (rep >= 1000) {
      return `${(rep / 1000).toFixed(1)}k`
    }
    return rep.toString()
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 bg-[#131315] border border-white/[0.1] rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#E8FF47]/50 focus:ring-1 focus:ring-[#E8FF47]/50"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[#E8FF47]/30 border-t-[#E8FF47] rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-[#131315] border border-white/[0.1] rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {hasSearched && results.length === 0 ? (
            <div className="p-4 text-center">
              <Users className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/40">No users found for &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((user) => (
                <div
                  key={user.id}
                  className="px-4 py-3 hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <Link
                      href={`/profile/${user.username}`}
                      onClick={handleUserClick}
                      className="flex-shrink-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#1C1B1E] flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={user.username}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-white/60">
                            {user.username[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/profile/${user.username}`}
                        onClick={handleUserClick}
                        className="block"
                      >
                        <div className="text-sm font-medium text-white hover:text-[#E8FF47] transition-colors truncate">
                          {user.full_name || user.username}
                        </div>
                        <div className="text-xs text-white/40">
                          @{user.username}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                          <span>{formatReputation(user.reputation)} rep</span>
                          <span>•</span>
                          <span>{user.followers_count || 0} followers</span>
                        </div>
                      </Link>
                    </div>

                    {/* Follow Button */}
                    {showFollowButtons && currentUserId && currentUserId !== user.id && (
                      <div className="flex-shrink-0 ml-2">
                        <FollowButton
                          userId={user.id}
                          username={user.username}
                          currentUserId={currentUserId}
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
