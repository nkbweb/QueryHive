interface Guideline {
  title: string
  description: string
}

export default function Guidelines() {
  const guidelines: Guideline[] = [
    {
      title: 'Be specific',
      description: 'Ambiguous titles get fewer answers.'
    },
    {
      title: 'Show your work',
      description: 'Explain what you already tried.'
    }
  ]

  return (
    <section>
      <h3 className="text-[11px] font-mono uppercase tracking-[0.1em] text-white/30 mb-4 border-b border-white/5 pb-2">
        Guidelines
      </h3>
      <ul className="space-y-4">
        {guidelines.map((guideline, index) => (
          <li key={index} className="group">
            <div className="text-[12px] text-white/70 leading-tight group-hover:text-white transition-colors">
              {guideline.title}
            </div>
            <p className="text-[10px] text-white/30 mt-1 leading-normal">
              {guideline.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
