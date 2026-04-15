'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AnswerForm from './AnswerForm'

interface AnswerFormWrapperProps {
  questionId: string
}

export default function AnswerFormWrapper({ questionId }: AnswerFormWrapperProps) {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserId = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }

    fetchUserId()
  }, [])

  const handleAnswerSubmitted = () => {
    // Refresh the page to show the new answer
    router.refresh()
  }

  if (!userId) {
    return null // Don't render the form if user is not authenticated
  }

  return (
    <AnswerForm 
      questionId={questionId}
      userId={userId}
      onAnswerSubmitted={handleAnswerSubmitted}
    />
  )
}
