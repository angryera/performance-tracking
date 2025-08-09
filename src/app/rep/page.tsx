'use client'

import { useState, useEffect } from 'react'
import { Phone, User, Lock, LogIn, AlertCircle } from 'lucide-react'
import VAPIWidget from '@/components/VAPIWidget'
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

interface UserUsage {
  totalSecondsUsed: number
  grantedMinutes: number
  remainingSeconds: number
  totalMinutesUsed: number
  remainingMinutes: number
}

export default function RepPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null)

  // Check for existing session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
        setIsLoggedIn(true)
        // Fetch user usage data
        fetchUserUsage(user.id)
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('currentUser')
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

  const handleLogout = () => {
    setCurrentUser(null)
    setIsLoggedIn(false)
    setUserUsage(null)
    localStorage.removeItem('currentUser')
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
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        // Fetch user usage data
        fetchUserUsage(data.user.id)
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
      <div className={`${poppins.variable} ${quicksand.variable} flex justify-center items-center bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen`} suppressHydrationWarning>
        <div className="space-y-8 w-full max-w-md">
          <div className="text-center">
            <div className="flex justify-center items-center bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg mx-auto rounded-full w-16 h-16">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h2 className={`${quicksand.className} mt-6 font-bold text-gray-900 text-4xl tracking-tight`}>
              Sales Rep Portal
            </h2>
            <p className={`${poppins.className} mt-3 text-gray-600 text-base font-light`}>
              Sign in to access your performance dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 p-3 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="mr-2 w-4 h-4 text-red-600" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          <form className="space-y-6 mt-8" onSubmit={handleLogin}>
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className={`${poppins.className} block font-medium text-gray-700 text-sm mb-2`}>
                  Email Address
                </label>
                <div className="relative">
                  <User className="top-1/2 left-4 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={isLoading}
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className={`${poppins.className} block relative disabled:opacity-50 py-3 pr-4 pl-12 border border-gray-300 focus:border-green-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 w-full text-gray-900 appearance-none placeholder-gray-500 font-medium`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className={`${poppins.className} block font-medium text-gray-700 text-sm mb-2`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="top-1/2 left-4 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className={`${poppins.className} block relative disabled:opacity-50 py-3 pr-4 pl-12 border border-gray-300 focus:border-green-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 w-full text-gray-900 appearance-none placeholder-gray-500 font-medium`}
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`${poppins.className} group relative flex justify-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 px-6 py-3 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 w-full font-semibold text-white text-base disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200`}
              >
                <LogIn className="mr-3 w-5 h-5" />
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={`${poppins.variable} ${quicksand.variable} bg-gray-50 min-h-screen`} suppressHydrationWarning>
      {/* Header */}
      <header className="bg-slate-800 shadow-lg border-slate-700 border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex justify-center items-center bg-slate-600 mr-3 rounded-lg w-10 h-10">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className={`${quicksand.className} font-bold text-white text-2xl tracking-tight`}>
                  Sales Rep Dashboard
                </span>
                {currentUser && (
                  <span className={`${poppins.className} font-medium text-slate-300 text-sm`}>
                    Welcome, {currentUser.firstName} {currentUser.lastName}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser && (
                <div className="hidden md:flex items-center space-x-2 text-slate-300 text-sm">
                  <div className="bg-green-500 rounded-full w-2 h-2 animate-pulse"></div>
                  <span>Online</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className={`${poppins.className} bg-slate-600 hover:bg-slate-700 hover:shadow-md px-4 py-2 rounded-lg font-semibold text-white transition-colors duration-200`}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto sm:px-6 lg:px-8 py-6 max-w-7xl">
        <div className="px-4 sm:px-0 py-6">
          <div className="text-center">
            <h1 className={`${quicksand.className} mb-4 font-bold text-gray-900 text-4xl tracking-tight`}>
              Welcome to Your Sales Portal
            </h1>
            <p className={`${poppins.className} mb-8 text-gray-600 text-lg font-light`}>
              Start conversations with AI-powered bots to improve your sales skills
            </p>

            {/* VAPI Widget */}
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
              onCallEnd={async (duration, transcript) => {
                console.log('Call ended:', { duration, transcript })

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

                // Save conversation to database with AI analysis and accurate duration
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
                      duration, // Now using accurate duration from timestamps
                      grade,
                      summary
                    }),
                  })

                  if (response.ok) {
                    console.log('Conversation saved successfully with AI analysis and accurate duration:', duration)
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

            {/* Performance Summary */}
            <div className="gap-6 grid grid-cols-1 md:grid-cols-3 mx-auto mt-8 max-w-4xl">
              <div className="bg-white shadow-lg p-6 border border-gray-100 rounded-xl">
                <div className="text-center">
                  <div className={`${quicksand.className} font-bold text-gray-900 text-3xl mb-2`}>
                    {userUsage ? formatDuration(userUsage.totalSecondsUsed) : '0:00'}
                  </div>
                  <div className={`${poppins.className} text-gray-600 text-sm font-medium`}>Time Used</div>
                  {userUsage && (
                    <div className={`${poppins.className} text-gray-500 text-xs mt-1`}>
                      of {userUsage.grantedMinutes} min granted
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white shadow-lg p-6 border border-gray-100 rounded-xl">
                <div className="text-center">
                  <div className={`${quicksand.className} font-bold text-green-600 text-2xl mb-2`}>
                    {userUsage ? formatDuration(userUsage.remainingSeconds) : '0:00'}
                  </div>
                  <div className={`${poppins.className} text-gray-600 text-sm font-medium`}>Time Remaining</div>
                  {userUsage && userUsage.remainingMinutes <= 10 && (
                    <div className={`${poppins.className} text-orange-500 text-xs mt-1 font-medium`}>
                      Low balance
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white shadow-lg p-6 border border-gray-100 rounded-xl">
                <div className="text-center">
                  <div className={`${poppins.className} font-bold text-gray-900 text-lg mb-2`}>
                    {currentUser ? currentUser.email : 'N/A'}
                  </div>
                  <div className={`${poppins.className} text-gray-600 text-sm font-medium`}>Email</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Analyzing Overlay */}
      {isAnalyzing && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white shadow-2xl p-8 border border-gray-200 rounded-2xl max-w-md text-center">
            <div className="mx-auto mb-6 border-purple-400 border-b-2 rounded-full w-16 h-16 animate-spin"></div>
            <h3 className={`${quicksand.className} font-bold text-purple-600 text-2xl mb-3`}>
              Analyzing Performance
            </h3>
            <p className={`${poppins.className} text-gray-600 text-lg mb-6`}>
              AI is evaluating your conversation and generating insights...
            </p>
            <div className="space-y-3 text-left">
              <div className="flex items-center text-gray-500 text-sm">
                <div className="bg-purple-400 mr-3 rounded-full w-2 h-2"></div>
                Processing conversation transcript
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <div className="bg-purple-400 mr-3 rounded-full w-2 h-2"></div>
                Evaluating sales techniques
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <div className="bg-purple-400 mr-3 rounded-full w-2 h-2"></div>
                Generating performance grade
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saving Overlay */}
      {isSaving && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white shadow-2xl p-8 border border-gray-200 rounded-2xl max-w-md text-center">
            <div className="mx-auto mb-6 border-b-2 border-blue-400 rounded-full w-16 h-16 animate-spin"></div>
            <h3 className={`${quicksand.className} font-bold text-blue-600 text-2xl mb-3`}>
              Saving Conversation
            </h3>
            <p className={`${poppins.className} text-gray-600 text-lg mb-6`}>
              Storing your session data and updating your usage...
            </p>
            <div className="space-y-3 text-left">
              <div className="flex items-center text-gray-500 text-sm">
                <div className="bg-blue-400 mr-3 rounded-full w-2 h-2"></div>
                Saving conversation transcript
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <div className="bg-blue-400 mr-3 rounded-full w-2 h-2"></div>
                Storing performance analysis
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <div className="bg-blue-400 mr-3 rounded-full w-2 h-2"></div>
                Updating usage statistics
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message Overlay */}
      {showSuccess && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white shadow-2xl p-8 border border-gray-200 rounded-2xl max-w-md text-center">
            <div className="flex justify-center items-center bg-green-100 mx-auto mb-6 rounded-full w-16 h-16">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className={`${quicksand.className} font-bold text-green-800 text-2xl mb-3`}>
              Session Complete!
            </h3>
            <p className={`${poppins.className} text-green-700 text-lg`}>
              Your conversation has been analyzed and saved successfully.
            </p>
            <div className="space-y-2 mt-6 text-left">
              <div className="flex items-center text-gray-600 text-sm">
                <div className="bg-green-400 mr-3 rounded-full w-2 h-2"></div>
                Performance analysis completed
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <div className="bg-green-400 mr-3 rounded-full w-2 h-2"></div>
                Conversation saved to database
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <div className="bg-green-400 mr-3 rounded-full w-2 h-2"></div>
                Usage statistics updated
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 