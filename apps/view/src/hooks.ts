// reusable utility hooks
import {useEffect, useRef} from 'react'

export function useTimeout(handler: () => unknown, delay: number | null): void {
  useEffect(() => {
    if (delay !== null) {
      const timeout = window.setTimeout(handler, delay)
      return () => window.clearTimeout(timeout)
    }
  }, [delay])
}

export function usePrevious<Value>(value: Value): Value | null {
  const valueRef = useRef<Value | null>(null)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  return valueRef.current
}

export function useWindowListener<Event extends keyof WindowEventMap>(
  event: Event,
  handler: (event: WindowEventMap[Event]) => unknown
): void {
  useEffect(() => {
    window.addEventListener(event, handler)
    return () => window.removeEventListener(event, handler)
  })
}

export function useLocation(): Location | null {
  const locationRef = useRef<Location | null>(null)

  useEffect(() => {
    locationRef.current = window.location
  }, [])

  return locationRef.current
}
