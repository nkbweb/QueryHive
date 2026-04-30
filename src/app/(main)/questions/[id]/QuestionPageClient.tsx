'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import QuestionHeader from '@/components/question/QuestionHeader'
import QuestionBody from '@/components/question/QuestionBody'
import QuestionSidebar from '@/components/question/QuestionSidebar'
import VoteColumn from '@/components/question/VoteColumn'
import AnswersSectionDynamic from '@/components/answer/AnswersSectionDynamic'
import AnswerFormWrapper from '@/components/answer/AnswerFormWrapper'
import AILoadingAnswer from '@/components/ai/AILoadingAnswer'
import { getQuestionById } from '@/lib/queries/questions'

interface QuestionPageClientProps {
  questionId: string
  initialQuestion: any
}

export default function QuestionPageClient({ questionId, initialQuestion }: QuestionPageClientProps) {
  const [question, setQuestion] = useState(initialQuestion)
  const [showAILoading, setShowAILoading] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if AI is generating from URL parameter
    const aiGenerating = searchParams.get('ai') === 'generating'
    if (aiGenerating) {
      setShowAILoading(true)
    }
  }, [searchParams])

  const handleAnswerReady = () => {
    // AI answer is ready, hide loading
    setShowAILoading(false)
    
    // Clean URL parameter
    window.history.replaceState({}, '', `/questions/${questionId}`)
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Question not found</h1>
          <p className="text-white/60">The question you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[48px] w-full max-w-[1400px] mx-auto flex min-h-[calc(100vh-48px)]">
      {/* Vote Column (Left Gutter 60px) - Hidden on mobile */}
      <div className="hidden lg:block">
        <VoteColumn
          questionId={question.id}
          initialUpvotes={question.upvotes}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-20 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <QuestionHeader
          title={question.title}
          user={question.user}
          createdAt={question.createdAt}
          views={question.views}
          tags={question.tags}
          questionId={question.id}
          upvotes={question.upvotes}
        />
        
        <QuestionBody
          content={question.content}
          hasAIDraft={false}
        />

        {/* AI Loading State */}
        {showAILoading && (
          <AILoadingAnswer
            questionId={questionId}
            onAnswerReady={handleAnswerReady}
          />
        )}

        {/* Answers Section */}
        <AnswersSectionDynamic questionId={questionId} />

        {/* Answer Form */}
        <AnswerFormWrapper questionId={questionId} />
      </main>
    </div>
  )
}
