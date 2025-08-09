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

export default function RepPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // Check for existing session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
        setIsLoggedIn(true)
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('currentUser')
      }
    }
  }, [])

  const handleLogout = () => {
    setCurrentUser(null)
    setIsLoggedIn(false)
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
              onTranscriptUpdate={(transcript) => {
                console.log('Transcript updated:', transcript)
              }}
                            onCallEnd={async (duration, transcript) => {
                console.log('Call ended:', { duration, transcript })
                
                // Analyze transcript with AI first
                let grade = null
                let summary = null
                
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
                }
                
                // Save conversation to database with AI analysis and accurate duration
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
                }
              }}
            />

            {/* Performance Summary */}
            <div className="gap-6 grid grid-cols-1 md:grid-cols-3 mx-auto mt-8 max-w-4xl">
              <div className="bg-white shadow-lg p-6 border border-gray-100 rounded-xl">
                <div className="text-center">
                  <div className={`${quicksand.className} font-bold text-gray-900 text-3xl mb-2`}>
                    {currentUser ? currentUser.minutes : 0}
                  </div>
                  <div className={`${poppins.className} text-gray-600 text-sm font-medium`}>Minutes Used</div>
                </div>
              </div>
              <div className="bg-white shadow-lg p-6 border border-gray-100 rounded-xl">
                <div className="text-center">
                  <div className={`${quicksand.className} font-bold text-green-600 text-2xl mb-2`}>
                    {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'N/A'}
                  </div>
                  <div className={`${poppins.className} text-gray-600 text-sm font-medium`}>Your Name</div>
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
    </div>
  )
} 