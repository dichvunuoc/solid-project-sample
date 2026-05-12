/**
 * Media Query Hook
 *
 * Tracks whether a media query matches the current viewport.
 * Useful for responsive design and conditional rendering.
 *
 * FSD Rule: This is in the Shared layer, accessible to all layers.
 */

import { useEffect, useState } from 'react'

/**
 * Track if a media query matches
 * @param query - Media query string
 * @returns Boolean indicating if the media query matches
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)')
 *
 * return (
 *   <div>
 *     {isMobile ? <MobileNav /> : <DesktopNav />}
 *   </div>
 * )
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    // Return early if not in browser
    if (typeof window === 'undefined') {
      return
    }

    const mediaQueryList = window.matchMedia(query)

    // Update state if it doesn't match
    if (mediaQueryList.matches !== matches) {
      setMatches(mediaQueryList.matches)
    }

    // Event listener callback
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add event listener
    // Use addEventListener for modern browsers, addListener for older ones
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener)
    } else {
      // Legacy API for older browsers
      ;(
        mediaQueryList as MediaQueryList & {
          addListener: (listener: (event: MediaQueryListEvent) => void) => void
        }
      ).addListener(listener)
    }

    // Cleanup
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', listener)
      } else {
        // Legacy API for older browsers
        ;(
          mediaQueryList as MediaQueryList & {
            removeListener: (listener: (event: MediaQueryListEvent) => void) => void
          }
        ).removeListener(listener)
      }
    }
  }, [query, matches])

  return matches
}

/**
 * Convenience hook for mobile devices (max-width: 768px)
 * @returns Boolean indicating if viewport is mobile size
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)')
}

/**
 * Convenience hook for tablet devices (max-width: 1024px)
 * @returns Boolean indicating if viewport is tablet size or smaller
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(max-width: 1024px)')
}

/**
 * Convenience hook for desktop devices (min-width: 1025px)
 * @returns Boolean indicating if viewport is desktop size
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)')
}

/**
 * Hook to get the current breakpoint
 * @returns Current breakpoint name
 */
export function useBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  if (isMobile) return 'mobile'
  if (isTablet) return 'tablet'
  return 'desktop'
}

/**
 * Hook to detect if user prefers reduced motion
 * @returns Boolean indicating if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/**
 * Hook to detect if user prefers dark color scheme
 * @returns Boolean indicating if user prefers dark mode
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)')
}
