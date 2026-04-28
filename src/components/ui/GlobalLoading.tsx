'use client'

import { useLoading } from '@/contexts/LoadingContext'
import ProgressBar from './ProgressBar'

export default function GlobalLoading() {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return <ProgressBar />
}
