import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Notification } from '@/types/notifications'

export async function getUserNotifications(userId: string, limit: number = 20) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data || []
}

export async function getUnreadNotificationCount(userId: string) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }

  return data?.length || 0
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error marking notification as read:', error)
    return null
  }

  return data
}

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)
    .select()

  if (error) {
    console.error('Error marking all notifications as read:', error)
    return []
  }

  return data || []
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    return null
  }

  return data
}
