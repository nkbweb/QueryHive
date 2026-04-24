import Answer from './Answer'
import AIAnswer from './AIAnswer'

interface AnswersSectionProps {
  answers: Array<{
    id: string
    content: string
    upvotes: number
    downvotes: number
    verificationCount: number
    flagCount: number
    isAI: boolean
    status: string
    createdAt: string
    updatedAt: string
    user: {
      id: string
      username: string
      avatarUrl?: string
      reputation: number
    }
  }>
}

export default function AnswersSection({ answers }: AnswersSectionProps) {
  if (!answers || answers.length === 0) {
    return null
  }

  const acceptedAnswer = answers.find(answer => !answer.isAI && answer.verificationCount > 10)
  const aiAnswers = answers.filter(answer => answer.isAI)
  const humanAnswers = answers.filter(answer => !answer.isAI && answer.verificationCount <= 10)

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-white tracking-tight">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-surface-container-high/10 border border-surface-container-high/20">
          <span className="text-[10px] font-label text-surface-container-high">
            Sorted by Score
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Accepted Answer */}
        {acceptedAnswer && (
          <div className="bg-primary-container/5 border border-primary-container/20 rounded p-3">
            <Answer answer={acceptedAnswer} isAccepted={true} />
          </div>
        )}

        {/* AI Answers */}
        {aiAnswers.map((answer) => (
          <AIAnswer key={answer.id} answer={answer} />
        ))}

        {/* Human Answers */}
        {humanAnswers.map((answer, index) => (
          <div 
            key={answer.id} 
            className={`rounded p-3 border border-white/[0.03] ${
              index % 2 === 0 
                ? 'bg-surface-container/30' 
                : 'bg-transparent'
            }`}
          >
            <Answer answer={answer} />
          </div>
        ))}
      </div>
    </div>
  )
}
