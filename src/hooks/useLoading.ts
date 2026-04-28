'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const startLoading = useCallback(() => {
    setIsLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  const navigateWithLoading = useCallback((href: string) => {
    startLoading()
    router.push(href)
    // Stop loading after a reasonable delay to allow for page transition
    setTimeout(stopLoading, 1000)
  }, [router, startLoading, stopLoading])

  const executeWithLoading = useCallback(async <T>(
    asyncFunction: () => Promise<T>
  ): Promise<T | null> => {
    startLoading()
    try {
      const result = await asyncFunction()
      return result
    } catch (error) {
      console.error('Error in executeWithLoading:', error)
      return null
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    isLoading,
    startLoading,
    stopLoading,
    navigateWithLoading,
    executeWithLoading
  }
}
