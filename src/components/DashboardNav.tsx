'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { useAuth } from '@/lib/hooks/useAuth'
import NavDrawer from './NavDrawer'
import {
  HomeIcon,
  ArrowUpTrayIcon,
  TableCellsIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

export default function DashboardNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Upload', href: '/dashboard/upload', icon: ArrowUpTrayIcon },
    { name: 'Readings', href: '/dashboard/readings', icon: TableCellsIcon },
    { name: 'Statistics', href: '/dashboard/statistics', icon: ChartBarIcon },
  ]

  const handleLogout = async () => {
    await logout()
  }

  const getUserInitial = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  return (
    <>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">Meter Reader</span>
              </div>
              <div className="ml-6 flex space-x-4 sm:ml-24 sm:space-x-8">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-2 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5 sm:hidden" />
                      <span className="hidden sm:inline">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                aria-label="Open user menu"
              >
                {getUserInitial()}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <NavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onLogout={handleLogout}
      />
    </>
  )
}
