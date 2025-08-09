import Link from 'next/link'
import { BarChart3, Settings, Users, LogOut } from 'lucide-react'

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/manager" className="flex items-center">
                <BarChart3 className="mr-2 w-8 h-8 text-blue-600" />
                <span className="font-semibold text-gray-900 text-xl">
                  Manager Dashboard
                </span>
              </Link>
            </div>
            
            <nav className="flex space-x-8">
              <Link
                href="/manager"
                className="px-3 py-2 rounded-md font-medium text-gray-500 hover:text-gray-700 text-sm"
              >
                Dashboard
              </Link>
              <Link
                href="/manager/conversations"
                className="px-3 py-2 rounded-md font-medium text-gray-500 hover:text-gray-700 text-sm"
              >
                Conversations
              </Link>
              <Link
                href="/manager/performance"
                className="px-3 py-2 rounded-md font-medium text-gray-500 hover:text-gray-700 text-sm"
              >
                Performance
              </Link>
              <Link
                href="/manager/config"
                className="px-3 py-2 rounded-md font-medium text-gray-500 hover:text-gray-700 text-sm"
              >
                Configuration
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <LogOut className="mr-1 w-4 h-4" />
                <span className="text-sm">Exit</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto sm:px-6 lg:px-8 py-6 max-w-7xl">
        {children}
      </main>
    </div>
  )
} 