'use client'

import { useState, useEffect } from 'react'
import { Users, Phone, TrendingUp, Download, AlertCircle } from 'lucide-react'

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
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<string>('')
  const [stats, setStats] = useState<DashboardStats>({
    totalReps: 0,
    totalCalls: 0,
    avgGrade: 'N/A',
    totalMinutes: 0,
    grantedMinutes: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])

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

  useEffect(() => {
    fetchStats()
    fetchRecentActivities()
  }, [])

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
        // Refresh stats and activities after successful import
        fetchStats()
        fetchRecentActivities()
      } else {
        setImportStatus('Failed to import data. Please check your configuration.')
      }
    } catch (error) {
      setImportStatus('Error importing data. Please try again.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-gray-900 text-2xl sm:text-3xl">Dashboard Overview</h1>
          <p className="mt-1 text-gray-600 text-sm sm:text-base">Monitor your sales team's performance</p>
        </div>
        <button
          onClick={handleImportData}
          disabled={isImporting}
          className="inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-3 sm:px-4 py-2 rounded-lg w-full sm:w-auto font-medium text-white text-sm sm:text-base disabled:cursor-not-allowed"
        >
          <Download className="mr-2 w-4 h-4" />
          {isImporting ? 'Importing...' : 'Import from Google Sheets'}
        </button>
      </div>

      {/* Import Status */}
      {importStatus && (
        <div className={`p-3 sm:p-4 rounded-lg ${
          importStatus.includes('successfully') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            <AlertCircle className="flex-shrink-0 mr-2 w-4 h-4" />
            <span className="text-sm sm:text-base">{importStatus}</span>
          </div>
        </div>
      )}

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
                        <span className="bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                          Grade: {activity.grade}
                        </span>
                      )}
                      {activity.duration && (
                        <span className="bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                          {formatDuration(activity.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="flex-shrink-0 ml-2 sm:ml-auto text-gray-400 text-xs">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 