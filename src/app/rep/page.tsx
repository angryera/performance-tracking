'use client'

import { useState, useEffect } from 'react'
import { Phone, User, Lock, AlertCircle, BarChart3, MessageSquare, TrendingUp, LogOut, Eye, EyeOff } from 'lucide-react'
import { Poppins, Quicksand } from 'next/font/google'
import VAPIWidget from '@/components/VAPIWidget'
import ClientOnly from '@/components/ClientOnly'

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

interface UserUsage {
  totalSecondsUsed: number
  grantedMinutes: number
  remainingSeconds: number
  totalMinutesUsed: number
  remainingMinutes: number
}

interface Conversation {
  id: string
  userId: string
  transcript: string
  mergedTranscript?: string
  duration: number
  grade?: string
  summary?: string
  createdAt: string
}

export default function RepPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'management'>('dashboard')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // Check for existing session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
        setIsLoggedIn(true)
        fetchUserUsage(user.id)
        if (user.role === 'ADMIN') {
          fetchConversations()
        }
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const fetchUserUsage = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/usage?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUserUsage(data)
      }
    } catch (error) {
      console.error('Error fetching user usage:', error)
    }
  }

  const fetchConversations = async () => {
    if (!currentUser) return

    setIsLoadingConversations(true)
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        // Filter conversations for current user only
        const userConversations = data.filter((conv: any) => conv.userId === currentUser.id)
        setConversations(userConversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsLoggedIn(false)
    setUserUsage(null)
    setConversations([])
    localStorage.removeItem('user')
    // Dispatch custom event to notify manager layout about auth change
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
        setCurrentUser(data.user)
        setIsLoggedIn(true)
        // Save user to localStorage for session persistence
        localStorage.setItem('user', JSON.stringify(data.user))
        // Dispatch custom event to notify manager layout about auth change
        window.dispatchEvent(new CustomEvent('managerAuthChange'))
        // Fetch user usage data
        fetchUserUsage(data.user.id)
        // If admin, fetch conversations
        if (data.user.role === 'ADMIN') {
          fetchConversations()
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

  const onCallEnd = async (duration: number, transcript: string, mergedTranscript: Array<{ role: string, text: string }>) => {
    if (!currentUser) return

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          transcript,
          mergedTranscript,
          duration,
        }),
      })

      if (response.ok) {
        // Refresh conversations if user is admin
        if (currentUser.role === 'ADMIN') {
          fetchConversations()
        }
        // Refresh user usage
        fetchUserUsage(currentUser.id)
      }
    } catch (error) {
      console.error('Error saving conversation:', error)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className={`${poppins.variable} ${quicksand.variable} flex justify-center items-center bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen px-4 sm:px-6`} suppressHydrationWarning>
        <div className="space-y-6 sm:space-y-8 w-full max-w-md">
          <div className="text-center">
            <div className="flex justify-center items-center bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg mx-auto rounded-full w-14 sm:w-16 h-14 sm:h-16">
              <Phone className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
            </div>
            <h2 className={`${quicksand.className} mt-4 sm:mt-6 font-bold text-gray-900 text-2xl sm:text-3xl lg:text-4xl tracking-tight`}>
              Sales Rep Portal
            </h2>
            <p className={`${poppins.className} mt-2 sm:mt-3 text-gray-600 text-sm sm:text-base font-light px-4`}>
              Sign in to access your performance dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 p-3 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="flex-shrink-0 mr-2 w-4 h-4 text-red-600" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          <form className="space-y-4 sm:space-y-6 mt-6 sm:mt-8" onSubmit={handleLogin}>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="email" className={`${poppins.className} block font-medium text-gray-700 text-sm mb-2`}>
                  Email Address
                </label>
                <div className="relative">
                  <User className="top-1/2 left-3 sm:left-4 absolute w-4 sm:w-5 h-4 sm:h-5 text-gray-400 -translate-y-2 transform" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={isLoading}
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className={`${poppins.className} block relative disabled:opacity-50 py-2.5 sm:py-3 pr-4 pl-10 sm:pl-12 border border-gray-300 focus:border-green-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 w-full text-gray-900 appearance-none placeholder-gray-500 font-medium text-sm sm:text-base`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className={`${poppins.className} block font-medium text-gray-700 text-sm mb-2`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="top-1/2 left-3 sm:left-4 absolute w-4 sm:w-5 h-4 sm:h-5 text-gray-400 -translate-y-2 transform" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className={`${poppins.className} block relative disabled:opacity-50 py-2.5 sm:py-3 pr-4 pl-10 sm:pl-12 border border-gray-300 focus:border-green-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 w-full text-gray-900 appearance-none placeholder-gray-500 font-medium text-sm sm:text-base`}
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`${quicksand.className} w-full disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 active:scale-95 text-sm sm:text-base shadow-lg`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={`${poppins.variable} ${quicksand.className} bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen`} suppressHydrationWarning>
      {/* Header */}
      <header className="z-50 relative bg-white shadow-lg border-gray-200 border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <Phone className="mr-2 sm:mr-3 w-6 sm:w-7 h-6 sm:h-7 text-green-600" />
                <span className={`${quicksand.className} font-semibold text-gray-900 text-lg sm:text-xl`}>
                  Sales Rep Portal
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 lg:space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`hover:bg-gray-100 px-3 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'dashboard'
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('management')}
                className={`hover:bg-gray-100 px-3 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'management'
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                My Data
              </button>
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Desktop Manager Portal Button (for admins) */}
              {currentUser?.role === 'ADMIN' && (
                <a
                  href="/manager"
                  className="hidden sm:flex items-center hover:bg-gray-100 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <span className="font-medium text-sm">Manager Portal</span>
                </a>
              )}

              {/* Desktop Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center hover:bg-gray-100 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="mr-2 w-4 h-4" />
                <span className="font-medium text-sm">Sign Out</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setActiveTab(activeTab === 'dashboard' ? 'management' : 'dashboard')}
                className="md:hidden hover:bg-gray-100 p-2 rounded-md text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100 border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3 max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <p className={`${poppins.className} text-sm text-gray-700`}>
                Welcome back, <span className="font-semibold">{currentUser?.firstName} {currentUser?.lastName}</span>
                {currentUser?.role === 'ADMIN' && (
                  <span className="inline-flex items-center bg-blue-100 ml-2 px-2 py-0.5 rounded-full font-medium text-blue-800 text-xs">
                    Admin
                  </span>
                )}
              </p>
            </div>
            <div className="text-gray-500 text-sm">
              {userUsage && `${userUsage.remainingMinutes} minutes remaining`}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl">
        <div className="border-gray-200 border-b">
          <nav className="flex space-x-8 -mb-px">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('management')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'management'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              My Data
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            {/* Usage Stats */}
            {userUsage && (
              <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
                <h2 className={`${quicksand.className} text-lg font-semibold text-gray-900 mb-4`}>
                  Usage Statistics
                </h2>
                <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-blue-600 text-sm">Total Used</p>
                        <p className="font-semibold text-blue-900 text-lg">
                          {formatDuration(userUsage.totalSecondsUsed)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-green-600 text-sm">Remaining</p>
                        <p className="font-semibold text-green-900 text-lg">
                          {formatDuration(userUsage.remainingSeconds)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <MessageSquare className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-purple-600 text-sm">Granted</p>
                        <p className="font-semibold text-purple-900 text-lg">
                          {userUsage.grantedMinutes}m
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Phone className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-orange-600 text-sm">Used Today</p>
                        <p className="font-semibold text-orange-900 text-lg">
                          {userUsage.totalMinutesUsed}m
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VAPI Widget */}
            <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
              <h2 className={`${quicksand.className} text-lg font-semibold text-gray-900 mb-4`}>
                Start a Call
              </h2>
              <ClientOnly>
                <VAPIWidget
                  onCallEnd={onCallEnd}
                  remainingSeconds={userUsage?.remainingSeconds || 0}
                />
              </ClientOnly>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* My Conversations */}
            <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`${quicksand.className} text-lg font-semibold text-gray-900`}>
                  My Conversations
                </h2>
                <button
                  onClick={fetchConversations}
                  disabled={isLoadingConversations}
                  className="inline-flex items-center bg-green-600 hover:bg-green-700 disabled:opacity-50 px-3 py-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium text-white text-sm transition-colors"
                >
                  {isLoadingConversations ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {isLoadingConversations ? (
                <div className="py-8 text-center">
                  <div className="mx-auto border-green-600 border-b-2 rounded-full w-8 h-8 animate-spin"></div>
                  <p className="mt-2 text-gray-500">Loading conversations...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-8 text-center">
                  <MessageSquare className="mx-auto w-12 h-12 text-gray-400" />
                  <h3 className="mt-2 font-medium text-gray-900 text-sm">No conversations yet</h3>
                  <p className="mt-1 text-gray-500 text-sm">Start making calls to see your conversation history here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversations.map((conversation) => (
                    <div key={conversation.id} className="hover:bg-gray-50 p-4 border border-gray-200 rounded-lg transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="inline-flex items-center bg-green-100 px-2.5 py-0.5 rounded-full font-medium text-green-800 text-xs">
                              {formatDuration(conversation.duration)}
                            </span>
                            {conversation.grade && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${conversation.grade === 'A' ? 'bg-green-100 text-green-800' :
                                conversation.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                  conversation.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                    conversation.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                                      'bg-red-100 text-red-800'
                                }`}>
                                Grade: {conversation.grade}
                              </span>
                            )}
                            <span className="text-gray-500 text-sm">
                              {new Date(conversation.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {conversation.mergedTranscript ? (
                            <div className="space-y-2">
                              {JSON.parse(conversation.mergedTranscript).map((message: any, index: number) => (
                                <div key={index} className={`p-2 rounded ${message.role === 'user' ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50 border-l-4 border-gray-400'
                                  }`}>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${message.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                      }`}>
                                      {message.role === 'user' ? 'Me' : 'AI'}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-sm">{message.text}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-600 text-sm line-clamp-3">
                              {conversation.transcript || 'No transcript available'}
                            </p>
                          )}

                          {conversation.summary && (
                            <div className="bg-blue-50 mt-3 p-3 border-blue-400 border-l-4 rounded">
                              <p className="mb-1 font-medium text-blue-800 text-sm">Summary:</p>
                              <p className="text-blue-700 text-sm">{conversation.summary}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 