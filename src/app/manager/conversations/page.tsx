'use client'

import { useState, useEffect } from 'react'
import { Eye, Search, Filter, Loader2, BarChart3, User, Lock, LogIn, AlertCircle } from 'lucide-react'
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

interface Conversation {
  id: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  transcript: string
  mergedTranscript?: Array<{role: string, text: string}>
  duration: number
  grade: string
  summary: string
  createdAt: string
}

export default function ConversationsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [conversationsError, setConversationsError] = useState<string | null>(null)
  const [transcriptSearch, setTranscriptSearch] = useState('')
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null)
  const [deletedConversations, setDeletedConversations] = useState<Conversation[]>([])
  const [showDeleted, setShowDeleted] = useState(false)
  const [isLoadingDeleted, setIsLoadingDeleted] = useState(false)

  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'hide' | 'restore'
    conversation: Conversation
    message: string
  } | null>(null)

  // Check for existing session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        if (user.role === 'ADMIN') {
          setCurrentUser(user)
          setIsLoggedIn(true)
          fetchConversations()
          fetchDeletedConversations()
        } else {
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

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
          fetchConversations()
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

  // Fetch conversations from database
  const fetchConversations = async () => {
    try {
      setIsLoadingConversations(true)
      setConversationsError(null)
      
      const response = await fetch('/api/conversations')
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }
      
      const data = await response.json()
      setConversations(data)
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setConversationsError('Failed to load conversations. Please try again.')
    } finally {
      setIsLoadingConversations(false)
    }
  }

  // Fetch deleted conversations
  const fetchDeletedConversations = async () => {
    try {
      setIsLoadingDeleted(true)
      const response = await fetch('/api/conversations?deleted=true')
      if (!response.ok) {
        throw new Error('Failed to fetch deleted conversations')
      }
      
      const data = await response.json()
      setDeletedConversations(data)
    } catch (err) {
      console.error('Error fetching deleted conversations:', err)
    } finally {
      setIsLoadingDeleted(false)
    }
  }

  // Handle hide/restore conversation
  const handleConversationAction = async (conversationId: string, action: 'hide' | 'restore') => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId, action }),
      })

      if (!response.ok) {
        throw new Error('Failed to update conversation')
      }

      // Refresh both conversation lists
      await Promise.all([fetchConversations(), fetchDeletedConversations()])
    } catch (err) {
      console.error('Error updating conversation:', err)
      alert(`Failed to ${action} conversation. Please try again.`)
    }
  }

  // Show confirmation modal
  const showConfirmation = (conversation: Conversation, action: 'hide' | 'restore') => {
    const actionText = action === 'hide' ? 'hide' : 'restore'
    const message = action === 'hide' 
      ? `Are you sure you want to hide the conversation with ${conversation.user.firstName} ${conversation.user.lastName}? This action can be undone.`
      : `Are you sure you want to restore the conversation with ${conversation.user.firstName} ${conversation.user.lastName}?`
    
    setConfirmAction({
      type: action,
      conversation,
      message
    })
    setShowConfirmModal(true)
  }

  // Execute confirmed action
  const executeConfirmedAction = async () => {
    if (!confirmAction) return
    
    try {
      const response = await fetch('/api/conversations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          conversationId: confirmAction.conversation.id, 
          action: confirmAction.type 
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update conversation')
      }

      // Refresh both conversation lists
      await Promise.all([fetchConversations(), fetchDeletedConversations()])
      
      // Close modal and reset
      setShowConfirmModal(false)
      setConfirmAction(null)
    } catch (err) {
      console.error('Error updating conversation:', err)
      alert(`Failed to ${confirmAction.type} conversation. Please try again.`)
    }
  }

  // Cancel confirmation
  const cancelConfirmation = () => {
    setShowConfirmModal(false)
    setConfirmAction(null)
  }

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGrade = selectedGrade === 'all' || conv.grade === selectedGrade
    return matchesSearch && matchesGrade
  })

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

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

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
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
              Sign in to access the conversations
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
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-gray-900 text-2xl sm:text-3xl">Conversations</h1>
          <p className="mt-1 text-gray-600 text-sm sm:text-base">View and analyze all conversation transcripts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow p-4 sm:p-6 rounded-lg">
        <div className="flex sm:flex-row flex-col gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
              <input
                type="text"
                placeholder="Search by rep name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2 pr-4 pl-10 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-sm sm:text-base"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="all">All Grades</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
              <option value="D">Grade D</option>
              <option value="F">Grade F</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingConversations && (
        <div className="flex justify-center items-center py-8 sm:py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600 animate-spin" />
            <span className="text-gray-600 text-sm sm:text-base">Loading conversations...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {conversationsError && (
        <div className="bg-red-50 p-3 sm:p-4 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex justify-center items-center bg-red-400 rounded-full w-4 sm:w-5 h-4 sm:h-5">
                <span className="text-white text-xs">!</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-red-800 text-sm sm:text-base">{conversationsError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Conversations Table */}
      {!isLoadingConversations && !conversationsError && (
        <>
          {conversations.length === 0 ? (
            <div className="bg-white shadow p-6 sm:p-8 rounded-lg">
              <div className="text-center">
                <div className="flex justify-center items-center bg-gray-100 mx-auto mb-4 rounded-full w-12 sm:w-16 h-12 sm:h-16">
                  <Eye className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400" />
                </div>
                <h3 className="mb-2 font-medium text-gray-900 text-base sm:text-lg">No conversations yet</h3>
                <p className="text-gray-600 text-sm sm:text-base">Conversations will appear here once sales reps start making calls.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="divide-y divide-gray-200 min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                        Rep
                      </th>
                      <th className="px-3 sm:px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-3 sm:px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-3 sm:px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-3 sm:px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredConversations.map((conversation) => (
                      <tr key={conversation.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900 text-xs sm:text-sm">
                              {conversation.user.firstName} {conversation.user.lastName}
                            </div>
                            <div className="max-w-32 sm:max-w-none text-gray-500 text-xs sm:text-sm truncate">{conversation.user.email}</div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                          {formatDuration(conversation.duration)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(conversation.grade)}`}>
                            {conversation.grade}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                          {new Date(conversation.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-6 py-4 font-medium text-xs sm:text-sm whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedConversation(conversation)}
                              className="inline-flex items-center bg-blue-100 hover:bg-blue-200 px-2 sm:px-3 py-1 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-blue-700 text-xs sm:text-sm leading-4"
                            >
                              <Eye className="mr-1 w-3 sm:w-4 h-3 sm:h-4" />
                              <span className="hidden sm:inline">View</span>
                            </button>
                            <button
                              onClick={() => showConfirmation(conversation, 'hide')}
                              className="inline-flex items-center bg-red-100 hover:bg-red-200 px-2 sm:px-3 py-1 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium text-red-700 text-xs sm:text-sm leading-4"
                            >
                              <svg className="mr-1 w-3 sm:w-4 h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                              <span className="hidden sm:inline">Hide</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Deleted Conversations Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-gray-200 border-b">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900 text-base sm:text-lg">Deleted Conversations</h3>
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className="inline-flex items-center bg-white hover:bg-gray-50 shadow-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-gray-700 text-sm leading-4"
            >
              {showDeleted ? 'Hide' : 'Show'} Deleted
            </button>
          </div>
        </div>
        
        {showDeleted && (
          <div className="overflow-x-auto">
            {isLoadingDeleted ? (
              <div className="flex justify-center items-center py-8">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="text-gray-600 text-sm">Loading deleted conversations...</span>
                </div>
              </div>
            ) : deletedConversations.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 text-center">
                <p className="text-gray-500 text-sm">No deleted conversations</p>
              </div>
            ) : (
              <table className="divide-y divide-gray-200 min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                      Rep
                    </th>
                    <th className="px-3 sm:px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-3 sm:px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-3 sm:px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 sm:px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deletedConversations.map((conversation) => (
                    <tr key={conversation.id} className="bg-gray-50 hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-500 text-xs sm:text-sm">
                            {conversation.user.firstName} {conversation.user.lastName}
                          </div>
                          <div className="max-w-32 sm:max-w-none text-gray-400 text-xs sm:text-sm truncate">{conversation.user.email}</div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-gray-500 text-xs sm:text-sm whitespace-nowrap">
                        {formatDuration(conversation.duration)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(conversation.grade)}`}>
                          {conversation.grade}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-gray-500 text-xs sm:text-sm whitespace-nowrap">
                        {new Date(conversation.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 font-medium text-xs sm:text-sm whitespace-nowrap">
                        <button
                          onClick={() => showConfirmation(conversation, 'restore')}
                          className="inline-flex items-center bg-green-100 hover:bg-green-200 px-2 sm:px-3 py-1 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium text-green-700 text-xs sm:text-sm leading-4"
                        >
                          <svg className="mr-1 w-3 sm:w-4 h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          <span className="hidden sm:inline">Restore</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm !mt-0 p-4">
          <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-4 ${
              confirmAction.type === 'hide' 
                ? 'bg-gradient-to-r from-red-500 to-pink-500' 
                : 'bg-gradient-to-r from-green-500 to-emerald-500'
            } text-white`}>
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 mr-3 p-2 rounded-lg">
                  {confirmAction.type === 'hide' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    Confirm {confirmAction.type === 'hide' ? 'Hide' : 'Restore'}
                  </h3>
                  <p className="opacity-90 text-sm">
                    {confirmAction.type === 'hide' ? 'Hide Conversation' : 'Restore Conversation'}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center mb-3">
                  <div className="flex justify-center items-center bg-gray-100 mr-3 rounded-full w-10 h-10">
                    <span className="font-medium text-gray-600 text-sm">
                      {confirmAction.conversation.user.firstName[0]}{confirmAction.conversation.user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {confirmAction.conversation.user.firstName} {confirmAction.conversation.user.lastName}
                    </p>
                    <p className="text-gray-500 text-sm">{confirmAction.conversation.user.email}</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {confirmAction.message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={cancelConfirmation}
                  className="flex-1 bg-white hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeConfirmedAction}
                  className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-colors ${
                    confirmAction.type === 'hide'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {confirmAction.type === 'hide' ? 'Hide' : 'Restore'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Modal */}
      {selectedConversation && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm !mt-0 p-4">
          <div className="bg-white shadow-2xl rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-3 sm:py-4 text-white">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg sm:text-xl truncate">
                    Conversation Transcript
                  </h3>
                  <p className="mt-1 text-blue-100 text-xs sm:text-sm truncate">
                    {selectedConversation.user.firstName} {selectedConversation.user.lastName} • {selectedConversation.user.email}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="flex-shrink-0 hover:bg-white hover:bg-opacity-20 ml-2 p-1 sm:p-2 rounded-full text-white hover:text-blue-100 transition-colors"
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

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 border border-blue-200 rounded-xl">
                  <div className="flex items-center">
                    <div className="bg-blue-500 mr-2 sm:mr-3 p-1.5 sm:p-2 rounded-lg">
                      <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-blue-600 text-xs sm:text-sm">Grade</p>
                      <p className={`text-base sm:text-lg font-bold ${getGradeColor(selectedConversation.grade).replace('bg-', 'text-').replace('-100', '-900')}`}>
                        {selectedConversation.grade}
                      </p>
                    </div>
                  </div>
                </div>

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
                  <div className="text-gray-500 text-xs sm:text-sm">
                    {selectedConversation.mergedTranscript ? 
                      `${selectedConversation.mergedTranscript.length} messages` : 
                      `${selectedConversation.transcript.split('\n').length} lines`
                    }
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  {/* Transcript Header */}
                  <div className="bg-gray-100 px-3 sm:px-4 py-2 border-gray-200 border-b">
                    <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-2 text-gray-600 text-xs sm:text-sm">
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <span>Scroll to read the full conversation</span>
                        <div className="flex items-center space-x-2">
                          <svg className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search in transcript..."
                            value={transcriptSearch}
                            onChange={(e) => setTranscriptSearch(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-24 sm:w-32 text-xs"
                          />
                        </div>
                      </div>
                      <span className="font-mono">
                        {Math.round(selectedConversation.transcript.length / 1000 * 10) / 10}k characters
                      </span>
                    </div>
                  </div>
                  
                  {/* Transcript Content */}
                  <div className="max-h-64 sm:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <div className="p-3 sm:p-4">
                      <div className="space-y-3">
                        {selectedConversation.mergedTranscript ? (
                          // Use merged transcript with speaker identification and chat bubbles
                          selectedConversation.mergedTranscript.length > 0 ? (
                            selectedConversation.mergedTranscript.map((message, index) => {
                              const isUser = message.role === 'user'
                              const isAssistant = message.role === 'assistant'
                              const hasSearchMatch = transcriptSearch && message.text.toLowerCase().includes(transcriptSearch.toLowerCase())
                              
                              return (
                                <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-xs sm:max-w-sm lg:max-w-md px-3 py-2 rounded-2xl ${
                                    isUser 
                                      ? 'bg-blue-500 text-white rounded-br-md' 
                                      : 'bg-gray-200 text-gray-800 rounded-bl-md'
                                  } ${hasSearchMatch ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''}`}>
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                        isUser 
                                          ? 'bg-blue-400 bg-opacity-30 text-white' 
                                          : 'bg-gray-300 text-gray-700'
                                      }`}>
                                        {isUser ? 'Me' : 'AI'}
                                      </span>
                                    </div>
                                    <p className="text-sm leading-relaxed">
                                      {transcriptSearch ? (
                                        <span dangerouslySetInnerHTML={{ 
                                          __html: highlightText(message.text || '\u00A0', transcriptSearch) 
                                        }} />
                                      ) : (
                                        message.text || '\u00A0'
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            // Show transcript text when mergedTranscript is empty array
                            <div className="bg-gray-100 p-3 rounded-lg">
                              <p className="text-gray-600 text-sm">
                                {transcriptSearch ? (
                                  <span dangerouslySetInnerHTML={{ 
                                    __html: highlightText(selectedConversation.transcript || 'No transcript available', transcriptSearch) 
                                  }} />
                                ) : (
                                  selectedConversation.transcript || 'No transcript available'
                                )}
                              </p>
                            </div>
                          )
                        ) : (
                          // Fallback to original transcript with chat bubble style
                          selectedConversation.transcript.split('\n').map((line, index) => {
                            const isUser = line.toLowerCase().includes('user:') || line.toLowerCase().includes('rep:')
                            const isAssistant = line.toLowerCase().includes('assistant:') || line.toLowerCase().includes('customer:')
                            const hasSearchMatch = transcriptSearch && line.toLowerCase().includes(transcriptSearch.toLowerCase())
                            
                            if (!line.trim()) return null
                            
                            return (
                              <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs sm:max-w-sm lg:max-w-md px-3 py-2 rounded-2xl ${
                                  isUser 
                                    ? 'bg-blue-500 text-white rounded-br-md' 
                                    : 'bg-gray-200 text-gray-800 rounded-bl-md'
                                } ${hasSearchMatch ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''}`}>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                      isUser 
                                        ? 'bg-blue-400 bg-opacity-30 text-white' 
                                        : 'bg-gray-300 text-gray-700'
                                    }`}>
                                      {isUser ? 'Me' : 'AI'}
                                    </span>
                                  </div>
                                  <p className="text-sm leading-relaxed">
                                    {transcriptSearch ? (
                                      <span dangerouslySetInnerHTML={{ 
                                        __html: highlightText(line || '\u00A0', transcriptSearch) 
                                      }} />
                                    ) : (
                                      line || '\u00A0'
                                    )}
                                  </p>
                                </div>
                              </div>
                            )
                          }).filter(Boolean)
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
    </div>
  )
} 