export interface User {
  id: string
  email: string
  username: string
  name: string
  avatar_url?: string
  bio?: string
  reputation: number
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  title: string
  content: string
  user_id: string
  views: number
  created_at: string
  updated_at: string
  user?: User
  tags?: Tag[]
  answers?: Answer[]
  _count?: {
    answers: number
    upvotes: number
  }
}

export interface Answer {
  id: string
  content: string
  question_id: string
  user_id: string
  is_ai: boolean
  status: 'draft' | 'verified' | 'superseded' | 'flagged'
  upvotes: number
  downvotes: number
  created_at: string
  updated_at: string
  user?: User
  question?: Question
  comments?: Comment[]
  verification_count?: number
  flag_count?: number
}

export interface Tag {
  id: string
  name: string
  description?: string
  color: string
  question_count: number
  created_at: string
}

export interface Vote {
  id: string
  user_id: string
  target_type: 'question' | 'answer'
  target_id: string
  value: 1 | -1
  created_at: string
}

export interface Comment {
  id: string
  content: string
  answer_id: string
  user_id: string
  created_at: string
  updated_at: string
  user?: User
}

export interface Notification {
  id: string
  user_id: string
  type: 'answer' | 'upvote' | 'comment' | 'verification' | 'flag'
  data: Record<string, unknown>
  read: boolean
  created_at: string
}

export interface AuthUser {
  id: string
  email?: string
  user_metadata?: {
    username?: string
    name?: string
  }
}

export interface DatabaseUser extends User {
  email_confirmed_at?: string
  last_sign_in_at?: string
}
