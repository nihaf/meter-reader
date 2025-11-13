'use client'

import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@/lib/hooks/useAuth'

interface UploadResponse {
  success: boolean
  reading?: {
    meter_id: string
    meter_type: string
    reading_value: number
    unit: string
    confidence: string
    confidence_score: number
  }
  error?: string
}

export default function UploadPage() {
  const { user, getAuthToken } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setResult(null)
      setError(null)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const token = getAuthToken()

      const response = await axios.post<UploadResponse>(
        `${apiUrl}/api/meter-reading`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      )

      setResult(response.data)

      if (response.data.success) {
        // Reset form after successful upload
        setTimeout(() => {
          setSelectedFile(null)
          setPreview(null)
          setResult(null)
        }, 5000)
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Upload failed')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-24">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Meter Reading</h1>
        <p className="mt-8 text-gray-600">
          Upload a photo of your utility meter for AI analysis
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-16 py-16">
          <div className="space-y-32">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Meter Image <span className="text-red-500">*</span>
              </label>
              <div className="mt-4">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <div className="flex justify-center p-32 border-2 border-gray-300 border-dashed rounded-xl">
                    <div className="space-y-4 text-center">
                      <svg
                        className="mx-auto h-48 w-48 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <span className="relative rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileSelect}
                          />
                        </span>
                        <p className="pl-4">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">JPG, PNG, GIF or WEBP up to 5MB</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Image Preview */}
            {preview && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-8">
                  Preview
                </label>
                <div className="relative">
                  <img
                    src={preview}
                    alt="Meter preview"
                    className="max-h-96 rounded-lg border border-gray-300 mx-auto"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null)
                      setPreview(null)
                    }}
                    className="absolute top-8 right-8 bg-red-500 text-white rounded-full p-4 hover:bg-red-600"
                  >
                    <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-16">
                <div className="flex">
                  <svg className="h-20 w-20 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-16">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {result && result.success && result.reading && (
              <div className="rounded-md bg-green-50 p-16">
                <div className="flex">
                  <svg className="h-20 w-20 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-16">
                    <h3 className="text-sm font-medium text-green-800">Upload successful!</h3>
                    <div className="mt-8 text-sm text-green-700">
                      <dl className="space-y-4">
                        <div>
                          <dt className="inline font-medium">Reading Value: </dt>
                          <dd className="inline">{result.reading.reading_value} {result.reading.unit}</dd>
                        </div>
                        <div>
                          <dt className="inline font-medium">Meter Type: </dt>
                          <dd className="inline capitalize">{result.reading.meter_type}</dd>
                        </div>
                        <div>
                          <dt className="inline font-medium">Confidence: </dt>
                          <dd className="inline">{result.reading.confidence_score}%</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex justify-end">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                className="inline-flex justify-center py-8 px-16 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-8 mr-16 h-24 w-24 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  'Upload and Analyze'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
