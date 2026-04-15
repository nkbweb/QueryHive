'use client'

import { useState } from 'react'

interface MarkdownProps {
  content: string
  className?: string
}

export default function Markdown({ content, className = '' }: MarkdownProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const parseMarkdown = (text: string) => {
    // First, check if there are any markdown code blocks
    const markdownCodeRegex = /```[\s\S]*?```/g
    const hasMarkdownCode = markdownCodeRegex.test(text)
    
    let processedContent = text
    
    // If no markdown code blocks, try to auto-detect code blocks
    if (!hasMarkdownCode) {
      processedContent = autoDetectCodeBlocks(text)
    }
    
    // Now process the content with markdown code blocks
    const codeBlockRegex = /```[\s\S]*?```/g
    const parts = processedContent.split(codeBlockRegex)
    const codeMatches = processedContent.match(codeBlockRegex) || []
    
    const elements: JSX.Element[] = []
    let codeIndex = 0

    for (let i = 0; i < parts.length; i++) {
      // Process text part (could contain headings, horizontal rules, paragraphs and inline code)
      if (parts[i].trim()) {
        const lines = parts[i].split('\n')
        
        for (let j = 0; j < lines.length; j++) {
          const line = lines[j].trim()
          
          // Handle horizontal rules (--- or ***)
          if (line === '---' || line === '***') {
            elements.push(
              <hr key={`hr-${i}-${j}`} className="border-t border-gray-800 mt-3 mb-4 opacity-50" />
            )
            continue
          }
          
          // Handle headings (# ## ### etc.)
          if (line.startsWith('#')) {
            const match = line.match(/^(#{1,6})\s+(.+)$/)
            if (match) {
              const level = match[1].length
              const text = match[2]
              const headingClass = level === 1 ? 'text-2xl font-semibold mb-4 text-white' : 
                                  level === 2 ? 'text-xl font-semibold mb-3 text-white' : 
                                  level === 3 ? 'text-lg font-semibold mb-2 text-white' : 
                                  'text-base font-semibold mb-2 text-white'
              
              const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements
              elements.push(
                <HeadingTag key={`h-${i}-${j}`} className={headingClass}>
                  {processInlineCode(text, `h-${i}-${j}`)}
                </HeadingTag>
              )
              continue
            }
          }
          
          // Handle regular paragraphs
          if (line) {
            // Check if this is part of a paragraph or a new paragraph
            const nextLine = lines[j + 1]?.trim()
            const isParagraphEnd = !nextLine || nextLine.startsWith('#') || nextLine === '---' || nextLine === '***'
            
            if (!isParagraphEnd) {
              // Part of a multi-line paragraph
              const paragraphStart = j
              while (j < lines.length && lines[j].trim() && 
                     !lines[j].trim().startsWith('#') && 
                     lines[j].trim() !== '---' && 
                     lines[j].trim() !== '***') {
                j++
              }
              j-- // Back up one since the loop will increment
              
              const paragraphLines = lines.slice(paragraphStart, j + 1)
              const paragraph = paragraphLines.join('\n').trim()
              
              if (paragraph) {
                const processedParagraph = processInlineCode(paragraph, `p-${i}-${paragraphStart}`)
                elements.push(
                  <p key={`p-${i}-${paragraphStart}`} className="mb-4">
                    {processedParagraph}
                  </p>
                )
              }
            } else {
              // Single line paragraph
              const processedParagraph = processInlineCode(line, `p-${i}-${j}`)
              elements.push(
                <p key={`p-${i}-${j}`} className="mb-4">
                  {processedParagraph}
                </p>
              )
            }
          }
        }
      }

      // Add the code block if there is one
      if (codeIndex < codeMatches.length) {
        const codeBlock = codeMatches[codeIndex]
        const codeContent = codeBlock.replace(/```[\w]*\n?/, '').replace(/```$/, '')
        
        elements.push(
          <div key={`code-${i}`} className="bg-[#0F0F12] p-4 mb-4 border-l-4 border-lime-accent shadow-lg relative">
            <button
              onClick={() => copyToClipboard(codeContent)}
              className="absolute p-2 rounded bg-surface-container/50 hover:bg-surface-container/70 transition-colors duration-200 group z-10"
              style={{ top: '8px', right: '8px' }}
              title="Copy code"
            >
              <span className="material-symbols-outlined text-[16px] text-white/60 group-hover:text-lime-accent">
                {copiedCode === codeContent ? 'check' : 'content_copy'}
              </span>
            </button>
            <pre className="code-block text-[13px] text-[#FF8C42] overflow-x-auto pr-12">
              <code>{codeContent}</code>
            </pre>
          </div>
        )
        
        codeIndex++
      }
    }

    return elements
  }

  const autoDetectCodeBlocks = (text: string): string => {
    // Detect patterns that look like code blocks
    // Look for multiple lines with indentation, function definitions, imports, etc.
    const lines = text.split('\n')
    const result: string[] = []
    let inCodeBlock = false
    let codeLines: string[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()
      
      // Check if this line looks like code
      const looksLikeCode = 
        trimmedLine.startsWith('import ') ||
        trimmedLine.startsWith('from ') ||
        trimmedLine.startsWith('function ') ||
        trimmedLine.startsWith('const ') ||
        trimmedLine.startsWith('let ') ||
        trimmedLine.startsWith('var ') ||
        trimmedLine.includes('=>') ||
        trimmedLine.includes('{') ||
        trimmedLine.includes('}') ||
        trimmedLine.includes(';') ||
        trimmedLine.includes('return ') ||
        trimmedLine.includes('useEffect') ||
        trimmedLine.includes('useState') ||
        (trimmedLine.length > 0 && line.startsWith('  ')) // indented lines
      
      if (looksLikeCode && !inCodeBlock) {
        // Start a code block
        inCodeBlock = true
        codeLines = [line]
      } else if (inCodeBlock && (looksLikeCode || line.trim() === '')) {
        // Continue code block
        codeLines.push(line)
      } else if (inCodeBlock && !looksLikeCode && line.trim() !== '') {
        // End code block
        result.push('```')
        result.push(...codeLines)
        result.push('```')
        result.push('')
        result.push(line)
        inCodeBlock = false
        codeLines = []
      } else if (!inCodeBlock) {
        // Regular text
        result.push(line)
      }
    }
    
    // Handle case where we end while in a code block
    if (inCodeBlock && codeLines.length > 0) {
      result.push('```')
      result.push(...codeLines)
      result.push('```')
    }
    
    return result.join('\n')
  }

  const processInlineCode = (text: string, key: string): React.ReactNode[] => {
    const parts = text.split(/`([^`]+)`/)
    const elements: React.ReactNode[] = []

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        // Inline code
        elements.push(
          <code 
            key={`inline-${key}-${i}`} 
            className="bg-[#1C1B1E] px-1 py-0.5 rounded text-[13px] text-[#FF8C42] font-mono border-l border-lime-accent/50"
          >
            {parts[i]}
          </code>
        )
      } else if (parts[i]) {
        // Process remaining text for other markdown
        elements.push(processInlineMarkdown(parts[i], `inline-${key}-${i}`))
      }
    }

    return elements
  }

  const processInlineMarkdown = (text: string, key: string): React.ReactNode[] => {
    // Process bold, italics, and other inline markdown
    let processedText = text
    
    // Bold text (**text**)
    processedText = processedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    
    // Italic text (*text*)
    processedText = processedText.replace(/\*([^*]+)\*/g, '<em>$1</em>')
    
    // Links [text](url)
    processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300">$1</a>')
    
    // Split by HTML tags and process
    const parts = processedText.split(/(<[^>]+>)/)
    const elements: React.ReactNode[] = []
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (part.startsWith('<') && part.endsWith('>')) {
        // HTML tag - render as-is
        elements.push(<span key={`${key}-${i}`} dangerouslySetInnerHTML={{ __html: part }} />)
      } else if (part) {
        // Regular text
        elements.push(part)
      }
    }
    
    return elements
  }

  return (
    <div className={`text-[15px] text-[#D4D4D8] leading-relaxed ${className}`}>
      {parseMarkdown(content)}
    </div>
  )
}
