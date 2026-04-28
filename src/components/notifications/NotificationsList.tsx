'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Notification } from '@/types/notifications'

interface NotificationsListProps {
  notifications: Notification[]
}

export default function NotificationsList({ notifications }: NotificationsListProps) {
  const [localNotifications, setLocalNotifications] = useState(notifications)

  const getIcon = () => {
    switch (notifications[0]?.type) {
      case 'vote':
        return 'arrow_upward'
      case 'comment':
        return 'comment'
      case 'answer':
        return 'chat'
      case 'verification':
        return 'check_circle'
      case 'follow':
        return 'person_add'
      default:
        return 'notifications'
    }
  }

  const getColor = (type: Notification['type']) => {
    switch (type) {
      case 'vote':
        return 'text-lime-accent'
      case 'comment':
        return 'text-blue-400'
      case 'answer':
        return 'text-purple-400'
      case 'verification':
        return 'text-green-400'
      case 'follow':
        return 'text-pink-400'
      default:
        return 'text-white/60'
    }
  }

  const getIconForType = (type: Notification['type']) => {
    switch (type) {
      case 'vote':
        return 'arrow_upward'
      case 'comment':
        return 'comment'
      case 'answer':
        return 'chat'
      case 'verification':
        return 'check_circle'
      case 'follow':
        return 'person_add'
      default:
        return 'notifications'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
      setLocalNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  if (localNotifications.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-6xl text-white/20">notifications_none</span>
        <p className="text-white/40 mt-4">No notifications yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {localNotifications.map((notification) => {
        const content = (
          <div
            className={`p-4 border border-white/[0.05] rounded-lg hover:border-white/[0.1] transition-colors cursor-pointer ${
              !notification.read ? 'bg-white/[0.02]' : ''
            }`}
            onClick={() => !notification.read && markAsRead(notification.id)}
          >
            <div className="flex items-start gap-3">
              <span className={`material-symbols-outlined text-[20px] ${getColor(notification.type)}`}>
                {getIconForType(notification.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium mb-1">{notification.title}</p>
                <p className="text-xs text-white/60 mb-2 line-clamp-2">{notification.message}</p>
                <p className="text-[11px] text-white/40">{formatTime(notification.created_at)}</p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-lime-accent flex-shrink-0 mt-2" />
              )}
            </div>
          </div>
        )

        if (notification.link) {
          return <Link key={notification.id} href={notification.link}>{content}</Link>
        }

        return <div key={notification.id}>{content}</div>
      })}
    </div>
  )
}
