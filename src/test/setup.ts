/**
 * Test Setup
 *
 * Global test configuration and setup for Vitest.
 */

import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { server } from '@/shared/api/mocks/server'

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' })
})

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers()
  cleanup()
})

// Clean up after all tests
afterAll(() => {
  server.close()
})
