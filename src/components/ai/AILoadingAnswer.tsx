'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AILoadingAnswerProps {
  questionId: string
  onAnswerReady: () => void
}

export default function AILoadingAnswer({ questionId, onAnswerReady }: AILoadingAnswerProps) {
  const [isChecking, setIsChecking] = useState(true)
  const [attempts, setAttempts] = useState(0)
  const maxAttempts = 30 // Check for up to 30 seconds

  useEffect(() => {
    const checkForAIAnswer = async () => {
      try {
        const supabase = createClient()
        const { data: answers, error } = await supabase
          .from('answers')
          .select('id, is_ai')
          .eq('question_id', questionId)
          .eq('is_ai', true)
          .single()

        if (answers && !error) {
          // AI answer found!
          setIsChecking(false)
          onAnswerReady()
        } else {
          // No AI answer yet, continue checking
          setAttempts(prev => prev + 1)
        }
      } catch (error) {
        console.error('Error checking for AI answer:', error)
      }
    }

    if (isChecking && attempts < maxAttempts) {
      const timer = setTimeout(checkForAIAnswer, 1000) // Check every 1 second
      return () => clearTimeout(timer)
    } else if (attempts >= maxAttempts) {
      // Stop checking after max attempts
      setIsChecking(false)
    }
  }, [questionId, isChecking, attempts, onAnswerReady])

  if (!isChecking) {
    return null // Don't show anything if not checking
  }

  return (
    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">
                smart_toy
              </span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-blue-400">AI is generating an answer</h3>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-3">
              Our AI is analyzing your question and preparing a helpful response...
            </p>
            
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">psychology</span>
                <span>Analyzing context</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                <span>Generating insights</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>Formatting response</span>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((attempts / maxAttempts) * 100, 95)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
