/**
 * App bootstrap — load runtime config and MSW before rendering.
 */

import { startMockServiceWorker } from '@/shared/api/mocks/browser'
import { applyRuntimeConfig, loadRuntimeConfig } from '@/shared/config/runtime-config'

export async function bootstrap(): Promise<void> {
  const runtime = await loadRuntimeConfig()
  if (runtime) {
    applyRuntimeConfig(runtime)
  }

  await startMockServiceWorker()
}
