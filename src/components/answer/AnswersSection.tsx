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
        {/* Accepted Answer */}
        {acceptedAnswer && (
          <div className="bg-lime-accent/8 border border-lime-accent/25 rounded-lg p-6 shadow-lg">
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
