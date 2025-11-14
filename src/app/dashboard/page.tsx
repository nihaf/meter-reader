'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Statistics {
  total_readings: number
  meters_count: number
  avg_confidence: number
  meters_by_type: Record<string, number>
}

interface LatestMeterReading {
  id: string
  user_id: string
  meter_id: string
  meter_type: string
  reading_value: number
  unit: string
  confidence: string
  confidence_score: number
  created_at: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Statistics | null>(null)
  const [latestReadings, setLatestReadings] = useState<LatestMeterReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100'
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getMeterIcon = (meterType: string) => {
    switch (meterType.toLowerCase()) {
      case 'gas':
        return (
          <svg className="h-8 w-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.08-3.61 5.75-2.39 8.9.04.1.08.2.08.33 0 .22-.15.42-.35.5-.23.1-.47.04-.66-.12a.58.58 0 01-.14-.17c-1.13-1.43-1.31-3.48-.55-5.12C5.78 10 4.87 12.3 5 14.47c.06.5.12 1 .29 1.5.14.6.41 1.2.71 1.73 1.08 1.73 2.95 2.97 4.96 3.22 2.14.27 4.43-.12 6.07-1.6 1.83-1.66 2.47-4.32 1.53-6.6l-.13-.26c-.21-.46-.77-1.26-.77-1.26m-3.16 6.3c-.28.24-.74.5-1.1.6-1.12.4-2.24-.16-2.9-.82 1.19-.28 1.9-1.16 2.11-2.05.17-.8-.15-1.46-.28-2.23-.12-.74-.1-1.37.17-2.06.19.38.39.76.63 1.06.77 1 1.98 1.44 2.24 2.8.04.14.06.28.06.43.03.82-.33 1.72-.93 2.27z" />
          </svg>
        )
      case 'electricity':
        return (
          <svg className="h-8 w-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 2v11h3v9l7-12h-4l4-8z" />
          </svg>
        )
      case 'water':
        return (
          <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        )
      default:
        return (
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        )
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch statistics
        const { data: statsData, error: statsError } = await supabase
          .from('meter_statistics')
          .select('*')
          .single()

        if (statsError) throw statsError
        setStats(statsData as Statistics)

        // Fetch latest meter readings (filter out readings older than 1 year)
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

        const { data: readingsData, error: readingsError } = await supabase
          .from('latest_meter_readings')
          .select('*')
          .gte('created_at', oneYearAgo.toISOString())
          .order('created_at', { ascending: false })

        if (readingsError) throw readingsError
        setLatestReadings(readingsData || [])
      } catch (err) {
        setError('Failed to load data')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user, supabase])

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading Readings..." className="py-7" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.user_metadata?.full_name || user?.email}
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Latest Meter Readings Cards */}
      {latestReadings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Meter Readings</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestReadings.map((reading) => (
              <div key={reading.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getMeterIcon(reading.meter_type)}
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate capitalize">
                          {reading.meter_type} Meter
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {reading.reading_value}
                          </div>
                          <div className="ml-2 text-sm text-gray-500">
                            {reading.unit}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs text-gray-500">
                      Meter ID: <span className="font-medium text-gray-700">{reading.meter_id}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {new Date(reading.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getConfidenceColor(reading.confidence_score * 100)}`}>
                        {Math.round(reading.confidence_score * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-gray-400"
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
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-gray-400"
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
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-gray-400"
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
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-gray-400"
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
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Meters by Type</h3>
          </div>
          <div className="p-4">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
