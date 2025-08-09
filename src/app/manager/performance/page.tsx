'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, Clock, Award, Loader2 } from 'lucide-react'

interface PerformanceData {
  userId: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  totalCalls: number
  avgGrade: string
  totalDuration: number
  lastActivity: string | null
}

interface PerformanceSummary {
  totalReps: number
  totalCalls: number
  overallAvgGrade: string
  totalHours: number
}

interface GradeDistribution {
  A: number
  B: number
  C: number
  D: number
  F: number
}

interface CallTrend {
  day: string
  calls: number
}

export default function PerformancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [summary, setSummary] = useState<PerformanceSummary>({
    totalReps: 0,
    totalCalls: 0,
    overallAvgGrade: 'N/A',
    totalHours: 0
  })
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistribution>({
    A: 0, B: 0, C: 0, D: 0, F: 0
  })
  const [callTrend, setCallTrend] = useState<CallTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/manager/performance?period=${selectedPeriod}`)
      if (!response.ok) {
        throw new Error('Failed to fetch performance data')
      }
      
      const data = await response.json()
      setPerformanceData(data.performanceData)
      setSummary(data.summary)
      setGradeDistribution(data.gradeDistribution)
      setCallTrend(data.callTrend)
    } catch (err) {
      console.error('Error fetching performance data:', err)
      setError('Failed to load performance data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPerformanceData()
  }, [selectedPeriod])

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800'
      case 'B': return 'bg-blue-100 text-blue-800'
      case 'C': return 'bg-yellow-100 text-yellow-800'
      case 'D': return 'bg-orange-100 text-orange-800'
      case 'F': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-gray-900 text-3xl">Performance Analytics</h1>
          <p className="mt-1 text-gray-600">Track and analyze your team's performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="font-medium text-gray-700 text-sm">Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-gray-600">Loading performance data...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 p-4 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex justify-center items-center bg-red-400 rounded-full w-5 h-5">
                <span className="text-white text-xs">!</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {!isLoading && !error && (
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white shadow p-6 rounded-lg">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-600 text-sm">Active Reps</p>
                <p className="font-semibold text-gray-900 text-2xl">{summary.totalReps}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow p-6 rounded-lg">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-600 text-sm">Total Calls</p>
                <p className="font-semibold text-gray-900 text-2xl">{summary.totalCalls}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow p-6 rounded-lg">
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-600 text-sm">Avg Grade</p>
                <p className="font-semibold text-gray-900 text-2xl">{summary.overallAvgGrade}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow p-6 rounded-lg">
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-600 text-sm">Total Duration</p>
                <p className="font-semibold text-gray-900 text-2xl">{formatDuration(summary.totalHours * 3600)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Table */}
      {!isLoading && !error && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-gray-200 border-b">
            <h3 className="font-semibold text-gray-900 text-lg">Individual Performance</h3>
          </div>
          <div className="overflow-x-auto">
            {performanceData.length === 0 ? (
              <div className="py-12 text-center">
                <div className="flex justify-center items-center bg-gray-100 mx-auto mb-4 rounded-full w-16 h-16">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="mb-2 font-medium text-gray-900 text-lg">No performance data</h3>
                <p className="text-gray-600">Performance data will appear here once sales reps start making calls.</p>
              </div>
            ) : (
              <table className="divide-y divide-gray-200 min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                      Rep
                    </th>
                    <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                      Total Calls
                    </th>
                    <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                      Avg Grade
                    </th>
                    <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                      Total Duration
                    </th>
                    <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {performanceData.map((performance) => (
                    <tr key={performance.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {performance.user.firstName} {performance.user.lastName}
                          </div>
                          <div className="text-gray-500 text-sm">{performance.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                        {performance.totalCalls}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(performance.avgGrade)}`}>
                          {performance.avgGrade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                        {formatDuration(performance.totalDuration)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                        {performance.lastActivity ? 
                          new Date(performance.lastActivity).toLocaleDateString() : 
                          'No activity'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Charts Section */}
      {!isLoading && !error && (
        <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
          {/* Grade Distribution */}
          <div className="bg-white shadow p-6 rounded-lg">
            <h3 className="mb-4 font-semibold text-gray-900 text-lg">Grade Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Grade A</span>
                <div className="flex items-center">
                  <div className="bg-gray-200 mr-2 rounded-full w-32 h-2">
                    <div className="bg-green-600 rounded-full h-2" style={{ width: `${gradeDistribution.A}%` }}></div>
                  </div>
                  <span className="text-gray-500 text-xs">{gradeDistribution.A}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Grade B</span>
                <div className="flex items-center">
                  <div className="bg-gray-200 mr-2 rounded-full w-32 h-2">
                    <div className="bg-blue-600 rounded-full h-2" style={{ width: `${gradeDistribution.B}%` }}></div>
                  </div>
                  <span className="text-gray-500 text-xs">{gradeDistribution.B}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Grade C</span>
                <div className="flex items-center">
                  <div className="bg-gray-200 mr-2 rounded-full w-32 h-2">
                    <div className="bg-yellow-600 rounded-full h-2" style={{ width: `${gradeDistribution.C}%` }}></div>
                  </div>
                  <span className="text-gray-500 text-xs">{gradeDistribution.C}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Grade D</span>
                <div className="flex items-center">
                  <div className="bg-gray-200 mr-2 rounded-full w-32 h-2">
                    <div className="bg-orange-600 rounded-full h-2" style={{ width: `${gradeDistribution.D}%` }}></div>
                  </div>
                  <span className="text-gray-500 text-xs">{gradeDistribution.D}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Grade F</span>
                <div className="flex items-center">
                  <div className="bg-gray-200 mr-2 rounded-full w-32 h-2">
                    <div className="bg-red-600 rounded-full h-2" style={{ width: `${gradeDistribution.F}%` }}></div>
                  </div>
                  <span className="text-gray-500 text-xs">{gradeDistribution.F}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call Volume Trend */}
          <div className="bg-white shadow p-6 rounded-lg">
            <h3 className="mb-4 font-semibold text-gray-900 text-lg">Call Volume Trend (Last 7 Days)</h3>
            <div className="space-y-3">
              {callTrend.map((day) => {
                const maxCalls = Math.max(...callTrend.map(d => d.calls))
                const percentage = maxCalls > 0 ? (day.calls / maxCalls) * 100 : 0
                
                return (
                  <div key={day.day} className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">{day.day}</span>
                    <div className="flex items-center">
                      <div className="bg-gray-200 mr-2 rounded-full w-32 h-2">
                        <div className="bg-blue-600 rounded-full h-2" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="text-gray-500 text-xs">{day.calls}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 