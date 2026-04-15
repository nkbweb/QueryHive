import { getQuestionById } from '@/lib/queries/questions'
import QuestionPageClient from './QuestionPageClient'

interface QuestionPageProps {
  params: {
    id: string
  }
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const question = await getQuestionById(params.id)

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

  return <QuestionPageClient questionId={params.id} initialQuestion={question} />
}
