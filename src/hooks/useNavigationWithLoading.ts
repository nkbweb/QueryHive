'use client'

import { useRouter } from 'next/navigation'
import { useLoading } from '@/contexts/LoadingContext'

export function useNavigationWithLoading() {
  const router = useRouter()
  const { startLoading, stopLoading } = useLoading()

  const navigate = (href: string) => {
    startLoading()
    router.push(href)
    // Auto-stop loading after navigation completes
    setTimeout(stopLoading, 1500)
  }

  const replace = (href: string) => {
    startLoading()
    router.replace(href)
    setTimeout(stopLoading, 1500)
  }

  const back = () => {
    startLoading()
    router.back()
    setTimeout(stopLoading, 1500)
  }

  return { navigate, replace, back }
}
