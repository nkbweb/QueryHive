'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface SearchParamsWrapperProps {
  children: (searchParams: URLSearchParams) => React.ReactNode
}

export default function SearchParamsWrapper({ children }: SearchParamsWrapperProps) {
  return (
    <Suspense fallback={null}>
      {children(useSearchParams())}
    </Suspense>
  )
}
