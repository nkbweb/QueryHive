'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading'

type Tag = {
  id: string
  name: string
  color: string
}

type Question = {
  id: string
  title: string
  content: string
  views: number
  upvotes: number
  answerCount: number
  createdAt: string
  username: string
  tags: Tag[]
}

export default function Home() {
  const router = useRouter()
  const { navigate } = useNavigationWithLoading()
  const [session, setSession] = useState<any>(null)
  const [trendingQuestions, setTrendingQuestions] = useState<Question[]>([])
  const [mostViewedQuestions, setMostViewedQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/home')
      } else {
        setSession(session)
      }
    }

    const fetchQuestions = async () => {
      try {
        const [trendingRes, mostViewedRes] = await Promise.all([
          fetch('/api/explore/trending?limit=5'),
          fetch('/api/explore/most-viewed?limit=6')
        ])
        const [trendingData, mostViewedData] = await Promise.all([
          trendingRes.json(),
          mostViewedRes.json()
        ])
        setTrendingQuestions(trendingData.questions || [])
        setMostViewedQuestions(mostViewedData.questions || [])
      } catch (error) {
        console.error('Error fetching questions:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
    fetchQuestions()
  }, [router])

  // Show landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-neutral text-on-background">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full h-[48px] bg-background border-b border-outline z-50 flex justify-between items-center px-6">
        <div className="flex items-center gap-8">
          <span className="text-white text-[13px] font-semibold tracking-[-0.02em] flex items-center gap-2">
            <span className="text-lime-accent">⬡</span> QueryHive
          </span>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/explore')} className="text-[13px] text-tertiary-fixed hover:text-white transition-colors">Explore</button>
            <button onClick={() => navigate('/tags')} className="text-[13px] text-tertiary-fixed hover:text-white transition-colors">Tags</button>
            <button onClick={() => navigate('/leaderboard')} className="text-[13px] text-tertiary-fixed hover:text-white transition-colors">Leaderboard</button>
            <button onClick={() => navigate('/how-it-works')} className="text-[13px] text-tertiary-fixed hover:text-white transition-colors">How it works</button>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/login')} className="text-[13px] text-tertiary-fixed hover:text-white transition-colors">Log in</button>
          <button onClick={() => navigate('/signup')} className="bg-lime-accent text-on-primary text-[13px] font-semibold h-[32px] px-[12px] flex items-center justify-center transition-opacity hover:opacity-90">
            Get started
          </button>
        </div>
      </nav>
      
      <main className="pt-[48px]">
        {/* Hero Section */}
        <section className="max-w-[1200px] mx-auto px-6 pt-24 pb-20 flex flex-col items-start">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-accent animate-pulse"></span>
            <span className="font-mono text-[11px] text-tertiary-fixed uppercase tracking-wider">AI is live · answering questions now</span>
          </div>
          <h1 className="text-[64px] font-[800] leading-[1.1] tracking-[-0.03em] mb-6">
            Ask anything.<br/>
            <span className="text-lime-accent">Get an answer in seconds.</span>
          </h1>
          <p className="text-[16px] text-tertiary-fixed max-w-[480px] mb-10 leading-relaxed">
            Post a question. Our AI responds instantly. The community refines it. No more waiting for the truth.
          </p>
          <div className="flex items-center gap-8">
            <button onClick={() => navigate('/signup')} className="bg-lime-accent text-on-primary text-[14px] font-bold h-[44px] px-6 flex items-center gap-2 hover:opacity-90 transition-opacity">
              Start asking <span className="text-[18px]">→</span>
            </button>
            <button onClick={() => navigate('/explore')} className="text-[14px] text-white underline underline-offset-4 decoration-outline-variant hover:decoration-white transition-colors">Explore questions</button>
          </div>
        </section>

        {/* Live Feed Section */}
        <section className="max-w-[1200px] mx-auto px-6 py-12">
          <header className="flex items-center gap-4 mb-4">
            <h2 className="font-mono text-[11px] text-tertiary-fixed uppercase tracking-[0.2em]">Happening right now</h2>
            <div className="h-px flex-grow bg-outline opacity-50"></div>
          </header>
          <div className="border-t border-outline">
            {trendingQuestions.length > 0 ? (
              trendingQuestions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => navigate(`/questions/${question.id}`)}
                  className="w-full h-[52px] flex items-center border-b border-outline hover:bg-surface-container-low transition-colors px-2 text-left"
                >
                  <div className={`w-2 h-2 mr-4 ${index === 0 ? 'bg-lime-accent' : 'bg-white'}`}></div>
                  <div className="flex-grow flex items-center gap-4">
                    <span className="text-[14px] text-white font-medium">{question.title}</span>
                    {question.tags.length > 0 && (
                      <div className="hidden md:flex gap-2">
                        {question.tags.slice(0, 2).map((tag: Tag) => (
                          <span key={tag.id} className="text-[11px] text-white font-mono bg-surface-container-high border border-outline px-2 py-0.5 rounded">
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-tertiary-fixed">{question.createdAt}</span>
                </button>
              ))
            ) : (
              <div className="h-[52px] flex items-center border-b border-outline px-2">
                <span className="text-[14px] text-tertiary-fixed">No questions yet</span>
              </div>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-[1200px] mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="font-mono text-[11px] text-lime-accent mb-2">01 /</div>
              <h3 className="font-mono text-[11px] text-white uppercase tracking-widest mb-4">You ask</h3>
              <p className="text-[14px] text-tertiary-fixed leading-relaxed">
                Post any technical or complex question in seconds. Our minimal interface keeps you focused.
              </p>
            </div>
            <div>
              <div className="font-mono text-[11px] text-lime-accent mb-2">02 /</div>
              <h3 className="font-mono text-[11px] text-white uppercase tracking-widest mb-4">AI answers instantly</h3>
              <p className="text-[14px] text-tertiary-fixed leading-relaxed">
                An AI draft appears before anyone else can blink. High-accuracy context retrieval at work.
              </p>
            </div>
            <div>
              <div className="font-mono text-[11px] text-lime-accent mb-2">03 /</div>
              <h3 className="font-mono text-[11px] text-white uppercase tracking-widest mb-4">Community refines</h3>
              <p className="text-[14px] text-tertiary-fixed leading-relaxed">
                Humans vote, correct, and improve. Experts verify technical nuances. Truth rises to the top.
              </p>
            </div>
          </div>
        </section>

        {/* Social Proof Strip */}
        <section className="w-full overflow-hidden py-12 border-t border-outline">
          <div className="flex gap-4 px-6 overflow-x-auto pb-4">
            {mostViewedQuestions.length > 0 ? (
              mostViewedQuestions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => navigate(`/questions/${question.id}`)}
                  className="min-w-[320px] bg-surface-container-lowest border border-outline p-5 flex flex-col justify-between hover:bg-surface-container-low transition-colors text-left"
                >
                  <h4 className="text-[14px] font-medium text-white mb-6 line-clamp-2">{question.title}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white font-mono bg-surface-container border border-outline px-2 py-0.5 rounded">AI DRAFT</span>
                      {question.answerCount > 0 && (
                        <span className="text-[10px] text-lime-accent font-mono bg-lime-accent/10 border border-lime-accent/30 px-2 py-0.5 rounded">VERIFIED ✓</span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-white">{question.upvotes} votes</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="min-w-[320px] bg-surface-container-lowest border border-outline p-5 flex items-center justify-center">
                <span className="text-[14px] text-tertiary-fixed">No questions yet</span>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-[1200px] mx-auto px-6 py-12 mt-12 border-t border-outline flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-[13px] font-semibold text-white">⬡ QueryHive</span>
          <span className="text-[13px] text-tertiary-fixed"> 2025</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-[13px] text-tertiary-fixed hover:text-white transition-colors">GitHub</button>
          <button className="text-[13px] text-tertiary-fixed hover:text-white transition-colors">Twitter</button>
          <button className="text-[13px] text-tertiary-fixed hover:text-white transition-colors">RSS</button>
          <button className="text-[13px] text-tertiary-fixed hover:text-white transition-colors">Privacy</button>
        </div>
      </footer>
    </div>
  )
}
