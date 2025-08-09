import Link from 'next/link'
import { BarChart3, Users, Phone } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 container">
        <div className="mb-8 sm:mb-12 lg:mb-16 text-center">
          <h1 className="mb-3 sm:mb-4 px-2 font-bold text-gray-900 text-3xl sm:text-4xl lg:text-5xl">
            Sales Performance Tracker
          </h1>
          <p className="mx-auto px-4 max-w-2xl text-gray-600 text-base sm:text-lg lg:text-xl">
            Track, analyze, and optimize your sales team's performance with AI-powered insights
          </p>
        </div>

        <div className="gap-6 sm:gap-8 grid grid-cols-1 md:grid-cols-2 mx-auto max-w-4xl">
          {/* Manager Section */}
          <div className="bg-white shadow-lg hover:shadow-xl p-6 sm:p-8 rounded-xl transition-shadow">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                <BarChart3 className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
              </div>
              <h2 className="ml-3 sm:ml-4 font-semibold text-xl sm:text-2xl">Manager Dashboard</h2>
            </div>
            <p className="mb-4 sm:mb-6 text-gray-600 text-sm sm:text-base">
              Import data from Google Sheets, view performance metrics, and manage your sales team.
            </p>
            <ul className="space-y-1.5 sm:space-y-2 mb-6 sm:mb-8 text-gray-600 text-xs sm:text-sm">
              <li>• Import reps data from Google Sheets</li>
              <li>• View conversation transcripts and grades</li>
              <li>• Access performance analytics</li>
              <li>• Manage team configurations</li>
            </ul>
            <Link
              href="/manager"
              className="inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg w-full sm:w-auto font-medium text-white text-sm sm:text-base transition-colors"
            >
              Access Manager Dashboard
            </Link>
          </div>

          {/* Rep Section */}
          <div className="bg-white shadow-lg hover:shadow-xl p-6 sm:p-8 rounded-xl transition-shadow">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                <Phone className="w-6 sm:w-8 h-6 sm:h-8 text-green-600" />
              </div>
              <h2 className="ml-3 sm:ml-4 font-semibold text-xl sm:text-2xl">Sales Rep Portal</h2>
            </div>
            <p className="mb-4 sm:mb-6 text-gray-600 text-sm sm:text-base">
              Login to access your performance dashboard and start conversations with AI-powered bots.
            </p>
            <ul className="space-y-1.5 sm:space-y-2 mb-6 sm:mb-8 text-gray-600 text-xs sm:text-sm">
              <li>• Secure login with email and password</li>
              <li>• Interactive VAPI widget for calls</li>
              <li>• View your performance metrics</li>
              <li>• Access conversation history</li>
            </ul>
            <Link
              href="/rep"
              className="inline-flex justify-center items-center bg-green-600 hover:bg-green-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg w-full sm:w-auto font-medium text-white text-sm sm:text-base transition-colors"
            >
              Access Rep Portal
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 sm:mt-16 text-center">
          <h3 className="mb-6 sm:mb-8 px-2 font-semibold text-xl sm:text-2xl">Key Features</h3>
          <div className="gap-6 sm:gap-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-4xl">
            <div className="text-center">
              <div className="flex justify-center items-center bg-purple-100 mx-auto mb-3 sm:mb-4 p-3 sm:p-4 rounded-full w-12 sm:w-16 h-12 sm:h-16">
                <Users className="w-6 sm:w-8 h-6 sm:h-8 text-purple-600" />
              </div>
              <h4 className="mb-2 font-semibold text-base sm:text-lg">Team Management</h4>
              <p className="px-2 text-gray-600 text-xs sm:text-sm">
                Easily manage your sales team with Google Sheets integration
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center items-center bg-orange-100 mx-auto mb-3 sm:mb-4 p-3 sm:p-4 rounded-full w-12 sm:w-16 h-12 sm:h-16">
                <BarChart3 className="w-6 sm:w-8 h-6 sm:h-8 text-orange-600" />
              </div>
              <h4 className="mb-2 font-semibold text-base sm:text-lg">Performance Analytics</h4>
              <p className="px-2 text-gray-600 text-xs sm:text-sm">
                AI-powered analysis of conversation quality and performance metrics
              </p>
            </div>
            <div className="sm:col-span-2 lg:col-span-1 text-center">
              <div className="flex justify-center items-center bg-teal-100 mx-auto mb-3 sm:mb-4 p-3 sm:p-4 rounded-full w-12 sm:w-16 h-12 sm:h-16">
                <Phone className="w-6 sm:w-8 h-6 sm:h-8 text-teal-600" />
              </div>
              <h4 className="mb-2 font-semibold text-base sm:text-lg">VAPI Integration</h4>
              <p className="px-2 text-gray-600 text-xs sm:text-sm">
                Seamless integration with VAPI for AI-powered sales conversations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 