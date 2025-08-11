'use client'

import { useState, useEffect } from 'react'
import { Phone, User, Lock, AlertCircle, BarChart3, MessageSquare, TrendingUp, LogOut, Eye, EyeOff, CheckCircle } from 'lucide-react'
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
  mergedTranscript?: object
  duration: number
  grade?: string
  summary?: string
  deleted?: boolean
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
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  // Check for existing session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
        setIsLoggedIn(true)
        fetchUserUsage(user.id)
        // Fetch conversations for all users (both admin and regular reps)
        fetchConversations()
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  // Auto-fetch conversations when switching to My Data tab
  useEffect(() => {
    if (activeTab === 'management' && currentUser && conversations.length === 0) {
      fetchConversations()
    }
  }, [activeTab, currentUser, conversations.length])

  // Periodic refresh of conversations every 2 minutes
  useEffect(() => {
    if (!currentUser) return

    const interval = setInterval(() => {
      if (activeTab === 'management') {
        fetchConversations()
      }
    }, 2 * 60 * 1000) // 2 minutes

    return () => clearInterval(interval)
  }, [currentUser, activeTab])

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
        // Fetch conversations for all users (both admin and regular reps)
        fetchConversations()
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
                className="flex items-center hover:bg-gray-100 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="mr-2 w-4 h-4" />
                <span className="font-medium text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100 border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3 max-w-7xl">
          <div className="flex sm:flex-row flex-col justify-between items-center">
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
            <ClientOnly>
            <VAPIWidget
              userId={currentUser?.id}
              remainingSeconds={userUsage?.remainingSeconds || 0}
              onTranscriptUpdate={(transcript) => {
                console.log('Transcript updated:', transcript)
              }}
              onTimeLimitReached={() => {
                console.log('Time limit reached, refreshing usage data...')
                if (currentUser?.id) {
                  fetchUserUsage(currentUser.id)
                }
              }}
                onCallEnd={async (duration, transcript, mergedTranscript) => {
                  console.log('Call ended:', { duration, transcript, mergedTranscript })

                // Analyze transcript with AI first
                let grade = null
                let summary = null

                setIsAnalyzing(true)
                try {
                  const analysisResponse = await fetch('/api/analyze-transcript', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ transcript }),
                  })

                  if (analysisResponse.ok) {
                    const analysis = await analysisResponse.json()
                    grade = analysis.grade
                    summary = analysis.summary
                    console.log('AI analysis completed:', analysis)
                  } else {
                    console.error('Failed to analyze transcript')
                  }
                } catch (error) {
                  console.error('Error analyzing transcript:', error)
                } finally {
                  setIsAnalyzing(false)
                }

                  // Save conversation to database with AI analysis, accurate duration, and merged transcript
                setIsSaving(true)
                try {
                  const response = await fetch('/api/conversations', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      userId: currentUser?.id,
                      transcript,
                        mergedTranscript, // Add the merged transcript with speaker identification
                      duration, // Now using accurate duration from timestamps
                      grade,
                      summary
                    }),
                  })

                  if (response.ok) {
                      console.log('Conversation saved successfully with AI analysis, accurate duration, and merged transcript:', duration)
                      // Refresh conversations for all users (both admin and regular reps)
                      fetchConversations()
                  } else {
                    console.error('Failed to save conversation')
                  }
                } catch (error) {
                  console.error('Error saving conversation:', error)
                } finally {
                  setIsSaving(false)
                  setShowSuccess(true)
                  setTimeout(() => setShowSuccess(false), 3000) // Hide after 3 seconds
                  // Refresh user usage data
                  if (currentUser?.id) {
                    fetchUserUsage(currentUser.id)
                  }
                }
              }}
            />
            </ClientOnly>
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
                <div className="space-y-3">
                  {conversations.map((conversation) => (
                    <div 
                      key={conversation.id} 
                      onClick={() => setSelectedConversation(conversation)}
                      className="hover:bg-gray-50 p-4 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                    >
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
                          
                          <p className="text-gray-600 text-sm">
                            Click to view full conversation details
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-3">
                          <Eye className="w-4 h-4 text-gray-400" />
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

      {/* Conversation Detail Modal */}
      {selectedConversation && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white shadow-2xl rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 sm:px-6 py-3 sm:py-4 text-white">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg sm:text-xl truncate">
                    Conversation Details
                  </h3>
                  <p className="mt-1 text-green-100 text-xs sm:text-sm truncate">
                    {formatDuration(selectedConversation.duration)} • {new Date(selectedConversation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="flex-shrink-0 hover:bg-white hover:bg-opacity-20 ml-2 p-1 sm:p-2 rounded-full text-white hover:text-green-100 transition-colors"
                >
                  <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Stats Cards */}
              <div className="gap-3 sm:gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4 sm:mb-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 border border-green-200 rounded-xl">
                  <div className="flex items-center">
                    <div className="bg-green-500 mr-2 sm:mr-3 p-1.5 sm:p-2 rounded-lg">
                      <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-green-600 text-xs sm:text-sm">Duration</p>
                      <p className="font-bold text-green-900 text-base sm:text-lg">{formatDuration(selectedConversation.duration)}</p>
                    </div>
                  </div>
                </div>

                {selectedConversation.grade && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 border border-blue-200 rounded-xl">
                    <div className="flex items-center">
                      <div className="bg-blue-500 mr-2 sm:mr-3 p-1.5 sm:p-2 rounded-lg">
                        <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-blue-600 text-xs sm:text-sm">Grade</p>
                        <p className={`text-base sm:text-lg font-bold ${
                          selectedConversation.grade === 'A' ? 'text-green-900' :
                          selectedConversation.grade === 'B' ? 'text-blue-900' :
                          selectedConversation.grade === 'C' ? 'text-yellow-900' :
                          selectedConversation.grade === 'D' ? 'text-orange-900' :
                          'text-red-900'
                        }`}>
                          {selectedConversation.grade}
                        </p>
                      </div>
                    </div>
                    </div>
                  )}

                <div className="sm:col-span-2 lg:col-span-1 bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 border border-purple-200 rounded-xl">
                  <div className="flex items-center">
                    <div className="bg-purple-500 mr-2 sm:mr-3 p-1.5 sm:p-2 rounded-lg">
                      <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-purple-600 text-xs sm:text-sm">Date</p>
                      <p className="font-bold text-purple-900 text-base sm:text-lg">
                        {new Date(selectedConversation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              {selectedConversation.summary && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center mb-2 sm:mb-3">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 mr-2 sm:mr-3 p-1.5 sm:p-2 rounded-lg">
                      <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-base sm:text-lg">AI Analysis Summary</h4>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-4 border border-amber-200 rounded-xl">
                    <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                      {selectedConversation.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Transcript Section */}
              <div>
                <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2 mb-2 sm:mb-3">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 mr-2 sm:mr-3 p-1.5 sm:p-2 rounded-lg">
                      <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-base sm:text-lg">Full Conversation Transcript</h4>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  {/* Transcript Content */}
                  <div className="max-h-64 sm:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <div className="p-3 sm:p-4">
                      <div className="space-y-3">
                        {selectedConversation.mergedTranscript ? (
                          // Use merged transcript with speaker identification
                          (selectedConversation.mergedTranscript as any[]).map((message: any, index: number) => {
                            const isUser = message.role === 'user';
                            return (
                              <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs sm:max-w-sm lg:max-w-md px-3 py-2 rounded-2xl ${isUser
                                  ? 'bg-green-500 text-white rounded-br-md' 
                                  : 'bg-gray-200 text-gray-800 rounded-bl-md'
                                }`}>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${isUser
                                      ? 'bg-green-400 bg-opacity-30 text-white' 
                                      : 'bg-gray-300 text-gray-700'
                                    }`}>
                                      {isUser ? 'Me' : 'AI'}
                                    </span>
                                  </div>
                                  <p className="text-sm leading-relaxed">{message.text}</p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          // Fallback to original transcript
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <p className="text-gray-600 text-sm">
                              {selectedConversation.transcript || 'No transcript available'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Transcript Footer */}
                  <div className="bg-gray-100 px-3 sm:px-4 py-2 border-gray-200 border-t">
                    <div className="flex justify-between items-center text-gray-500 text-xs">
                      <span>End of conversation</span>
                      <span>Duration: {formatDuration(selectedConversation.duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analyzing Overlay */}
      {isAnalyzing && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm !mt-0 p-4">
          <div className="bg-white shadow-2xl p-6 sm:p-8 border border-gray-200 rounded-2xl w-full max-w-sm sm:max-w-md text-center">
            <div className="mx-auto mb-4 sm:mb-6 border-purple-400 border-b-2 rounded-full w-12 sm:w-16 h-12 sm:h-16 animate-spin"></div>
            <h3 className={`${quicksand.className} font-bold text-purple-600 text-xl sm:text-2xl mb-2 sm:mb-3`}>
              Analyzing Performance
            </h3>
            <p className={`${poppins.className} text-gray-600 text-base sm:text-lg mb-4 sm:mb-6`}>
              AI is evaluating your conversation and generating insights...
            </p>
            <div className="space-y-2 sm:space-y-3 text-left">
              <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                <div className="flex-shrink-0 bg-purple-400 mr-2 sm:mr-3 rounded-full w-1.5 sm:w-2 h-1.5 sm:h-2"></div>
                <span>Processing conversation transcript</span>
              </div>
              <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                <div className="flex-shrink-0 bg-purple-400 mr-2 sm:mr-3 rounded-full w-1.5 sm:w-2 h-1.5 sm:h-2"></div>
                <span>Evaluating sales techniques</span>
              </div>
              <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                <div className="flex-shrink-0 bg-purple-400 mr-2 sm:mr-3 rounded-full w-1.5 sm:w-2 h-1.5 sm:h-2"></div>
                <span>Generating performance grade</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saving Overlay */}
      {isSaving && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm !mt-0 p-4">
          <div className="bg-white shadow-2xl p-6 sm:p-8 border border-gray-200 rounded-2xl w-full max-w-sm sm:max-w-md text-center">
            <div className="mx-auto mb-4 sm:mb-6 border-b-2 border-blue-400 rounded-full w-12 sm:w-16 h-12 sm:h-16 animate-spin"></div>
            <h3 className={`${quicksand.className} font-bold text-blue-600 text-xl sm:text-2xl mb-2 sm:mb-3`}>
              Saving Conversation
            </h3>
            <p className={`${poppins.className} text-gray-600 text-base sm:text-lg mb-4 sm:mb-6`}>
              Storing your session data and updating your usage...
            </p>
            <div className="space-y-2 sm:space-y-3 text-left">
              <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                <div className="flex-shrink-0 bg-blue-400 mr-2 sm:mr-3 rounded-full w-1.5 sm:w-2 h-1.5 sm:h-2"></div>
                <span>Saving conversation transcript</span>
              </div>
              <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                <div className="flex-shrink-0 bg-blue-400 mr-2 sm:mr-3 rounded-full w-1.5 sm:w-2 h-1.5 sm:h-2"></div>
                <span>Storing performance analysis</span>
              </div>
              <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                <div className="flex-shrink-0 bg-blue-400 mr-2 sm:mr-3 rounded-full w-1.5 sm:w-2 h-1.5 sm:h-2"></div>
                <span>Updating usage statistics</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message Overlay */}
      {showSuccess && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm !mt-0 p-4">
          <div className="bg-white shadow-2xl p-6 sm:p-8 border border-gray-200 rounded-2xl w-full max-w-sm sm:max-w-md text-center">
            <div className="flex justify-center items-center bg-green-100 mx-auto mb-4 sm:mb-6 rounded-full w-12 sm:w-16 h-12 sm:h-16">
              <svg className="w-6 sm:w-8 h-6 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className={`${quicksand.className} font-bold text-green-800 text-xl sm:text-2xl mb-2 sm:mb-3`}>
              Session Complete!
            </h3>
            <p className={`${poppins.className} text-green-700 text-base sm:text-lg`}>
              Your conversation has been analyzed and saved successfully.
            </p>
            <div className="space-y-1 sm:space-y-2 mt-4 sm:mt-6 text-left">
              <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                <div className="flex-shrink-0 bg-green-400 mr-2 sm:mr-3 rounded-full w-1.5 sm:w-2 h-1.5 sm:h-2"></div>
                <span>Performance analysis completed</span>
              </div>
              <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                <div className="flex-shrink-0 bg-green-400 mr-2 sm:mr-3 rounded-full w-1.5 sm:w-2 h-1.5 sm:h-2"></div>
                <span>Conversation saved to database</span>
              </div>
              <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                <div className="flex-shrink-0 bg-green-400 mr-2 sm:mr-3 rounded-full w-1.5 sm:w-2 h-1.5 sm:h-2"></div>
                <span>Usage statistics updated</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 