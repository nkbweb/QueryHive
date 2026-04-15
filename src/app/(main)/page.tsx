import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getQuestions } from '@/lib/queries/questions'
import QuestionFeed from '@/components/question/QuestionFeed'
import RightSidebar from '@/components/layout/RightSidebar'

export default async function HomePage() {
  const supabase = createSupabaseServerClient()
  
  // Try to get session first, then user as fallback
  const { data: sessionData } = await supabase.auth.getSession()
  let user = sessionData.session?.user || null
  
  if (!user) {
    const { data: userData } = await supabase.auth.getUser()
    user = userData.user
  }

  if (!user) {
    redirect('/login')
  }

  // Fetch questions
  const questions = await getQuestions()

  return (
    <div className="flex h-full">
      <QuestionFeed questions={questions} />
      <RightSidebar />
    </div>
  )
}
