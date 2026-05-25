import { describe, expect, it, vi, beforeEach } from 'vitest'
import { httpClient } from '@/shared/api/http-client'
import { fetchSampleItems } from './queries'

vi.mock('@/shared/api/http-client', () => ({
  httpClient: {
    get: vi.fn(),
  },
}))

describe('fetchSampleItems', () => {
  beforeEach(() => {
    vi.mocked(httpClient.get).mockReset()
  })

  it('calls the sample-items endpoint', async () => {
    const payload = {
      items: [{ id: '1', title: 'Alpha', status: 'active' as const, updatedAt: '2026-01-01' }],
      total: 1,
    }
    vi.mocked(httpClient.get).mockResolvedValue(payload)

    const result = await fetchSampleItems()

    expect(httpClient.get).toHaveBeenCalledWith('/sample-items')
    expect(result).toEqual(payload)
  })
})
