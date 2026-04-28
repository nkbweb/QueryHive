export type NotificationType = 'vote' | 'comment' | 'answer' | 'verification' | 'follow'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  link: string | null
  metadata: Record<string, any>
  read: boolean
  created_at: string
}

export interface NotificationMetadata {
  question_id?: string
  answer_id?: string
  comment_id?: string
  vote_value?: number
  voter_username?: string
  commenter_username?: string
  answerer_username?: string
}
