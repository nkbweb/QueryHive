interface RelatedQuery {
  title: string
  replies?: number
  timeAgo?: string
  solved?: boolean
  url: string
}

export default function RelatedQueries() {
  const relatedQueries: RelatedQuery[] = [
    {
      title: 'How to optimize React re-renders with large lists?',
      replies: 14,
      timeAgo: '2m ago',
      url: '#'
    },
    {
      title: 'Understanding Tailwind JIT in containerized environments',
      solved: true,
      url: '#'
    }
  ]

  return (
    <section>
      <h3 className="text-[11px] font-mono uppercase tracking-[0.1em] text-white/30 mb-4 border-b border-white/5 pb-2">
        Related Queries
      </h3>
      <ul className="space-y-6">
        {relatedQueries.map((query, index) => (
          <li key={index}>
            <a
              href={query.url}
              className="block text-[12px] text-white/60 hover:text-[#E8FF47] transition-colors leading-snug"
            >
              {query.title}
            </a>
            <div className="flex items-center gap-2 mt-2">
              {query.replies && (
                <>
                  <span className="text-[10px] font-mono text-white/20">
                    {query.replies} replies
                  </span>
                  <span className="w-[3px] h-[3px] rounded-full bg-white/10"></span>
                  <span className="text-[10px] font-mono text-white/20">
                    {query.timeAgo}
                  </span>
                </>
              )}
              {query.solved && (
                <span className="text-[10px] font-mono text-[#E8FF47]">
                  \u2713 Solved
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
