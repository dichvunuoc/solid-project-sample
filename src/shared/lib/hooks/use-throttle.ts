/**
 * Throttle Hook
 *
 * Limits the rate at which a function can be called.
 * Useful for scroll handlers, resize handlers, and rate-limiting API calls.
 *
 * FSD Rule: This is in the Shared layer, accessible to all layers.
 */

import { useRef, useCallback } from 'react'

/**
 * Throttle a callback function
 * @param callback - Function to throttle
 * @param delay - Minimum time between calls in milliseconds (default: 500)
 * @returns Throttled function
 *
 * @example
 * ```tsx
 * const handleScroll = useThrottle((event: Event) => {
 *   console.log('Scrolled!', window.scrollY)
 * }, 200)
 *
 * useEffect(() => {
 *   window.addEventListener('scroll', handleScroll)
 *   return () => window.removeEventListener('scroll', handleScroll)
 * }, [handleScroll])
 * ```
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 500
): T {
  const lastRan = useRef<number>(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const timeSinceLastRan = now - lastRan.current

      // If enough time has passed, execute immediately
      if (timeSinceLastRan >= delay) {
        callback(...args)
        lastRan.current = now
      } else {
        // Otherwise, schedule execution after the remaining delay
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args)
          lastRan.current = Date.now()
        }, delay - timeSinceLastRan)
      }
    },
    [callback, delay]
  ) as T
}
