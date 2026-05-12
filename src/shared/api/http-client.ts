/**
 * HTTP Client Wrapper
 *
 * Centralized HTTP client with interceptors, error handling, and retry logic.
 * FSD Rule: This is in the Shared layer, accessible to all layers.
 */

import { env } from '@/shared/config/env'
import { getAuthToken } from '@/shared/lib/auth-token'
import { authClient } from '@/shared/lib/client-auth'
import { toast } from '@/shared/lib/toast'

export interface HttpClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}

export interface RequestConfig extends RequestInit {
  skipErrorToast?: boolean
  skipAuth?: boolean
}

class HttpClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private timeout: number

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = config.baseURL || ''
    this.timeout = config.timeout || 30000
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage
      }

      throw new Error(errorMessage)
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T
    }

    return response.json()
  }

  private async request<T>(url: string, config: RequestConfig = {}): Promise<T> {
    const { skipErrorToast = false, skipAuth = false, headers = {}, ...fetchConfig } = config

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`

    const send = async (): Promise<Response> => {
      const requestHeaders: HeadersInit = {
        ...this.defaultHeaders,
        ...(headers as Record<string, string>),
      }

      if (!skipAuth) {
        const token = await getAuthToken()
        if (token) {
          requestHeaders['Authorization'] = `Bearer ${token}`
        }
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      try {
        const response = await fetch(fullUrl, {
          ...fetchConfig,
          headers: requestHeaders,
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
        return response
      } catch (e) {
        clearTimeout(timeoutId)
        throw e
      }
    }

    try {
      let response = await send()

      if (response.status === 401 && !skipAuth) {
        const refreshed = await authClient.updateToken(30)
        if (refreshed) {
          response = await send()
        } else {
          // Token refresh failed — redirect to login
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
          }
          throw new Error('Session expired. Please sign in again.')
        }
      }

      return await this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError = new Error('Request timeout')
          if (!skipErrorToast) {
            toast.error('Request timeout', 'The request took too long to complete')
          }
          throw timeoutError
        }

        if (!skipErrorToast) {
          toast.error('Request failed', error.message || 'An unexpected error occurred')
        }
      }

      throw error
    }
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' })
  }

  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' })
  }
}

// Create and export a singleton instance
export const httpClient = new HttpClient({
  baseURL: env.VITE_API_URL,
  timeout: 30000,
})
