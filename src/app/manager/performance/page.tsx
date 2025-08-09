'use client'

import { useState } from 'react'
import { TrendingUp, Users, Clock, Award } from 'lucide-react'

interface PerformanceData {
  userId: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  totalCalls: number
  avgGrade: string
  totalMinutes: number
  date: string
}

export default function PerformancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  // Mock data - replace with actual API call
  const performanceData: PerformanceData[] = [
    {
      userId: '1',
      user: { firstName: 'Tara', lastName: 'Buonforte', email: 'tarabuonforte@example.com' },
      totalCalls: 45,
      avgGrade: 'A',
      totalMinutes: 1200,
      date: '2024-01-15'
    },
    {
      userId: '2',
      user: { firstName: 'Philip', lastName: 'Buonforte', email: 'philipbuonforte@gmail.com' },
      totalCalls: 38,
      avgGrade: 'B+',
      totalMinutes: 900,
      date: '2024-01-15'
    }
  ]

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800'
      case 'B+': return 'bg-blue-100 text-blue-800'
      case 'B': return 'bg-blue-100 text-blue-800'
      case 'C': return 'bg-yellow-100 text-yellow-800'
      case 'D': return 'bg-orange-100 text-orange-800'
      case 'F': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
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

      {/* Summary Cards */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white shadow p-6 rounded-lg">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-600 text-sm">Active Reps</p>
              <p className="font-semibold text-gray-900 text-2xl">12</p>
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
              <p className="font-semibold text-gray-900 text-2xl">1,247</p>
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
              <p className="font-semibold text-gray-900 text-2xl">B+</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow p-6 rounded-lg">
          <div className="flex items-center">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-600 text-sm">Total Hours</p>
              <p className="font-semibold text-gray-900 text-2xl">141</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-gray-200 border-b">
          <h3 className="font-semibold text-gray-900 text-lg">Individual Performance</h3>
        </div>
        <div className="overflow-x-auto">
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
                  Total Minutes
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Performance
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
                    {formatDuration(performance.totalMinutes)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-200 mr-2 rounded-full w-16 h-2">
                        <div 
                          className="bg-blue-600 rounded-full h-2" 
                          style={{ width: `${(performance.totalCalls / 50) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {Math.round((performance.totalCalls / 50) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Section */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
        {/* Grade Distribution */}
        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="mb-4 font-semibold text-gray-900 text-lg">Grade Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Grade A</span>
              <div className="flex items-center">
                <div className="bg-gray-200 mr-2 rounded-full w-32 h-2">
                  <div className="bg-green-600 rounded-full h-2" style={{ width: '35%' }}></div>
                </div>
                <span className="text-gray-500 text-xs">35%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Grade B</span>
              <div className="flex items-center">
                <div className="bg-gray-200 mr-2 rounded-full w-32 h-2">
                  <div className="bg-blue-600 rounded-full h-2" style={{ width: '45%' }}></div>
                </div>
                <span className="text-gray-500 text-xs">45%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Grade C</span>
              <div className="flex items-center">
                <div className="bg-gray-200 mr-2 rounded-full w-32 h-2">
                  <div className="bg-yellow-600 rounded-full h-2" style={{ width: '15%' }}></div>
                </div>
                <span className="text-gray-500 text-xs">15%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Grade D/F</span>
              <div className="flex items-center">
                <div className="bg-gray-200 mr-2 rounded-full w-32 h-2">
                  <div className="bg-red-600 rounded-full h-2" style={{ width: '5%' }}></div>
                </div>
                <span className="text-gray-500 text-xs">5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call Volume Trend */}
        <div className="bg-white shadow p-6 rounded-lg">
          <h3 className="mb-4 font-semibold text-gray-900 text-lg">Call Volume Trend</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Monday</span>
              <div className="flex items-center">
                <div className="bg-gray-200 mr-2 rounded-full w-32 h-2">
                  <div className="bg-blue-600 rounded-full h-2" style={{ width: '80%' }}></div>
                </div>
                <span className="text-gray-500 text-xs">80</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Tuesday</span>
              <div className="flex items-center">
                <div className="bg-gray-200 mr-2 rounded-full w-32 h-2">
                  <div className="bg-blue-600 rounded-full h-2" style={{ width: '90%' }}></div>
                </div>
                <span className="text-gray-500 text-xs">90</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Wednesday</span>
              <div className="flex items-center">
                <div className="bg-gray-200 mr-2 rounded-full w-32 h-2">
                  <div className="bg-blue-600 rounded-full h-2" style={{ width: '75%' }}></div>
                </div>
                <span className="text-gray-500 text-xs">75</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Thursday</span>
              <div className="flex items-center">
                <div className="bg-gray-200 mr-2 rounded-full w-32 h-2">
                  <div className="bg-blue-600 rounded-full h-2" style={{ width: '85%' }}></div>
                </div>
                <span className="text-gray-500 text-xs">85</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Friday</span>
              <div className="flex items-center">
                <div className="bg-gray-200 mr-2 rounded-full w-32 h-2">
                  <div className="bg-blue-600 rounded-full h-2" style={{ width: '70%' }}></div>
                </div>
                <span className="text-gray-500 text-xs">70</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 