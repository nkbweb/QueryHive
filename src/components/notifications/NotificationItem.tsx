'use client'

import Link from 'next/link'
import { Notification } from '@/types/notifications'

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
}

export default function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
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

  const getColor = () => {
    switch (notification.type) {
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

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id)
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

  const content = (
    <div
      className={`p-4 border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors cursor-pointer ${
        !notification.read ? 'bg-white/[0.02]' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <span className={`material-symbols-outlined text-[20px] ${getColor()}`}>
          {getIcon()}
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
    return <Link href={notification.link}>{content}</Link>
  }

  return content
}
