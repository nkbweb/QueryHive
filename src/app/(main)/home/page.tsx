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
    <div className="relative min-h-screen w-full bg-[#0a0a0c] overflow-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════
            LAYER 1: PRIMARY MONOCHROME DOT GRID (CORE TEXTURE)
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.08) 0.6px, transparent 0.6px)
          `,
          backgroundSize: '20px 20px, 14px 14px',
          opacity: 0.65,
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
            LAYER 2: SECONDARY OFFSET GRID (SUBTLE DEPTH)
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(255,255,255,0.06) 0.8px, transparent 0.8px)
          `,
          backgroundSize: '28px 28px',
          transform: 'translate(14px, 14px)',
          opacity: 0.45,
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
            LAYER 3: MICRO-DOT FINISH (PREMIUM POLISH)
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.03) 0.4px, transparent 0.4px)`,
          backgroundSize: '10px 10px',
          opacity: 0.35,
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
            LAYER 4: SINGLE STRATEGIC ACCENT GLOW (MINIMAL)
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="absolute -top-48 -left-48 w-[580px] h-[580px]"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, 
              rgba(59,130,246,0.12) 0%, 
              rgba(99,102,241,0.08) 50%, 
              transparent 75%
            )
          `,
          filter: 'blur(80px)',
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
            LAYER 5: PRECISION VIGNETTE (PERFECT FOCUS)
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 25%, 
              transparent 0%, 
              rgba(10,10,12,0.4) 35%,
              rgba(10,10,12,0.75) 65%,
              #0a0a0c 85%
            )
          `,
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
            LAYER 6: CLEAN BOTTOM FADE
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-x-0 bottom-0 h-72"
        style={{
          background: `
            linear-gradient(to top, 
              #0a0a0c 0%, 
              rgba(10,10,12,0.95) 25%, 
              rgba(10,10,12,0.6) 70%, 
              transparent 100%
            )
          `,
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
            CONTENT (ISOLATED)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex h-full">
        <div className="flex-1 pr-0 lg:pr-[360px]">
          <QuestionFeed questions={questions} />
        </div>
        <div className="hidden lg:block fixed right-0 top-[56px] w-[360px] h-[calc(100vh-56px)] pointer-events-none">
          <RightSidebar />
        </div>
      </div>

    </div>
  )
}