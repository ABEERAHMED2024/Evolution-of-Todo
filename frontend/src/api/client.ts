import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'
import { ApiResponse } from '@/types'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const AGENT_BASE_URL = process.env.NEXT_PUBLIC_AGENT_URL || 'http://localhost:8001'
const REQUEST_TIMEOUT = 30000 // 30 seconds

// Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message)
    this.name = 'TimeoutError'
  }
}

// Request/Response Interceptor Types
interface RequestInterceptor {
  onFulfilled?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>
  onRejected?: (error: any) => any
}

interface ResponseInterceptor {
  onFulfilled?: (response: any) => any
  onRejected?: (error: any) => any
}

// API Client Class
class APIClient {
  private client: AxiosInstance
  private agentClient: AxiosInstance

  constructor() {
    // Main API Client
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    // Agent API Client
    this.agentClient = axios.create({
      baseURL: AGENT_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request Interceptors
    const requestInterceptor: RequestInterceptor = {
      onFulfilled: (config) => {
        // Add timestamp to prevent caching issues
        config.params = {
          ...config.params,
          _t: Date.now(),
        }

        // Add request ID for tracking
        config.headers = {
          ...config.headers,
          'X-Request-ID': this.generateRequestId(),
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          })
        }

        return config
      },
      onRejected: (error) => {
        console.error('Request setup failed:', error)
        return Promise.reject(error)
      },
    }

    // Response Interceptors
    const responseInterceptor: ResponseInterceptor = {
      onFulfilled: (response) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`, response.data)
        }

        return response
      },
      onRejected: (error: AxiosError) => {
        return this.handleError(error)
      },
    }

    // Apply interceptors to both clients
    this.client.interceptors.request.use(
      requestInterceptor.onFulfilled,
      requestInterceptor.onRejected
    )
    this.client.interceptors.response.use(
      responseInterceptor.onFulfilled,
      responseInterceptor.onRejected
    )

    this.agentClient.interceptors.request.use(
      requestInterceptor.onFulfilled,
      requestInterceptor.onRejected
    )
    this.agentClient.interceptors.response.use(
      responseInterceptor.onFulfilled,
      responseInterceptor.onRejected
    )
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private handleError(error: AxiosError): Promise<never> {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', error)
    }

    // Handle different error types
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new TimeoutError('Request timed out. Please check your connection and try again.')
    }

    if (!error.response) {
      throw new NetworkError('Unable to connect to the server. Please check your internet connection.')
    }

    const { status, data } = error.response
    const message = data?.detail || data?.message || error.message || 'An unexpected error occurred'

    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        throw new ApiError('Invalid request. Please check your input and try again.', status, 'BAD_REQUEST', data)
      case 401:
        throw new ApiError('Authentication required. Please log in and try again.', status, 'UNAUTHORIZED', data)
      case 403:
        throw new ApiError('You do not have permission to perform this action.', status, 'FORBIDDEN', data)
      case 404:
        throw new ApiError('The requested resource was not found.', status, 'NOT_FOUND', data)
      case 409:
        throw new ApiError('A conflict occurred. The resource may have been modified.', status, 'CONFLICT', data)
      case 422:
        throw new ApiError('Invalid data provided. Please check your input.', status, 'VALIDATION_ERROR', data)
      case 429:
        throw new ApiError('Too many requests. Please wait a moment and try again.', status, 'RATE_LIMITED', data)
      case 500:
        throw new ApiError('Internal server error. Please try again later.', status, 'SERVER_ERROR', data)
      case 502:
        throw new ApiError('Service temporarily unavailable. Please try again later.', status, 'BAD_GATEWAY', data)
      case 503:
        throw new ApiError('Service unavailable. Please try again later.', status, 'SERVICE_UNAVAILABLE', data)
      default:
        throw new ApiError(message, status, 'UNKNOWN_ERROR', data)
    }
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig, useAgent = false): Promise<T> {
    try {
      const client = useAgent ? this.agentClient : this.client
      const response = await client.request<T>(config)
      return response.data
    } catch (error) {
      // Error is already handled by interceptors
      throw error
    }
  }

  // HTTP Methods
  async get<T>(url: string, config?: AxiosRequestConfig, useAgent = false): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url }, useAgent)
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig, useAgent = false): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data }, useAgent)
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig, useAgent = false): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data }, useAgent)
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig, useAgent = false): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data }, useAgent)
  }

  async delete<T>(url: string, config?: AxiosRequestConfig, useAgent = false): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url }, useAgent)
  }

  // Utility Methods
  getBaseURL(): string {
    return API_BASE_URL
  }

  getAgentURL(): string {
    return AGENT_BASE_URL
  }

  // Health Check Methods
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health')
  }

  async agentHealthCheck(): Promise<{
    status: string
    openai_available: boolean
    local_modules_available: boolean
    backend_url: string
  }> {
    return this.get('/health', undefined, true)
  }

  // Connection Status
  async checkConnection(): Promise<{ backend: boolean; agent: boolean }> {
    const results = await Promise.allSettled([
      this.healthCheck(),
      this.agentHealthCheck(),
    ])

    return {
      backend: results[0].status === 'fulfilled',
      agent: results[1].status === 'fulfilled',
    }
  }

  // Retry mechanism for failed requests
  async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn()
      } catch (error) {
        lastError = error as Error

        // Don't retry on certain errors
        if (error instanceof ApiError && [400, 401, 403, 404, 422].includes(error.status || 0)) {
          throw error
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break
        }

        // Wait before retrying with exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, waitTime))

        console.warn(`Retry attempt ${attempt}/${maxRetries} after ${waitTime}ms`)
      }
    }

    throw lastError!
  }

  // Cancel request functionality
  createCancelToken() {
    return axios.CancelToken.source()
  }

  // File upload helper
  async uploadFile(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    return this.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  }

  // Download file helper
  async downloadFile(url: string, filename: string): Promise<void> {
    try {
      const response = await this.client.get(url, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      throw new ApiError('Failed to download file', 500, 'DOWNLOAD_ERROR')
    }
  }
}

// Create and export singleton instance
export const apiClient = new APIClient()

// Export types
export type { AxiosRequestConfig, AxiosResponse } from 'axios'
export { AxiosError } from 'axios'

// Export utility functions
export const createApiResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
})

export const createErrorResponse = (error: string, code?: string): ApiResponse => ({
  success: false,
  error,
})

// Environment info
export const getApiInfo = () => ({
  apiUrl: API_BASE_URL,
  agentUrl: AGENT_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  environment: process.env.NODE_ENV,
})
