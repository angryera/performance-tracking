import Link from 'next/link'
import { BarChart3, Users, Phone } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="mx-auto px-4 py-16 container">
        <div className="mb-16 text-center">
          <h1 className="mb-4 font-bold text-gray-900 text-5xl">
            Sales Performance Tracker
          </h1>
          <p className="mx-auto max-w-2xl text-gray-600 text-xl">
            Track, analyze, and optimize your sales team's performance with AI-powered insights
          </p>
        </div>

        <div className="gap-8 grid md:grid-cols-2 mx-auto max-w-4xl">
          {/* Manager Section */}
          <div className="bg-white shadow-lg hover:shadow-xl p-8 rounded-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="ml-4 font-semibold text-2xl">Manager Dashboard</h2>
            </div>
            <p className="mb-6 text-gray-600">
              Import data from Google Sheets, view performance metrics, and manage your sales team.
            </p>
            <ul className="space-y-2 mb-8 text-gray-600 text-sm">
              <li>• Import reps data from Google Sheets</li>
              <li>• View conversation transcripts and grades</li>
              <li>• Access performance analytics</li>
              <li>• Manage team configurations</li>
            </ul>
            <Link
              href="/manager"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium text-white transition-colors"
            >
              Access Manager Dashboard
            </Link>
          </div>

          {/* Rep Section */}
          <div className="bg-white shadow-lg hover:shadow-xl p-8 rounded-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-lg">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="ml-4 font-semibold text-2xl">Sales Rep Portal</h2>
            </div>
            <p className="mb-6 text-gray-600">
              Login to access your performance dashboard and start conversations with AI-powered bots.
            </p>
            <ul className="space-y-2 mb-8 text-gray-600 text-sm">
              <li>• Secure login with email and password</li>
              <li>• Interactive VAPI widget for calls</li>
              <li>• View your performance metrics</li>
              <li>• Access conversation history</li>
            </ul>
            <Link
              href="/rep"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium text-white transition-colors"
            >
              Access Rep Portal
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h3 className="mb-8 font-semibold text-2xl">Key Features</h3>
          <div className="gap-8 grid md:grid-cols-3 mx-auto max-w-4xl">
            <div className="text-center">
              <div className="flex justify-center items-center bg-purple-100 mx-auto mb-4 p-4 rounded-full w-16 h-16">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="mb-2 font-semibold">Team Management</h4>
              <p className="text-gray-600 text-sm">
                Easily manage your sales team with Google Sheets integration
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center items-center bg-orange-100 mx-auto mb-4 p-4 rounded-full w-16 h-16">
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="mb-2 font-semibold">Performance Analytics</h4>
              <p className="text-gray-600 text-sm">
                AI-powered analysis of conversation quality and performance metrics
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center items-center bg-teal-100 mx-auto mb-4 p-4 rounded-full w-16 h-16">
                <Phone className="w-8 h-8 text-teal-600" />
              </div>
              <h4 className="mb-2 font-semibold">VAPI Integration</h4>
              <p className="text-gray-600 text-sm">
                Seamless integration with VAPI for AI-powered sales conversations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 