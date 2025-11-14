'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface MeterReading {
  id: string
  user_id: string
  meter_id: string
  meter_type: string
  reading_value: number
  unit: string
  confidence: string
  confidence_score: number
  processing_time_ms: number
  image_size_bytes: number
  created_at: string
  updated_at: string
}

export default function StatisticsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [readingsByMeter, setReadingsByMeter] = useState<Record<string, MeterReading[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      // Step 1: Fetch all unique meter IDs from latest_meter_readings view
      const { data: latestReadings, error: latestError } = await supabase
        .from('latest_meter_readings')
        .select('meter_id')

      if (latestError) throw latestError

      // Extract unique meter IDs
      const uniqueMeterIds = [...new Set((latestReadings || []).map(r => r.meter_id))]

      if (uniqueMeterIds.length === 0) {
        setReadingsByMeter({})
        return
      }

      // Step 2: Fetch latest 100 readings for each meter in parallel
      const fetchPromises = uniqueMeterIds.map(async (meterId) => {
        const { data, error } = await supabase
          .from('meter_readings')
          .select('*')
          .eq('meter_id', meterId)
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) {
          console.error(`Error fetching readings for meter ${meterId}:`, error)
          return { meterId, readings: [] }
        }

        // Reverse to get chronological order (oldest to newest)
        return { meterId, readings: (data || []).reverse() }
      })

      // Step 3: Wait for all fetches to complete
      const results = await Promise.all(fetchPromises)

      // Group readings by meter_id
      const groupedReadings: Record<string, MeterReading[]> = {}
      results.forEach(({ meterId, readings }) => {
        if (readings.length > 0) {
          groupedReadings[meterId] = readings
        }
      })

      setReadingsByMeter(groupedReadings)
    } catch (err) {
      setError('Failed to load statistics')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Prepare chart data for a specific meter showing consumption differences
  const prepareTimeSeriesDataForMeter = (meterId: string, readings: MeterReading[]) => {
    const sortedReadings = [...readings].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    // Calculate differences between consecutive readings
    const differences: number[] = []
    const labels: string[] = []

    for (let i = 1; i < sortedReadings.length; i++) {
      const currentReading = sortedReadings[i]
      const previousReading = sortedReadings[i - 1]
      const difference = currentReading.reading_value - previousReading.reading_value

      differences.push(difference)
      labels.push(
        new Date(currentReading.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      )
    }

    return {
      labels,
      datasets: [{
        label: `Consumption - ${meterId} (${readings[0]?.unit || ''})`,
        data: differences,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      }]
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading Statistics..." className="py-7" />
  }

  const meterIds = Object.keys(readingsByMeter)
  const hasData = meterIds.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
        <p className="mt-2 text-gray-600">
          Visualize and analyze your meter reading data
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-16">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {!hasData ? (
        <div className="text-center bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
          <p className="mt-4 text-sm text-gray-500">Upload some meter readings to see statistics.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {meterIds.map((meterId) => {
            const readings = readingsByMeter[meterId]
            const timeSeriesData = prepareTimeSeriesDataForMeter(meterId, readings)
            const meterType = readings[0]?.meter_type || 'Unknown'
            const totalReadings = readings.length
            const avgConfidence = (readings.reduce((sum, r) => sum + r.confidence_score, 0) / readings.length).toFixed(1)

            // Calculate total consumption (difference between first and last reading)
            const sortedReadings = [...readings].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
            const totalConsumption = sortedReadings.length > 1
              ? (sortedReadings[sortedReadings.length - 1].reading_value - sortedReadings[0].reading_value).toFixed(2)
              : '0'

            return (
              <div key={meterId} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Meter: {meterId}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="px-3 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {meterType}
                      </span>
                      <span>{totalReadings} readings</span>
                      <span>Total Consumption: {totalConsumption} {readings[0]?.unit}</span>
                      <span>Avg. Confidence: {avgConfidence}%</span>
                    </div>
                  </div>
                </div>
                <div className="h-96">
                  <Line
                    data={timeSeriesData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: `Consumption (${readings[0]?.unit || 'Value'})`
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Reading Date'
                          }
                        }
                      },
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
