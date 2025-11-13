import axios, { AxiosInstance } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

/**
 * Creates an authenticated axios instance with the provided token
 */
export function createApiClient(token: string | null): AxiosInstance {
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  return client
}

/**
 * Hook-compatible API client creator
 * Use this within components that have access to useAuth
 */
export function useApiClient() {
  // This will be imported from the AuthContext
  return {
    createClient: (token: string | null) => createApiClient(token),
  }
}
