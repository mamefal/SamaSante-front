/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Create axios instance with optimized settings
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('amina:token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // AUTHENTICATION DISABLED FOR DEVELOPMENT
    // Uncomment to re-enable automatic redirect to login on 401
    if (error.response?.status === 401) {
      // Dispatch custom event for client-side redirect
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'))
      }
    }
    return Promise.reject(error)
  }
)

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds

export const api = {
  get: async (url: string, useCache = true) => {
    // Check cache first
    if (useCache && cache.has(url)) {
      const cached = cache.get(url)!
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data
      }
    }

    const response = await axiosInstance.get(url)

    // Store in cache
    if (useCache) {
      cache.set(url, { data: response, timestamp: Date.now() })
    }

    return response
  },

  post: async (url: string, data: any) => {
    // Clear related cache entries on POST
    cache.clear()
    return axiosInstance.post(url, data)
  },

  put: async (url: string, data: any) => {
    // Clear related cache entries on PUT
    cache.clear()
    return axiosInstance.put(url, data)
  },

  patch: async (url: string, data?: any) => {
    // Clear related cache entries on PATCH
    cache.clear()
    return axiosInstance.patch(url, data)
  },

  delete: async (url: string) => {
    // Clear related cache entries on DELETE
    cache.clear()
    return axiosInstance.delete(url)
  },

  // Clear cache manually
  clearCache: () => {
    cache.clear()
  }
}
