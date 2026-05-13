/**
 * Event Registry — Solid edition.
 *
 * Mounts all feature-level event subscriptions once at app root. Each
 * feature exposes a Solid hook (`useXxxChain()`) that wires its listener
 * via `onMount` + `onCleanup`.
 */

import { useRewardChain } from '@/features/process-rewards'

export function EventRegistry() {
  useRewardChain()
  return null
}
