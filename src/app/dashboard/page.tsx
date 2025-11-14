'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

interface Statistics {
  total_readings: number
  meters_count: number
  avg_confidence: number
  meters_by_type: Record<string, number>
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100'
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error: queryError } = await supabase
          .from('meter_statistics')
          .select('*')
          .single()

        if (queryError) throw queryError

        setStats(data as Statistics)
      } catch (err) {
        setError('Failed to load statistics')
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-88">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-16 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-24">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-8 text-gray-600">
          Welcome back, {user?.user_metadata?.full_name || user?.email}
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-16">
          <div className="flex">
            <div className="ml-16">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-24 w-24 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="ml-16 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Readings</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.total_readings}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-24 w-24 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                </div>
                <div className="ml-16 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Meters Count</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.meters_count}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-24 w-24 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-16 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Confidence</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.avg_confidence * 100}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-24 w-24 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                </div>
                <div className="ml-16 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Meter Types</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {Object.keys(stats.meters_by_type || {}).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {stats && stats.meters_by_type && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-16 py-16 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Meters by Type</h3>
          </div>
          <div className="px-16 py-16">
            <dl className="grid grid-cols-1 gap-16 sm:grid-cols-3">
              {Object.entries(stats.meters_by_type).map(([type, count]) => (
                <div key={type} className="flex flex-col">
                  <dt className="text-sm font-medium text-gray-500 capitalize">{type}</dt>
                  <dd className="mt-4 text-2xl font-semibold text-gray-900">{count}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}
