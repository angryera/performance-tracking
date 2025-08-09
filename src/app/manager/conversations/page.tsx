'use client'

import { useState } from 'react'
import { Eye, Search, Filter } from 'lucide-react'

interface Conversation {
  id: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  transcript: string
  duration: number
  grade: string
  summary: string
  createdAt: string
}

export default function ConversationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  // Mock data - replace with actual API call
  const conversations: Conversation[] = [
    {
      id: '1',
      user: { firstName: 'Tara', lastName: 'Buonforte', email: 'tarabuonforte@example.com' },
      transcript: 'This is a sample conversation transcript...',
      duration: 300,
      grade: 'A',
      summary: 'Excellent call with great rapport building and clear value proposition.',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      user: { firstName: 'Philip', lastName: 'Buonforte', email: 'philipbuonforte@gmail.com' },
      transcript: 'Another conversation transcript...',
      duration: 450,
      grade: 'B',
      summary: 'Good call with room for improvement in objection handling.',
      createdAt: '2024-01-15T09:15:00Z'
    }
  ]

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-gray-900 text-3xl">Conversations</h1>
          <p className="mt-1 text-gray-600">View and analyze all conversation transcripts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow p-6 rounded-lg">
        <div className="flex md:flex-row flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
              <input
                type="text"
                placeholder="Search by rep name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2 pr-4 pl-10 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500"
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

      {/* Conversations Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="divide-y divide-gray-200 min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Rep
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConversations.map((conversation) => (
                <tr key={conversation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {conversation.user.firstName} {conversation.user.lastName}
                      </div>
                      <div className="text-gray-500 text-sm">{conversation.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                    {formatDuration(conversation.duration)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(conversation.grade)}`}>
                      {conversation.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                    {new Date(conversation.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-sm whitespace-nowrap">
                    <button
                      onClick={() => setSelectedConversation(conversation)}
                      className="inline-flex items-center bg-blue-100 hover:bg-blue-200 px-3 py-1 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-blue-700 text-sm leading-4"
                    >
                      <Eye className="mr-1 w-4 h-4" />
                      View Transcript
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transcript Modal */}
      {selectedConversation && (
        <div className="z-50 fixed inset-0 bg-gray-600 bg-opacity-50 w-full h-full overflow-y-auto">
          <div className="top-20 relative bg-white shadow-lg mx-auto p-5 border rounded-md w-11/12 md:w-3/4 lg:w-1/2">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900 text-lg">
                  Transcript - {selectedConversation.user.firstName} {selectedConversation.user.lastName}
                </h3>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-gray-600 text-sm">
                  <span>Duration: {formatDuration(selectedConversation.duration)}</span>
                  <span>Grade: <span className={`px-2 py-1 rounded-full ${getGradeColor(selectedConversation.grade)}`}>{selectedConversation.grade}</span></span>
                  <span>Date: {new Date(selectedConversation.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div>
                  <h4 className="mb-2 font-medium text-gray-900">Summary</h4>
                  <p className="bg-gray-50 p-3 rounded-lg text-gray-700 text-sm">
                    {selectedConversation.summary}
                  </p>
                </div>
                
                <div>
                  <h4 className="mb-2 font-medium text-gray-900">Full Transcript</h4>
                  <div className="bg-gray-50 p-3 rounded-lg max-h-96 overflow-y-auto text-gray-700 text-sm">
                    {selectedConversation.transcript}
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