'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { analyzeMeterImage } from '@/lib/actions/claude'

interface MeterReading {
  meter_id: string
  meter_type: 'electricity' | 'water' | 'gas' | 'unknown'
  reading_value: number
  unit: string
  confidence: 'high' | 'medium' | 'low'
  confidence_score: number
}

export default function UploadPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [extractedData, setExtractedData] = useState<MeterReading | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state for user corrections
  const [meterId, setMeterId] = useState('')
  const [meterType, setMeterType] = useState<'electricity' | 'water' | 'gas' | 'unknown'>('unknown')
  const [readingValue, setReadingValue] = useState<string>('')
  const [unit, setUnit] = useState('unknown')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setExtractedData(null)
      setSuccess(false)
      setError(null)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a file')
      return
    }

    setAnalyzing(true)
    setError(null)
    setExtractedData(null)

    try {
      // Convert file to Base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const base64Result = reader.result as string
          const base64Data = base64Result.split(',')[1] // Remove data:image/...;base64, prefix

          // Determine MIME type
          const mimeType = selectedFile.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

          // Call Server Action
          const result = await analyzeMeterImage(base64Data, mimeType)

          if (result.success && result.data) {
            setExtractedData(result.data)
            // Populate form fields
            setMeterId(result.data.meter_id)
            setMeterType(result.data.meter_type)
            setReadingValue(String(result.data.reading_value))
            setUnit(result.data.unit)
          } else {
            setError(result.error || 'Analysis failed')
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unexpected error occurred')
        } finally {
          setAnalyzing(false)
        }
      }
      reader.readAsDataURL(selectedFile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setAnalyzing(false)
    }
  }

  const handleAcceptAndSave = async () => {
    if (!user || !extractedData) return

    setSaving(true)
    setError(null)

    try {
      // Insert directly to Supabase
      const { error: insertError } = await supabase
        .from('meter_readings')
        .insert([
          {
            user_id: user.id,
            meter_id: meterId,
            meter_type: meterType,
            reading_value: parseFloat(readingValue),
            unit: unit,
            confidence: extractedData.confidence,
            confidence_score: extractedData.confidence_score,
            processing_time_ms: 0, // Not tracked in this flow
            image_size_bytes: selectedFile?.size || 0,
            created_at: new Date().toISOString(),
          },
        ])
        .select()

      if (insertError) throw insertError

      setSuccess(true)

      // Reset form after successful save
      setTimeout(() => {
        setSelectedFile(null)
        setPreview(null)
        setExtractedData(null)
        setSuccess(false)
        setMeterId('')
        setMeterType('unknown')
        setReadingValue('')
        setUnit('unknown')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save reading')
    } finally {
      setSaving(false)
    }
  }

  const getConfidenceColor = (confidence: string) => {
    if (confidence === 'high') return 'text-green-600 bg-green-100'
    if (confidence === 'medium') return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
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
                <div className="relative max-w-2xl mx-auto">
                  <img
                    src={preview}
                    alt="Meter preview"
                    className="max-h-96 rounded-lg border border-gray-300 mx-auto object-contain"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null)
                      setPreview(null)
                      setExtractedData(null)
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

            {/* Analyze Button */}
            {preview && !extractedData && (
              <div className="flex justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="inline-flex justify-center py-8 px-16 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <>
                      <svg className="animate-spin -ml-8 mr-16 h-24 w-24 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Image'
                  )}
                </button>
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
            {success && (
              <div className="rounded-md bg-green-50 p-16">
                <div className="flex">
                  <svg className="h-20 w-20 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-16">
                    <h3 className="text-sm font-medium text-green-800">Reading saved successfully!</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Correction Form */}
            {extractedData && !success && (
              <div className="border-t border-gray-200 pt-24">
                <div className="mb-16">
                  <h3 className="text-lg font-medium text-gray-900">Review & Correct Extracted Data</h3>
                  <p className="text-sm text-gray-500 mt-4">Please review the extracted values and make corrections if needed.</p>
                  <div className="mt-8">
                    <span className={`px-8 py-4 inline-flex text-xs leading-5 font-semibold rounded-full ${getConfidenceColor(extractedData.confidence)}`}>
                      Confidence: {extractedData.confidence} ({Math.round(extractedData.confidence_score * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="space-y-16">
                  {/* Meter ID */}
                  <div>
                    <label htmlFor="meter_id" className="block text-sm font-medium text-gray-700">
                      Meter ID
                    </label>
                    <input
                      type="text"
                      id="meter_id"
                      value={meterId}
                      onChange={(e) => setMeterId(e.target.value)}
                      className="mt-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-12 py-8 border"
                      placeholder="Enter meter ID or serial number"
                    />
                  </div>

                  {/* Meter Type */}
                  <div>
                    <label htmlFor="meter_type" className="block text-sm font-medium text-gray-700">
                      Meter Type
                    </label>
                    <select
                      id="meter_type"
                      value={meterType}
                      onChange={(e) => setMeterType(e.target.value as any)}
                      className="mt-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-12 py-8 border"
                    >
                      <option value="electricity">Electricity</option>
                      <option value="water">Water</option>
                      <option value="gas">Gas</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>

                  {/* Reading Value */}
                  <div>
                    <label htmlFor="reading_value" className="block text-sm font-medium text-gray-700">
                      Reading Value
                    </label>
                    <input
                      id="reading_value"
                      value={readingValue}
                      onChange={(e) => setReadingValue(e.target.value)}
                      className="mt-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-12 py-8 border"
                      placeholder="Enter reading value"
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                      Unit
                    </label>
                    <select
                      id="unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="mt-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-12 py-8 border"
                    >
                      <option value="kWh">kWh</option>
                      <option value="m3">m³</option>
                      <option value="l">L</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                </div>

                {/* Accept & Save Button */}
                <div className="mt-24 flex justify-end gap-12">
                  <button
                    onClick={() => {
                      setExtractedData(null)
                      setMeterId('')
                      setMeterType('unknown')
                      setReadingValue('')
                      setUnit('unknown')
                    }}
                    className="inline-flex justify-center py-8 px-16 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAcceptAndSave}
                    disabled={saving || !readingValue}
                    className="inline-flex justify-center py-8 px-16 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-8 mr-16 h-24 w-24 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Accept & Save'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
