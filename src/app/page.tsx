import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = createSupabaseServerClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect('/home') // Redirect to authenticated home page
  }

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
            <a className="text-[13px] text-tertiary-fixed hover:text-white transition-colors" href="/explore">Explore</a>
            <a className="text-[13px] text-tertiary-fixed hover:text-white transition-colors" href="/tags">Tags</a>
            <a className="text-[13px] text-tertiary-fixed hover:text-white transition-colors" href="/leaderboard">Leaderboard</a>
            <a className="text-[13px] text-tertiary-fixed hover:text-white transition-colors" href="/how-it-works">How it works</a>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <a className="text-[13px] text-tertiary-fixed hover:text-white transition-colors" href="/login">Log in</a>
          <a className="bg-lime-accent text-on-primary text-[13px] font-semibold h-[32px] px-[12px] flex items-center justify-center transition-opacity hover:opacity-90" href="/signup">
            Get started
          </a>
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
            <a className="bg-lime-accent text-on-primary text-[14px] font-bold h-[44px] px-6 flex items-center gap-2 hover:opacity-90 transition-opacity" href="/signup">
              Start asking <span className="text-[18px]">→</span>
            </a>
            <a className="text-[14px] text-white underline underline-offset-4 decoration-outline-variant hover:decoration-white transition-colors" href="/how-it-works">See how it works</a>
          </div>
        </section>

        {/* Live Feed Section */}
        <section className="max-w-[1200px] mx-auto px-6 py-12">
          <header className="flex items-center gap-4 mb-4">
            <h2 className="font-mono text-[11px] text-tertiary-fixed uppercase tracking-[0.2em]">Happening right now</h2>
            <div className="h-px flex-grow bg-outline opacity-50"></div>
          </header>
          <div className="border-t border-outline">
            {/* Row 1 */}
            <div className="h-[52px] flex items-center border-b border-outline hover:bg-surface-container-low transition-colors px-2">
              <div className="w-2 h-2 bg-lime-accent mr-4"></div>
              <div className="flex-grow flex items-center gap-4">
                <span className="text-[14px] text-white font-medium">How to implement zero-knowledge proofs in Rust for decentralized voting?</span>
                <div className="flex gap-2">
                  <span className="text-[11px] text-tertiary-fixed font-mono bg-surface-container-high px-1.5 py-0.5">#rust</span>
                  <span className="text-[11px] text-tertiary-fixed font-mono bg-surface-container-high px-1.5 py-0.5">#cryptography</span>
                </div>
              </div>
              <span className="font-mono text-[11px] text-tertiary-fixed">AI answered 12s ago</span>
            </div>

            {/* Row 2 */}
            <div className="h-[52px] flex items-center border-b border-outline hover:bg-surface-container-low transition-colors px-2">
              <div className="w-2 h-2 bg-white mr-4"></div>
              <div className="flex-grow flex items-center gap-4">
                <span className="text-[14px] text-white font-medium">Why do LLMs struggle with multi-step arithmetic reasoning?</span>
                <div className="flex gap-2">
                  <span className="text-[11px] text-tertiary-fixed font-mono bg-surface-container-high px-1.5 py-0.5">#ai</span>
                  <span className="text-[11px] text-tertiary-fixed font-mono bg-surface-container-high px-1.5 py-0.5">#llm</span>
                </div>
              </div>
              <span className="font-mono text-[11px] text-tertiary-fixed">Verified 2m ago</span>
            </div>

            {/* Row 3 */}
            <div className="h-[52px] flex items-center border-b border-outline hover:bg-surface-container-low transition-colors px-2">
              <div className="w-2 h-2 bg-[#F59E0B] mr-4"></div>
              <div className="flex-grow flex items-center gap-4">
                <span className="text-[14px] text-white font-medium">The performance impact of CSS-in-JS vs Tailwind in React 19?</span>
                <div className="flex gap-2">
                  <span className="text-[11px] text-tertiary-fixed font-mono bg-surface-container-high px-1.5 py-0.5">#webdev</span>
                  <span className="text-[11px] text-tertiary-fixed font-mono bg-surface-container-high px-1.5 py-0.5">#react</span>
                </div>
              </div>
              <span className="font-mono text-[11px] text-tertiary-fixed">Discussing now</span>
            </div>

            {/* Row 4 */}
            <div className="h-[52px] flex items-center border-b border-outline hover:bg-surface-container-low transition-colors px-2">
              <div className="w-2 h-2 bg-lime-accent mr-4"></div>
              <div className="flex-grow flex items-center gap-4">
                <span className="text-[14px] text-white font-medium">Best practices for setting up a multi-cloud Kubernetes cluster?</span>
                <div className="flex gap-2">
                  <span className="text-[11px] text-tertiary-fixed font-mono bg-surface-container-high px-1.5 py-0.5">#devops</span>
                  <span className="text-[11px] text-tertiary-fixed font-mono bg-surface-container-high px-1.5 py-0.5">#k8s</span>
                </div>
              </div>
              <span className="font-mono text-[11px] text-tertiary-fixed">AI answered 5m ago</span>
            </div>

            {/* Row 5 */}
            <div className="h-[52px] flex items-center border-b border-outline hover:bg-surface-container-low transition-colors px-2">
              <div className="w-2 h-2 bg-lime-accent mr-4"></div>
              <div className="flex-grow flex items-center gap-4">
                <span className="text-[14px] text-white font-medium">Optimal database indexing strategies for high-write workloads?</span>
                <div className="flex gap-2">
                  <span className="text-[11px] text-tertiary-fixed font-mono bg-surface-container-high px-1.5 py-0.5">#database</span>
                  <span className="text-[11px] text-tertiary-fixed font-mono bg-surface-container-high px-1.5 py-0.5">#performance</span>
                </div>
              </div>
              <span className="font-mono text-[11px] text-tertiary-fixed">Verified 8m ago</span>
            </div>
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
            {/* Card 1 */}
            <div className="min-w-[320px] bg-surface-container-lowest border border-outline p-5 flex flex-col justify-between">
              <h4 className="text-[14px] font-medium text-white mb-6">How does React&apos;s concurrent rendering work under the hood?</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-tertiary-fixed font-mono bg-surface-container px-1.5 py-0.5">AI DRAFT</span>
                  <span className="text-[10px] text-on-primary font-mono bg-lime-accent/10 px-1.5 py-0.5">VERIFIED ✓</span>
                </div>
                <span className="font-mono text-[11px] text-tertiary-fixed">124 votes</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="min-w-[320px] bg-surface-container-lowest border border-outline p-5 flex flex-col justify-between">
              <h4 className="text-[14px] font-medium text-white mb-6">Why is B-tree preferred over Hash tables for database indexing?</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-tertiary-fixed font-mono bg-surface-container px-1.5 py-0.5">AI DRAFT</span>
                  <span className="text-[10px] text-on-primary font-mono bg-lime-accent/10 px-1.5 py-0.5">VERIFIED ✓</span>
                </div>
                <span className="font-mono text-[11px] text-tertiary-fixed">89 votes</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="min-w-[320px] bg-surface-container-lowest border border-outline p-5 flex flex-col justify-between">
              <h4 className="text-[14px] font-medium text-white mb-6">Explaining to CAP theorem in modern distributed systems?</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-tertiary-fixed font-mono bg-surface-container px-1.5 py-0.5">AI DRAFT</span>
                  <span className="text-[10px] text-on-primary font-mono bg-lime-accent/10 px-1.5 py-0.5">VERIFIED ✓</span>
                </div>
                <span className="font-mono text-[11px] text-tertiary-fixed">256 votes</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="min-w-[320px] bg-surface-container-lowest border border-outline p-5 flex flex-col justify-between">
              <h4 className="text-[14px] font-medium text-white mb-6">What is the difference between gRPC and TRPC?</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-tertiary-fixed font-mono bg-surface-container px-1.5 py-0.5">AI DRAFT</span>
                  <span className="text-[10px] text-on-primary font-mono bg-lime-accent/10 px-1.5 py-0.5">VERIFIED ✓</span>
                </div>
                <span className="font-mono text-[11px] text-tertiary-fixed">67 votes</span>
              </div>
            </div>

            {/* Card 5 */}
            <div className="min-w-[320px] bg-surface-container-lowest border border-outline p-5 flex flex-col justify-between">
              <h4 className="text-[14px] font-medium text-white mb-6">Understanding Memory Safety in the context of Zig vs C++?</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-tertiary-fixed font-mono bg-surface-container px-1.5 py-0.5">AI DRAFT</span>
                  <span className="text-[10px] text-on-primary font-mono bg-lime-accent/10 px-1.5 py-0.5">VERIFIED ✓</span>
                </div>
                <span className="font-mono text-[11px] text-tertiary-fixed">142 votes</span>
              </div>
            </div>

            {/* Card 6 */}
            <div className="min-w-[320px] bg-surface-container-lowest border border-outline p-5 flex flex-col justify-between">
              <h4 className="text-[14px] font-medium text-white mb-6">How to scale a WebSocket server to 1M connections?</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-tertiary-fixed font-mono bg-surface-container px-1.5 py-0.5">AI DRAFT</span>
                  <span className="text-[10px] text-on-primary font-mono bg-lime-accent/10 px-1.5 py-0.5">VERIFIED ✓</span>
                </div>
                <span className="font-mono text-[11px] text-tertiary-fixed">312 votes</span>
              </div>
            </div>
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
          <a className="text-[13px] text-tertiary-fixed hover:text-white transition-colors" href="#">GitHub</a>
          <a className="text-[13px] text-tertiary-fixed hover:text-white transition-colors" href="#">Twitter</a>
          <a className="text-[13px] text-tertiary-fixed hover:text-white transition-colors" href="#">RSS</a>
          <a className="text-[13px] text-tertiary-fixed hover:text-white transition-colors" href="#">Privacy</a>
        </div>
      </footer>
    </div>
  )
}
