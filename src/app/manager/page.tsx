'use client'

import { useState, useEffect } from 'react'
import { Users, Phone, TrendingUp, Download, AlertCircle, BarChart3, User, Lock, LogIn } from 'lucide-react'
import { Inter, Poppins, Quicksand } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
})
const quicksand = Quicksand({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-quicksand'
})

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  minutes: number
}

interface DashboardStats {
  totalReps: number
  totalCalls: number
  avgGrade: string
  totalMinutes: number
  grantedMinutes: number
}

interface RecentActivity {
  id: string
  type: 'conversation' | 'user_import'
  message: string
  grade?: string
  duration?: number
  timestamp: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

export default function ManagerDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<string>('')
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [setupCredentials, setSetupCredentials] = useState<{email: string, password: string} | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalReps: 0,
    totalCalls: 0,
    avgGrade: 'N/A',
    totalMinutes: 0,
    grantedMinutes: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])

  // Check for existing session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        if (user.role === 'ADMIN') {
          setCurrentUser(user)
          setIsLoggedIn(true)
          fetchStats()
          fetchRecentActivities()
        } else {
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('user')
      }
    }
    checkAdminUsers()
  }, [])

  const checkAdminUsers = async () => {
    try {
      const response = await fetch('/api/auth/setup-admin')
      if (response.ok) {
        const data = await response.json()
        setHasAdmin(data.hasAdmin)
      }
    } catch (error) {
      console.error('Error checking admin users:', error)
    }
  }

  const setupDefaultAdmin = async () => {
    setIsSettingUp(true)
    setError('')

    try {
      const response = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setSetupCredentials(data.credentials)
        setHasAdmin(true)
        
        // Auto-login with the created credentials
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data.credentials),
        })

        const loginData = await loginResponse.json()

        if (loginResponse.ok && loginData.user.role === 'ADMIN') {
          setCurrentUser(loginData.user)
          setIsLoggedIn(true)
          localStorage.setItem('user', JSON.stringify(loginData.user))
          // Dispatch custom event to notify layout about auth change
          window.dispatchEvent(new CustomEvent('managerAuthChange'))
        }
      } else {
        setError(data.error || 'Failed to create admin user')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsSettingUp(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/manager/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('/api/manager/recent-activities')
      if (response.ok) {
        const data = await response.json()
        setRecentActivities(data)
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error)
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('user')
    // Dispatch custom event to notify layout about auth change
    window.dispatchEvent(new CustomEvent('managerAuthChange'))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.user.role === 'ADMIN') {
          setCurrentUser(data.user)
          setIsLoggedIn(true)
          localStorage.setItem('user', JSON.stringify(data.user))
          // Dispatch custom event to notify layout about auth change
          window.dispatchEvent(new CustomEvent('managerAuthChange'))
        } else {
          setError('Access denied. Admin role required.')
        }
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className={`${poppins.variable} ${quicksand.variable} flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen px-4 sm:px-6`} suppressHydrationWarning>
        <div className="space-y-6 sm:space-y-8 w-full max-w-md">
          <div className="text-center">
            <div className="flex justify-center items-center bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg mx-auto rounded-full w-14 sm:w-16 h-14 sm:h-16">
              <BarChart3 className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
            </div>
            <h2 className={`${quicksand.className} mt-4 sm:mt-6 font-bold text-gray-900 text-2xl sm:text-3xl lg:text-4xl tracking-tight`}>
              Manager Portal
            </h2>
            <p className={`${poppins.className} mt-2 sm:mt-3 text-gray-600 text-sm sm:text-base font-light px-4`}>
              {hasAdmin === false ? 'Set up your first admin user' : 'Sign in to access the manager dashboard'}
            </p>
          </div>

          {/* Setup Success Message */}
          {setupCredentials && (
            <div className="bg-green-50 p-4 border border-green-200 rounded-lg">
              <div className="text-center">
                <h3 className="mb-2 font-semibold text-green-800 text-sm">Admin User Created Successfully!</h3>
                <p className="mb-3 text-green-700 text-xs">Use these credentials to log in:</p>
                <div className="bg-white p-3 border border-green-200 rounded text-left">
                  <p className="text-green-800 text-xs"><strong>Email:</strong> {setupCredentials.email}</p>
                  <p className="text-green-800 text-xs"><strong>Password:</strong> {setupCredentials.password}</p>
                </div>
                <p className="mt-2 text-green-600 text-xs">Please change these credentials after your first login.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 p-3 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="flex-shrink-0 mr-2 w-4 h-4 text-red-600" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Setup Admin Button */}
          {hasAdmin === false && !setupCredentials && (
            <div className="text-center">
              <button
                onClick={setupDefaultAdmin}
                disabled={isSettingUp}
                className={`${poppins.className} w-full disabled:opacity-50 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-200 text-sm sm:text-base flex justify-center items-center`}
              >
                {isSettingUp ? 'Setting up...' : 'Create Default Admin User'}
              </button>
              <p className="mt-2 text-gray-500 text-xs">This will create a default admin user with credentials you can use to log in.</p>
            </div>
          )}

          {/* Login Form */}
          {hasAdmin !== false && (
            <form className="space-y-4 sm:space-y-6 mt-6 sm:mt-8" onSubmit={handleLogin}>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="email" className={`${poppins.className} block font-medium text-gray-700 text-sm mb-2`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <User className="top-1/2 left-3 sm:left-4 absolute w-4 sm:w-5 h-4 sm:h-5 text-gray-400 -translate-y-1/2 transform" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      disabled={isLoading}
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className={`${poppins.className} block relative disabled:opacity-50 py-2.5 sm:py-3 pr-4 pl-10 sm:pl-12 border border-gray-300 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-gray-900 appearance-none placeholder-gray-500 font-medium text-sm sm:text-base`}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className={`${poppins.className} block font-medium text-gray-700 text-sm mb-2`}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="top-1/2 left-3 sm:left-4 absolute w-4 sm:w-5 h-4 sm:h-5 text-gray-400 -translate-y-1/2 transform" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      disabled={isLoading}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className={`${poppins.className} block relative disabled:opacity-50 py-2.5 sm:py-3 pr-4 pl-10 sm:pl-12 border border-gray-300 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-gray-900 appearance-none placeholder-gray-500 font-medium text-sm sm:text-base`}
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`${poppins.className} w-full disabled:opacity-50 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-200 text-sm sm:text-base flex justify-center items-center`}
                >
                  <LogIn className="mr-2 sm:mr-3 w-4 sm:w-5 h-4 sm:h-5" />
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )
  }

  // Rest of the dashboard content remains the same
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleImportData = async () => {
    setIsImporting(true)
    setImportStatus('Importing data from Google Sheets...')
    
    try {
      const response = await fetch('/api/manager/import-sheet', {
        method: 'POST',
      })
      
      if (response.ok) {
        setImportStatus('Data imported successfully!')
        // Refresh stats after import
        fetchStats()
        fetchRecentActivities()
      } else {
        setImportStatus('Failed to import data. Please try again.')
      }
    } catch (error) {
      setImportStatus('Network error. Please try again.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-gray-900 text-2xl sm:text-3xl">Manager Dashboard</h1>
          <p className="mt-1 text-gray-600 text-sm sm:text-base">Welcome back, {currentUser?.firstName} {currentUser?.lastName}</p>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white shadow p-4 sm:p-6 rounded-lg">
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Import Data</h3>
            <p className="mt-1 text-gray-600 text-sm">Import sales representatives from Google Sheets</p>
          </div>
          <button
            onClick={handleImportData}
            disabled={isImporting}
            className="flex items-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-white text-sm transition-colors"
          >
            <Download className="mr-2 w-4 h-4" />
            {isImporting ? 'Importing...' : 'Import Data'}
          </button>
        </div>
        {importStatus && (
          <div className="mt-3 sm:mt-4 p-3 border rounded-lg text-sm">
            <span className={importStatus.includes('successfully') ? 'text-green-600' : 'text-red-600'}>
              {importStatus}
            </span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="gap-4 sm:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white shadow p-4 sm:p-6 rounded-lg">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="font-medium text-gray-600 text-xs sm:text-sm">Total Reps</p>
              <p className="font-semibold text-gray-900 text-xl sm:text-2xl">{stats.totalReps}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow p-4 sm:p-6 rounded-lg">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg">
              <Phone className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="font-medium text-gray-600 text-xs sm:text-sm">Total Calls</p>
              <p className="font-semibold text-gray-900 text-xl sm:text-2xl">{stats.totalCalls}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow p-4 sm:p-6 rounded-lg">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg">
              <TrendingUp className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="font-medium text-gray-600 text-xs sm:text-sm">Avg Grade</p>
              <p className="font-semibold text-gray-900 text-xl sm:text-2xl">{stats.avgGrade}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow p-4 sm:p-6 rounded-lg">
          <div className="flex items-center">
            <div className="bg-orange-100 p-2 rounded-lg">
              <TrendingUp className="w-5 sm:w-6 h-5 sm:h-6 text-orange-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="font-medium text-gray-600 text-xs sm:text-sm">Minutes Used</p>
              <p className="font-semibold text-gray-900 text-xl sm:text-2xl">{stats.totalMinutes}</p>
              <p className="text-gray-500 text-xs">of {stats.grantedMinutes} granted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="gap-4 sm:gap-6 grid grid-cols-1 lg:grid-cols-2">
        <div className="bg-white shadow p-4 sm:p-6 rounded-lg">
          <h3 className="mb-3 sm:mb-4 font-semibold text-gray-900 text-base sm:text-lg">Quick Actions</h3>
          <div className="space-y-2 sm:space-y-3">
            <a
              href="/manager/conversations"
              className="block hover:bg-gray-50 p-2.5 sm:p-3 border border-gray-200 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 text-xs sm:text-sm">View Conversations</span>
                <span className="text-gray-500 text-xs">→</span>
              </div>
            </a>
            <a
              href="/manager/performance"
              className="block hover:bg-gray-50 p-2.5 sm:p-3 border border-gray-200 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 text-xs sm:text-sm">Performance Analytics</span>
                <span className="text-gray-500 text-xs">→</span>
              </div>
            </a>
            <a
              href="/manager/config"
              className="block hover:bg-gray-50 p-2.5 sm:p-3 border border-gray-200 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 text-xs sm:text-sm">Configure Google Sheets</span>
                <span className="text-gray-500 text-xs">→</span>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white shadow p-4 sm:p-6 rounded-lg">
          <h3 className="mb-3 sm:mb-4 font-semibold text-gray-900 text-base sm:text-lg">Recent Activity</h3>
          <div className="space-y-2 sm:space-y-3">
            {recentActivities.length === 0 ? (
              <div className="py-3 sm:py-4 text-center">
                <p className="text-gray-500 text-xs sm:text-sm">No recent activity</p>
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center text-gray-600 text-xs sm:text-sm">
                  <div className={`mr-2 sm:mr-3 rounded-full w-1.5 h-1.5 sm:w-2 sm:h-2 flex-shrink-0 ${
                    activity.type === 'conversation' ? 'bg-green-400' : 'bg-blue-400'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <span className="block truncate">{activity.message}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activity.grade && (
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          activity.grade === 'A' ? 'bg-green-100 text-green-800' :
                          activity.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                          activity.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          activity.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Grade: {activity.grade}
                        </span>
                      )}
                      {activity.duration && (
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 text-xs">
                          {formatDuration(activity.duration)}
                        </span>
                      )}
                      <span className="text-gray-500 text-xs">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 