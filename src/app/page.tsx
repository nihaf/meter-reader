'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import LoadingSpinner from '@/components/LoadingSpinner'
import { CameraIcon, ChartBarIcon, MagnifyingGlassIcon  } from '@heroicons/react/24/outline'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center space-y-8 max-w-3xl">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            Meter Reader Application
          </h1>
          <p className="text-xl text-gray-600">
            AI-powered utility meter reading system using Claude Vision
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-6 py-4 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Account
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <CameraIcon className="h-32 w-32 text-blue-600 mb-8" />
            <h3 className="text-lg font-semibold text-gray-900 mb-8">Upload Images</h3>
            <p className="text-gray-600">Capture and upload meter photos directly from your device</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm">
            <MagnifyingGlassIcon className="h-32 w-32 text-blue-600 mb-8" />
            <h3 className="text-lg font-semibold text-gray-900 mb-8">AI Analysis</h3>
            <p className="text-gray-600">Claude Vision extracts meter readings automatically</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm">
            <ChartBarIcon className="h-32 w-32 text-blue-600 mb-8" />
            <h3 className="text-lg font-semibold text-gray-900 mb-8">Track & Analyze</h3>
            <p className="text-gray-600">View history and analyze consumption patterns</p>
          </div>
        </div>
      </div>
    </main>
  )
}
