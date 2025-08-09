'use client'

import { useState, useEffect } from 'react'
import { Users, Phone, TrendingUp, Download, AlertCircle } from 'lucide-react'

interface DashboardStats {
  totalReps: number
  totalCalls: number
  avgGrade: string
  totalMinutes: number
}

export default function ManagerDashboard() {
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<string>('')
  const [stats, setStats] = useState<DashboardStats>({
    totalReps: 0,
    totalCalls: 0,
    avgGrade: 'N/A',
    totalMinutes: 0
  })

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

  useEffect(() => {
    fetchStats()
  }, [])

  const handleImportData = async () => {
    setIsImporting(true)
    setImportStatus('Importing data from Google Sheets...')
    
    try {
      const response = await fetch('/api/manager/import-sheet', {
        method: 'POST',
      })
      
      if (response.ok) {
        setImportStatus('Data imported successfully!')
        // Refresh stats after successful import
        fetchStats()
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-gray-900 text-3xl">Dashboard Overview</h1>
          <p className="mt-1 text-gray-600">Monitor your sales team's performance</p>
        </div>
        <button
          onClick={handleImportData}
          disabled={isImporting}
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium text-white disabled:cursor-not-allowed"
        >
          <Download className="mr-2 w-4 h-4" />
          {isImporting ? 'Importing...' : 'Import from Google Sheets'}
        </button>
      </div>

      {/* Import Status */}
      {importStatus && (
        <div className={`p-4 rounded-lg ${
          importStatus.includes('successfully') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            <AlertCircle className="mr-2 w-4 h-4" />
            {importStatus}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white shadow p-6 rounded-lg">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-600 text-sm">Total Reps</p>
              <p className="font-semibold text-gray-900 text-2xl">{stats.totalReps}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow p-6 rounded-lg">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-600 text-sm">Total Calls</p>
              <p className="font-semibold text-gray-900 text-2xl">{stats.totalCalls}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow p-6 rounded-lg">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-600 text-sm">Avg Grade</p>
              <p className="font-semibold text-gray-900 text-2xl">{stats.avgGrade}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow p-6 rounded-lg">
          <div className="flex items-center">
            <div className="bg-orange-100 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-600 text-sm">Total Minutes</p>
              <p className="font-semibold text-gray-900 text-2xl">{stats.totalMinutes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="mb-4 font-semibold text-gray-900 text-lg">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/manager/conversations"
              className="block hover:bg-gray-50 p-3 border border-gray-200 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 text-sm">View Conversations</span>
                <span className="text-gray-500 text-xs">→</span>
              </div>
            </a>
            <a
              href="/manager/performance"
              className="block hover:bg-gray-50 p-3 border border-gray-200 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 text-sm">Performance Analytics</span>
                <span className="text-gray-500 text-xs">→</span>
              </div>
            </a>
            <a
              href="/manager/config"
              className="block hover:bg-gray-50 p-3 border border-gray-200 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 text-sm">Configure Google Sheets</span>
                <span className="text-gray-500 text-xs">→</span>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="mb-4 font-semibold text-gray-900 text-lg">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600 text-sm">
              <div className="bg-green-400 mr-3 rounded-full w-2 h-2"></div>
              <span>New conversation recorded for Tara Buonforte</span>
              <span className="ml-auto text-xs">2 min ago</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <div className="bg-blue-400 mr-3 rounded-full w-2 h-2"></div>
              <span>Data imported from Google Sheets</span>
              <span className="ml-auto text-xs">1 hour ago</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <div className="bg-purple-400 mr-3 rounded-full w-2 h-2"></div>
              <span>Performance report generated</span>
              <span className="ml-auto text-xs">3 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 