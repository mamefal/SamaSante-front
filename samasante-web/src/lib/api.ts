/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'

// Utilise le proxy Next.js (/api → http://localhost:3000/api)
const API_URL = '/api'

// Create axios instance with optimized settings
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
})

// No need for Authorization header interceptor - using HttpOnly cookies instead
// The cookie is sent automatically with each request

// Response interceptor for handling 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - session expired or invalid token
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear user data
        localStorage.removeItem('amina:user')
        localStorage.removeItem('amina:token') // Legacy cleanup

        // Only redirect if not already on login page
        const currentPath = window.location.pathname
        if (currentPath !== '/auth/login' && currentPath !== '/auth/signup') {
          // Emit event for AuthProvider to handle
          window.dispatchEvent(new Event('auth:unauthorized'))

          // Redirect to login with error message
          const errorParam = error.response?.data?.message ?
            `?error=${encodeURIComponent(error.response.data.message)}` :
            '?error=session_expired'
          window.location.href = '/auth/login' + errorParam
        }
      }
    }
    return Promise.reject(error)
  }
)

export const api = {
  get: async (url: string, useCache = true) => {
    // Cache removed in favor of SWR/React Query to avoid memory leaks
    return axiosInstance.get(url)
  },

  post: async (url: string, data: any, config?: any) => {
    return axiosInstance.post(url, data, config)
  },

  put: async (url: string, data: any, config?: any) => {
    return axiosInstance.put(url, data, config)
  },

  patch: async (url: string, data?: any, config?: any) => {
    return axiosInstance.patch(url, data, config)
  },

  delete: async (url: string) => {
    return axiosInstance.delete(url)
  },

  // Clear cache manually (noop)
  clearCache: () => {
    // noop
  }
}
