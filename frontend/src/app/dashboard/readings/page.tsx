'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

interface MeterReading {
  id: number
  meter_id: string
  meter_type: string
  reading_value: number
  unit: string
  reading_date: string
  confidence_score: number
  image_url: string
  created_at: string
}

export default function ReadingsPage() {
  const [readings, setReadings] = useState<MeterReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    fetchReadings()
  }, [])

  const fetchReadings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const response = await axios.get<{ readings: MeterReading[] }>(`${apiUrl}/api/readings`)
      setReadings(response.data.readings)
    } catch (err) {
      setError('Failed to load readings')
      console.error('Error fetching readings:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100'
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-88">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-16 text-gray-600">Loading readings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meter Readings</h1>
          <p className="mt-8 text-gray-600">
            View all recorded meter readings
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {readings.length} readings
        </div>
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-8 text-sm font-medium text-gray-900">No readings yet</h3>
          <p className="mt-4 text-sm text-gray-500">Get started by uploading your first meter reading.</p>
          <div className="mt-24">
            <a
              href="/dashboard/upload"
              className="inline-flex items-center px-16 py-8 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Upload Reading
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-24 py-16 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meter ID
                  </th>
                  <th scope="col" className="px-24 py-16 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-24 py-16 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reading
                  </th>
                  <th scope="col" className="px-24 py-16 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th scope="col" className="px-24 py-16 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-24 py-16 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {readings.map((reading) => (
                  <tr key={reading.id} className="hover:bg-gray-50">
                    <td className="px-24 py-16 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reading.meter_id}
                    </td>
                    <td className="px-24 py-16 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-8 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {reading.meter_type}
                      </span>
                    </td>
                    <td className="px-24 py-16 whitespace-nowrap text-sm text-gray-900">
                      {reading.reading_value} {reading.unit}
                    </td>
                    <td className="px-24 py-16 whitespace-nowrap text-sm">
                      <span className={`px-8 py-8 inline-flex text-xs leading-5 font-semibold rounded-full ${getConfidenceColor(reading.confidence_score)}`}>
                        {reading.confidence_score}%
                      </span>
                    </td>
                    <td className="px-24 py-16 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(reading.reading_date)}
                    </td>
                    <td className="px-24 py-16 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setSelectedImage(reading.image_url)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-16"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-8 -right-8 bg-white rounded-full p-8 shadow-lg hover:bg-gray-100"
            >
              <svg className="h-24 w-24 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage}
              alt="Meter reading"
              className="max-w-full max-h-screen rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
