'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { useAuth } from '@/lib/hooks/useAuth'

export default function DashboardNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Upload', href: '/dashboard/upload' },
    { name: 'Readings', href: '/dashboard/readings' },
    { name: 'Statistics', href: '/dashboard/statistics' },
  ]

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-16 sm:px-24 lg:px-32">
        <div className="flex justify-between h-64">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">Meter Reader</span>
            </div>
            <div className="hidden sm:ml-24 sm:flex sm:space-x-32">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-8 pt-4 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-16">
            <span className="text-sm text-gray-700">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-16 py-8 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
