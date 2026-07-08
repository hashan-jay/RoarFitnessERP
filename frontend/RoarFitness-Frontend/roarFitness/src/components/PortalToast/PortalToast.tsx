import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Check, X } from 'lucide-react'

const TOAST_DURATION_MS = 3000

type ToastType = 'success' | 'error'

interface PortalToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
}

const PortalToastContext = createContext<PortalToastContextValue | null>(null)

export function PortalToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const show = useCallback(
    (type: ToastType, message: string) => {
      clearTimer()
      setToast({ type, message })
      timerRef.current = setTimeout(() => {
        setToast(null)
        timerRef.current = null
      }, TOAST_DURATION_MS)
    },
    [clearTimer],
  )

  const value = useMemo(
    () => ({
      success: (message: string) => show('success', message),
      error: (message: string) => show('error', message),
    }),
    [show],
  )

  useEffect(() => () => clearTimer(), [clearTimer])

  return (
    <PortalToastContext.Provider value={value}>
      {children}
      {toast && (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4"
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          <div
            className={`portal-widget-3d flex max-w-md items-center gap-3 rounded-xl border bg-white/95 px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm ${
              toast.type === 'error'
                ? 'border-rose-200 text-rose-600'
                : 'border-emerald-200 text-emerald-700'
            }`}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              aria-hidden="true"
            >
              {toast.type === 'error' ? (
                <X className="size-3.5 stroke-[3] text-white" />
              ) : (
                <Check className="size-3.5 stroke-[3] text-white" />
              )}
            </span>
            <span className="text-left leading-snug">{toast.message}</span>
          </div>
        </div>
      )}
    </PortalToastContext.Provider>
  )
}

export function usePortalToast() {
  const context = useContext(PortalToastContext)
  if (!context) {
    throw new Error('usePortalToast must be used within PortalToastProvider')
  }
  return context
}
