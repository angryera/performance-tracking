'use client'

import { useState, useEffect } from 'react'
import { Users, Phone, TrendingUp, Clock, User, Lock, Search, Filter } from 'lucide-react'
import { Quicksand } from 'next/font/google'
import { useRouter } from 'next/navigation'

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

interface UserWithStats {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  minutes: number
  totalCalls: number
  avgGrade: string
  totalMinutesUsed: number
  remainingMinutes: number
  lastActivity: string | null
}

export default function UsersPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Check for existing session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        if (user.role === 'ADMIN') {
          setCurrentUser(user)
          setIsLoggedIn(true)
          fetchUsers()
        } else {
          localStorage.removeItem('user')
          router.push('/manager')
        }
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('user')
        router.push('/manager')
      }
    } else {
      router.push('/manager')
    }
  }, [router])

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true)
      
      // Fetch all users with their stats
      const response = await fetch('/api/manager/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('user')
    // Dispatch custom event to notify layout about auth change
    window.dispatchEvent(new CustomEvent('managerAuthChange'))
    router.push('/manager')
  }

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      
      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase()
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase()
          break
        case 'calls':
          aValue = a.totalCalls
          bValue = b.totalCalls
          break
        case 'grade':
          aValue = a.avgGrade === 'N/A' ? 'Z' : a.avgGrade
          bValue = b.avgGrade === 'N/A' ? 'Z' : b.avgGrade
          break
        case 'minutes':
          aValue = a.totalMinutesUsed
          bValue = b.totalMinutesUsed
          break
        case 'remaining':
          aValue = a.remainingMinutes
          bValue = b.remainingMinutes
          break
        default:
          aValue = a.firstName.toLowerCase()
          bValue = b.firstName.toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100'
      case 'B': return 'text-blue-600 bg-blue-100'
      case 'C': return 'text-yellow-600 bg-yellow-100'
      case 'D': return 'text-orange-600 bg-orange-100'
      case 'F': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRoleColor = (role: string) => {
    return role === 'ADMIN' 
      ? 'text-purple-600 bg-purple-100' 
      : 'text-blue-600 bg-blue-100'
  }

  // If not logged in, redirect to manager page
  if (!isLoggedIn) {
    return (
      <div className={`${quicksand.variable} font-sans min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8`}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Users className="w-12 h-12 text-indigo-600" />
          </div>
          <h2 className="mt-6 font-extrabold text-gray-900 text-3xl text-center">
            Redirecting...
          </h2>
          <p className="mt-2 text-gray-600 text-sm text-center">
            Please wait while we redirect you to the login page
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${quicksand.variable} font-sans`}>
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-bold text-gray-900 text-2xl">User Management</h1>
              <p className="mt-1 text-gray-500 text-sm">
                Manage and monitor all users in the system
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLogout}
                className="inline-flex items-center bg-white hover:bg-gray-50 shadow-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium text-gray-700 text-sm leading-4"
              >
                <Lock className="mr-2 w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white px-4 sm:px-6 lg:px-8 py-4 border-gray-200 border-b">
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <div className="flex sm:flex-row flex-col sm:space-x-4 space-y-3 sm:space-y-0">
            {/* Search */}
            <div className="relative">
              <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2 pr-4 pl-10 border border-gray-300 focus:border-indigo-500 rounded-md focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 focus:border-indigo-500 rounded-md focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="REP">Rep</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 focus:border-indigo-500 rounded-md focus:ring-indigo-500 sm:text-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="calls">Sort by Calls</option>
              <option value="grade">Sort by Grade</option>
              <option value="minutes">Sort by Minutes Used</option>
              <option value="remaining">Sort by Remaining</option>
            </select>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="hover:bg-gray-50 px-3 py-2 border border-gray-300 focus:border-indigo-500 rounded-md focus:ring-indigo-500 sm:text-sm"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="text-gray-500 text-sm">
            {filteredAndSortedUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow sm:rounded-md overflow-hidden">
        {isLoadingUsers ? (
          <div className="flex justify-center items-center py-12">
            <div className="border-indigo-600 border-b-2 rounded-full w-8 h-8 animate-spin"></div>
            <span className="ml-3 text-gray-500">Loading users...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="divide-y divide-gray-200 min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                    Total Calls
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                    Avg Grade
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                    Minutes Used
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                    Total Granted
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <div className="flex justify-center items-center bg-indigo-100 rounded-full w-10 h-10">
                            <User className="w-6 h-6 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900 text-sm">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-gray-500 text-sm">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className="mr-2 w-4 h-4 text-gray-400" />
                        {user.totalCalls}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(user.avgGrade)}`}>
                        {user.avgGrade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="mr-2 w-4 h-4 text-gray-400" />
                        {user.totalMinutesUsed}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="mr-2 w-4 h-4 text-gray-400" />
                        {user.remainingMinutes}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                      <div className="flex items-center">
                        <TrendingUp className="mr-2 w-4 h-4 text-gray-400" />
                        {user.minutes}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                      {user.lastActivity ? (
                        new Date(user.lastActivity).toLocaleDateString()
                      ) : (
                        'Never'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoadingUsers && filteredAndSortedUsers.length === 0 && (
          <div className="py-12 text-center">
            <Users className="mx-auto w-12 h-12 text-gray-400" />
            <h3 className="mt-2 font-medium text-gray-900 text-sm">No users found</h3>
            <p className="mt-1 text-gray-500 text-sm">
              {searchTerm || roleFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No users have been added to the system yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 