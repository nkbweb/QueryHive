import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getQuestions } from '@/lib/queries/questions'
import QuestionFeed from '@/components/question/QuestionFeed'
import RightSidebar from '@/components/layout/RightSidebar'

export default async function HomePage() {
  const supabase = createSupabaseServerClient()

  const { data: sessionData } = await supabase.auth.getSession()
  let user = sessionData.session?.user || null

  if (!user) {
    const { data: userData } = await supabase.auth.getUser()
    user = userData.user
  }

  if (!user) {
    redirect('/login')
  }

  const questions = await getQuestions()

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] max-w-full overflow-hidden">
      <div className="relative z-10 flex h-full">
        <div className="flex-1 min-w-0 pr-0 lg:pr-[300px]">
          <QuestionFeed questions={questions} />
        </div>
        <div className="hidden lg:block fixed right-0 top-[56px] w-[300px] h-[calc(100vh-56px)] pointer-events-none">
          <RightSidebar />
        </div>
      </div>
    </div>
  )
}