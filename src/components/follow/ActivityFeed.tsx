'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronUp, MessageCircle, HelpCircle } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Activity {
  type: 'question' | 'answer' | 'comment'
  id: string
  user: {
    id: string
    username: string
    full_name?: string
    avatar_url?: string
  }
  content: {
    title?: string
    content: string
    upvotes?: number
    question?: {
      id: string
      title: string
    }
  }
  createdAt: string
  link: string
}

interface ActivityFeedProps {
  userId?: string // undefined = current user's following feed
  className?: string
}

export default function ActivityFeed({ userId, className = '' }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchActivities = useCallback(async (pageNum = 1, reset = false) => {
    try {
      setIsLoading(true)
      setError(null)

      const url = userId 
        ? `/api/follow/feed?userId=${userId}&page=${pageNum}&limit=20`
        : `/api/follow/feed?page=${pageNum}&limit=20`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch activities')
      }

      const data = await response.json()
      
      if (reset) {
        setActivities(data.activities)
      } else {
        setActivities(prev => [...prev, ...data.activities])
      }
      
      setHasMore(data.pagination.hasMore)
      setPage(pageNum)

    } catch (error) {
      console.error('Error fetching activities:', error)
      setError('Failed to load activities')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchActivities(1, true)
  }, [userId, fetchActivities])

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchActivities(page + 1, false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else {
      return 'just now'
    }
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'question':
        return <HelpCircle className="w-4 h-4 text-[#E8FF47]" />
      case 'answer':
        return <ChevronUp className="w-4 h-4 text-lime-accent" />
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-400" />
      default:
        return null
    }
  }

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'question':
        return 'asked a question'
      case 'answer':
        return 'answered a question'
      case 'comment':
        return 'commented on an answer'
      default:
        return 'posted something'
    }
  }

  if (isLoading && activities.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h2 className="text-lg font-medium text-white">Activity Feed</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[#131315] rounded-lg p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-white/10 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
                  <div className="h-3 bg-white/5 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h2 className="text-lg font-medium text-white">Activity Feed</h2>
        <div className="bg-[#131315] border border-white/[0.1] rounded-lg p-8 text-center">
          <p className="text-white/60">{error}</p>
        </div>
      </div>
    )
  }

  if (activities.length === 0 && !isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h2 className="text-lg font-medium text-white">Activity Feed</h2>
        <div className="bg-[#131315] border border-white/[0.1] rounded-lg p-8 text-center">
          <p className="text-white/60">
            {userId ? 'No recent activity' : 'Follow users to see their activity here'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-lg font-medium text-white">
        {userId ? 'User Activity' : 'Following Activity'}
      </h2>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={`${activity.type}-${activity.id}`}
            className="bg-[#131315] border border-white/[0.05] rounded-lg p-4 hover:border-white/[0.1] transition-colors"
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#1C1B1E] flex items-center justify-center overflow-hidden flex-shrink-0">
                {activity.user.avatar_url ? (
                  <Image
                    src={activity.user.avatar_url}
                    alt={activity.user.username}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-white/60">
                    {activity.user.username[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/profile/${activity.user.username}`}
                    className="text-sm font-medium text-white hover:text-[#E8FF47] transition-colors"
                  >
                    {activity.user.full_name || activity.user.username}
                  </Link>
                  <span className="text-white/40 text-xs">
                    {getActivityText(activity)}
                  </span>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="text-xs text-white/30">
                  {formatTimeAgo(activity.createdAt)}
                </div>
              </div>
            </div>

            {/* Content - Hidden on mobile */}
            <div className="hidden md:block ml-11">
              <Link
                href={activity.link}
                className="block group"
              >
                {activity.content.title && (
                  <h3 className="text-sm font-medium text-white mb-2 group-hover:text-[#E8FF47] transition-colors">
                    {activity.content.title}
                  </h3>
                )}
                
                <p className="text-sm text-white/70 line-clamp-2 mb-2">
                  {activity.content.content}
                </p>

                {/* Question info for answers/comments */}
                {activity.content.question && (
                  <p className="text-xs text-white/40 mb-2">
                    on: {activity.content.question.title}
                  </p>
                )}

                {/* Stats */}
                {activity.content.upvotes !== undefined && (
                  <div className="flex items-center gap-3 text-xs text-white/30">
                    <span className="flex items-center gap-1">
                      <ChevronUp className="w-3 h-3" />
                      {activity.content.upvotes}
                    </span>
                  </div>
                )}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-4 py-2 bg-white/[0.05] border border-white/[0.1] text-white/60 hover:text-white hover:border-white/[0.2] rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}
