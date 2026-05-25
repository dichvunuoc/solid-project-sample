/**
 * HTTP Client Wrapper
 *
 * Centralized HTTP client with interceptors, error handling, and retry logic.
 * FSD Rule: This is in the Shared layer, accessible to all layers.
 *
 * - keycloak / mock: Bearer token via Authorization header
 * - backend-session: cookie session (credentials: 'include'), no Bearer
 */

import { isBackendSessionMode, usesBearerAuth } from '@/shared/config/auth-mode'
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
  /** When undefined, resolves `env.VITE_API_URL` on each request (runtime config). */
  private baseURLOverride: string | undefined
  private defaultHeaders: Record<string, string>
  private timeout: number

  constructor(config: HttpClientConfig = {}) {
    this.baseURLOverride = config.baseURL
    this.timeout = config.timeout || env.VITE_API_TIMEOUT
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    }
  }

  private fetchCredentials(): RequestCredentials {
    return isBackendSessionMode() ? 'include' : 'same-origin'
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        errorMessage = response.statusText || errorMessage
      }

      throw new Error(errorMessage)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T
    }

    return response.json()
  }

  private resolveBaseURL(): string {
    return this.baseURLOverride ?? env.VITE_API_URL
  }

  private async request<T>(url: string, config: RequestConfig = {}): Promise<T> {
    const { skipErrorToast = false, skipAuth = false, headers = {}, ...fetchConfig } = config

    const fullUrl = url.startsWith('http') ? url : `${this.resolveBaseURL()}${url}`

    const send = async (): Promise<Response> => {
      const requestHeaders: HeadersInit = {
        ...this.defaultHeaders,
        ...(headers as Record<string, string>),
      }

      if (!skipAuth && usesBearerAuth()) {
        const token = await getAuthToken()
        if (token && token !== 'session-cookie') {
          requestHeaders['Authorization'] = `Bearer ${token}`
        }
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      try {
        const response = await fetch(fullUrl, {
          ...fetchConfig,
          headers: requestHeaders,
          credentials: this.fetchCredentials(),
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
        if (isBackendSessionMode()) {
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
          }
          throw new Error('Session expired. Please sign in again.')
        }

        const refreshed = await authClient.updateToken(30)
        if (refreshed) {
          response = await send()
        } else {
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

/** Default client — points at gateway or primary microservice (`VITE_API_URL`). */
export const httpClient = new HttpClient({
  baseURL: env.VITE_API_URL,
})

/**
 * Factory for additional bounded-context clients (multi-microservice FE).
 *
 * @example
 * export const catalogClient = createHttpClient({ baseURL: env.VITE_CATALOG_API_URL })
 */
export function createHttpClient(config: HttpClientConfig = {}): HttpClient {
  return new HttpClient(config)
}

/** Optional secondary service client when `VITE_SECONDARY_API_URL` is set. */
export const secondaryHttpClient = env.VITE_SECONDARY_API_URL
  ? createHttpClient({ baseURL: env.VITE_SECONDARY_API_URL })
  : null
