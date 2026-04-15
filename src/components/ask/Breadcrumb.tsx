interface BreadcrumbProps {
  currentPage: string
}

export default function Breadcrumb({ currentPage }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-white/30 mb-6">
      <a className="hover:text-white transition-colors" href="/home">Home</a>
      <span className="text-[10px]">/</span>
      <span className="text-white/60">{currentPage}</span>
    </nav>
  )
}
