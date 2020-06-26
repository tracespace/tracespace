// reusable utility hooks
import {useEffect, useRef} from 'react'

export function useTimeout(handler: () => unknown, delay: number | null): void {
  const handlerRef = useRef<() => unknown>()

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const trigger = (): unknown => handlerRef.current && handlerRef.current()

    if (delay !== null) {
      const timeout = window.setTimeout(trigger, delay)
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
