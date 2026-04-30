'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AnswerForm from './AnswerForm'
import LoginPopup from '@/components/auth/LoginPopup'

interface AnswerFormWrapperProps {
  questionId: string
}

export default function AnswerFormWrapper({ questionId }: AnswerFormWrapperProps) {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [showLoginPopup, setShowLoginPopup] = useState(false)

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
    return (
      <div className="mt-16">
        <div className="bg-surface-container/30 border border-surface-container-high/20 rounded-lg p-6 text-center">
          <h3 className="text-base font-semibold text-white mb-2">Your Answer</h3>
          <p className="text-sm text-white/60 mb-4">You need to be logged in to post an answer.</p>
          <button
            onClick={() => setShowLoginPopup(true)}
            className="px-5 py-2 bg-lime-accent text-black text-xs font-label font-semibold uppercase tracking-widest rounded-sm hover:bg-lime-accent/90 transition-colors"
          >
            Log in to answer
          </button>
          <LoginPopup 
            isOpen={showLoginPopup} 
            onClose={() => setShowLoginPopup(false)}
            action="answer"
          />
        </div>
      </div>
    )
  }

  return (
    <div id="answer-form">
      <AnswerForm 
        questionId={questionId}
        userId={userId}
        onAnswerSubmitted={handleAnswerSubmitted}
      />
    </div>
  )
}
