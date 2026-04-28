'use client'

import { useState, useEffect, useCallback } from 'react'
import Answer from './Answer'
import AIAnswer from './AIAnswer'
import { createClient } from '@/lib/supabase/client'

interface AnswersSectionDynamicProps {
  questionId: string
}

export default function AnswersSectionDynamic({ questionId }: AnswersSectionDynamicProps) {
  const [answers, setAnswers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAnswers = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('answers')
        .select(`
          id,
          content,
          upvotes,
          downvotes,
          verification_count,
          flag_count,
          is_ai,
          status,
          created_at,
          updated_at,
          user_id,
          profiles (
            id,
            username,
            avatar_url,
            reputation
          )
        `)
        .eq('question_id', questionId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching answers:', error)
        return
      }

      const formattedAnswers = (data || []).map((answer) => {
        // Handle AI answers
        const isAIAnswer = answer.is_ai === true

        if (isAIAnswer) {
          return {
            id: answer.id,
            content: answer.content,
            upvotes: answer.upvotes || 0,
            downvotes: answer.downvotes || 0,
            verificationCount: answer.verification_count || 0,
            flagCount: answer.flag_count || 0,
            isAI: true,
            status: answer.status || 'published',
            createdAt: new Date(answer.created_at).toLocaleString(),
            updatedAt: new Date(answer.updated_at).toLocaleString(),
            user: {
              id: answer.user_id,
              username: 'AI Assistant',
              avatarUrl: null,
              reputation: 0
            }
          };
        }

        const profile = answer.profiles as any;
        return {
          id: answer.id,
          content: answer.content,
          upvotes: answer.upvotes || 0,
          downvotes: answer.downvotes || 0,
          verificationCount: answer.verification_count || 0,
          flagCount: answer.flag_count || 0,
          isAI: answer.is_ai || false,
          status: answer.status || 'published',
          createdAt: new Date(answer.created_at).toLocaleString(),
          updatedAt: new Date(answer.updated_at).toLocaleString(),
          user: {
            id: profile?.id || answer.user_id,
            username: profile?.username || 'Unknown',
            avatarUrl: profile?.avatar_url,
            reputation: profile?.reputation || 0
          }
        };
      }).sort((a, b) => {
        // Sort: AI answers first, then by upvotes
        if (a.isAI && !b.isAI) return -1
        if (!a.isAI && b.isAI) return 1
        return b.upvotes - a.upvotes
      });

      setAnswers(formattedAnswers)
    } catch (error) {
      console.error('Error fetching answers:', error)
    } finally {
      setLoading(false)
    }
  }, [questionId])

  useEffect(() => {
    fetchAnswers()

    // Set up Realtime subscription
    const supabase = createClient()
    const channel = supabase
      .channel('answers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answers',
          filter: `question_id=eq.${questionId}`
        },
        (payload) => {
          console.log('Answer change received:', payload)
          fetchAnswers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [questionId, fetchAnswers])

  if (loading) {
    return (
      <div className="mt-12">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (!answers || answers.length === 0) {
    return null
  }

  const acceptedAnswer = answers.find(answer => !answer.isAI && answer.verificationCount > 10)
  const aiAnswers = answers.filter(answer => answer.isAI)
  const humanAnswers = answers.filter(answer => !answer.isAI && answer.verificationCount <= 10)

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-medium text-white tracking-tight">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-surface-container-high/10 border border-surface-container-high/20">
          <span className="text-[10px] font-label text-surface-container-high">
            Sorted by Score
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* AI Answers */}
        {aiAnswers.map((answer) => (
          <AIAnswer key={answer.id} answer={answer} />
        ))}

        {/* Accepted Answer */}
        {acceptedAnswer && (
          <div className="bg-lime-accent/8 border border-lime-accent/25 rounded-lg p-6 shadow-lg">
            <Answer answer={acceptedAnswer} isAccepted={true} />
          </div>
        )}

        {/* Human Answers */}
        {humanAnswers.map((answer, index) => (
          <div 
            key={answer.id} 
            className={`rounded-lg p-6 shadow-md ${
              index % 2 === 0 
                ? 'bg-surface-container/50 border border-surface-container/40' 
                : 'bg-surface-container-high/30 border border-surface-container-high/40'
            }`}
          >
            <Answer answer={answer} />
          </div>
        ))}
      </div>
    </div>
  )
}
