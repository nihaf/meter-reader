'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
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
      // Fetch all readings for the user (up to 10000)
      const { data: allReadings, error: readingsError } = await supabase
        .from('meter_readings')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(10000)

      if (readingsError) throw readingsError

      // Group readings by meter_id
      const groupedReadings = (allReadings || []).reduce((acc: Record<string, MeterReading[]>, reading: MeterReading) => {
        if (!acc[reading.meter_id]) {
          acc[reading.meter_id] = []
        }
        acc[reading.meter_id].push(reading)
        return acc
      }, {})

      setReadingsByMeter(groupedReadings)
    } catch (err) {
      setError('Failed to load statistics')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Prepare chart data for a specific meter
  const prepareTimeSeriesDataForMeter = (meterId: string, readings: MeterReading[]) => {
    const sortedReadings = [...readings].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    const labels = sortedReadings.map((r) =>
      new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    )

    const data = sortedReadings.map(r => r.reading_value)

    return {
      labels,
      datasets: [{
        label: `${meterId} (${readings[0]?.unit || ''})`,
        data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      }]
    }
  }

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

  const meterIds = Object.keys(readingsByMeter)
  const hasData = meterIds.length > 0

  return (
    <div className="space-y-24">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
        <p className="mt-8 text-gray-600">
          Visualize and analyze your meter reading data
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

      {!hasData ? (
        <div className="text-center bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-48 w-48 text-gray-400"
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
          <h3 className="mt-8 text-sm font-medium text-gray-900">No data available</h3>
          <p className="mt-4 text-sm text-gray-500">Upload some meter readings to see statistics.</p>
        </div>
      ) : (
        <div className="space-y-24">
          {meterIds.map((meterId) => {
            const readings = readingsByMeter[meterId]
            const timeSeriesData = prepareTimeSeriesDataForMeter(meterId, readings)
            const meterType = readings[0]?.meter_type || 'Unknown'
            const totalReadings = readings.length
            const avgConfidence = (readings.reduce((sum, r) => sum + r.confidence_score, 0) / readings.length).toFixed(1)

            return (
              <div key={meterId} className="bg-white p-24 rounded-lg shadow">
                <div className="flex justify-between items-start mb-16">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Meter: {meterId}
                    </h2>
                    <div className="mt-8 flex gap-16 text-sm text-gray-600">
                      <span className="px-8 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {meterType}
                      </span>
                      <span>{totalReadings} readings</span>
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
                          beginAtZero: false,
                          title: {
                            display: true,
                            text: readings[0]?.unit || 'Value'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Date'
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
