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

// Response interceptor DÉSACTIVÉ temporairement pour tester
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle 401 Unauthorized errors
//     if (error.response?.status === 401) {
//       // Clear auth data
//       if (typeof window !== 'undefined') {
//         localStorage.removeItem('amina:user')
//
//         // Redirect to login with error message
//         const currentPath = window.location.pathname
//         if (currentPath !== '/auth/login') {
//           window.location.href = '/auth/login?error=session_expired'
//         }
//       }
//     }
//     return Promise.reject(error)
//   }
// )

export const api = {
  get: async (url: string, useCache = true) => {
    // Cache removed in favor of SWR/React Query to avoid memory leaks
    return axiosInstance.get(url)
  },

  post: async (url: string, data: any) => {
    return axiosInstance.post(url, data)
  },

  put: async (url: string, data: any) => {
    return axiosInstance.put(url, data)
  },

  patch: async (url: string, data?: any) => {
    return axiosInstance.patch(url, data)
  },

  delete: async (url: string) => {
    return axiosInstance.delete(url)
  },

  // Clear cache manually (noop)
  clearCache: () => {
    // noop
  }
}
