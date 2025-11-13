'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface MeterReading {
  id: number
  meter_id: string
  meter_type: string
  reading_value: number
  unit: string
  reading_date: string
  confidence_score: number
}

interface Statistics {
  total_readings: number
  meters_count: number
  avg_confidence: number
  meters_by_type: Record<string, number>
}

export default function StatisticsPage() {
  const [readings, setReadings] = useState<MeterReading[]>([])
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const [readingsRes, statsRes] = await Promise.all([
        axios.get<{ readings: MeterReading[] }>(`${apiUrl}/api/readings`),
        axios.get<Statistics>(`${apiUrl}/api/stats`),
      ])
      setReadings(readingsRes.data.readings)
      setStats(statsRes.data)
    } catch (err) {
      setError('Failed to load statistics')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Prepare chart data
  const prepareTimeSeriesData = () => {
    const sortedReadings = [...readings].sort(
      (a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime()
    )

    const labels = sortedReadings.map((r) =>
      new Date(r.reading_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    )

    const datasets = Object.entries(
      sortedReadings.reduce((acc, reading) => {
        if (!acc[reading.meter_id]) {
          acc[reading.meter_id] = []
        }
        acc[reading.meter_id].push(reading.reading_value)
        return acc
      }, {} as Record<string, number[]>)
    ).map(([meterId, values], index) => ({
      label: meterId,
      data: values,
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.1)`,
      tension: 0.3,
    }))

    return { labels, datasets }
  }

  const prepareMeterTypeData = () => {
    if (!stats?.meters_by_type) return null

    return {
      labels: Object.keys(stats.meters_by_type).map((type) => type.charAt(0).toUpperCase() + type.slice(1)),
      datasets: [
        {
          label: 'Readings by Meter Type',
          data: Object.values(stats.meters_by_type),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(139, 92, 246, 1)',
          ],
          borderWidth: 1,
        },
      ],
    }
  }

  const prepareConfidenceData = () => {
    const confidenceRanges = {
      '90-100%': 0,
      '70-89%': 0,
      '50-69%': 0,
      'Below 50%': 0,
    }

    readings.forEach((reading) => {
      if (reading.confidence_score >= 90) confidenceRanges['90-100%']++
      else if (reading.confidence_score >= 70) confidenceRanges['70-89%']++
      else if (reading.confidence_score >= 50) confidenceRanges['50-69%']++
      else confidenceRanges['Below 50%']++
    })

    return {
      labels: Object.keys(confidenceRanges),
      datasets: [
        {
          label: 'Confidence Score Distribution',
          data: Object.values(confidenceRanges),
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(107, 114, 128, 0.8)',
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(107, 114, 128, 1)',
          ],
          borderWidth: 1,
        },
      ],
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

  const timeSeriesData = prepareTimeSeriesData()
  const meterTypeData = prepareMeterTypeData()
  const confidenceData = prepareConfidenceData()

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

      {readings.length === 0 ? (
        <div className="text-center py-88 bg-white rounded-lg shadow">
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
        <>
          {/* Reading Trends Over Time */}
          <div className="bg-white p-24 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-16">Reading Trends Over Time</h2>
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
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            {/* Meter Types Distribution */}
            {meterTypeData && (
              <div className="bg-white p-24 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-16">Meter Types Distribution</h2>
                <div className="h-80 flex items-center justify-center">
                  <Pie
                    data={meterTypeData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Confidence Score Distribution */}
            <div className="bg-white p-24 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-16">Confidence Score Distribution</h2>
              <div className="h-80">
                <Bar
                  data={confidenceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
