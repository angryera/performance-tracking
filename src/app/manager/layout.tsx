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
      <header className="bg-slate-800 shadow-lg border-slate-700 border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/manager" className="flex items-center">
                <BarChart3 className="mr-3 w-7 h-7 text-slate-300" />
                <span className="font-semibold text-white text-xl">
                  Manager Dashboard
                </span>
              </Link>
            </div>
            
            <nav className="flex space-x-8">
              <Link
                href="/manager"
                className="hover:bg-slate-700 px-3 py-2 rounded-md font-medium text-slate-300 hover:text-white text-sm transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/manager/conversations"
                className="hover:bg-slate-700 px-3 py-2 rounded-md font-medium text-slate-300 hover:text-white text-sm transition-colors"
              >
                Conversations
              </Link>
              <Link
                href="/manager/performance"
                className="hover:bg-slate-700 px-3 py-2 rounded-md font-medium text-slate-300 hover:text-white text-sm transition-colors"
              >
                Performance
              </Link>
              <Link
                href="/manager/config"
                className="hover:bg-slate-700 px-3 py-2 rounded-md font-medium text-slate-300 hover:text-white text-sm transition-colors"
              >
                Configuration
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center hover:bg-slate-700 px-3 py-2 rounded-md text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="mr-2 w-4 h-4" />
                <span className="font-medium text-sm">Exit</span>
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