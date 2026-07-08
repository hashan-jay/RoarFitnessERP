import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface LoadingContextValue {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
  runWithLoading: <T>(operation: () => Promise<T>) => Promise<T>
}

const LoadingContext = createContext<LoadingContextValue | null>(null)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const pendingCountRef = useRef(0)
  const [isLoading, setIsLoading] = useState(false)

  const startLoading = useCallback(() => {
    pendingCountRef.current += 1
    setIsLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    pendingCountRef.current = Math.max(0, pendingCountRef.current - 1)
    if (pendingCountRef.current === 0) {
      setIsLoading(false)
    }
  }, [])

  const runWithLoading = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T> => {
      startLoading()
      try {
        return await operation()
      } finally {
        stopLoading()
      }
    },
    [startLoading, stopLoading],
  )

  const value = useMemo(
    () => ({ isLoading, startLoading, stopLoading, runWithLoading }),
    [isLoading, startLoading, stopLoading, runWithLoading],
  )

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
}

export function useGlobalLoading(): LoadingContextValue {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useGlobalLoading must be used within LoadingProvider')
  }
  return context
}
