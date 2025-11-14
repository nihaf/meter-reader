import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardNav from '@/components/DashboardNav'
import { AuthProvider } from '@/lib/context/AuthContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <DashboardNav />
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}
