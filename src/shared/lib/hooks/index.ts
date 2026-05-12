/**
 * Shared Hooks Barrel Export
 *
 * Centralized export for all shared hooks.
 * FSD Rule: This is in the Shared layer, accessible to all layers.
 */

export { useDebounce } from './use-debounce'
export { useThrottle } from './use-throttle'
export { useClipboard } from './use-clipboard'
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useBreakpoint,
  usePrefersReducedMotion,
  usePrefersDarkMode,
} from './use-media-query'
export { useToast } from './use-toast'
export {
  usePermission,
  useAnyPermission,
  useAllPermissions,
  useCanAccessRoute,
  useHasRoleLevel,
  useRole,
  usePermissions,
} from './use-permission'
