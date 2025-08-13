'use client'

import { Copy, MessageSquare, RefreshCw, Send, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useVapiChat } from '../hooks/useVapiChat'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface VAPIChatWidgetProps {
  assistantId: string
  mode: string
  onTranscriptUpdate?: (transcript: string) => void
  onCallEnd?: (duration: number, transcript: string, mergedTranscript: Array<{ role: string, text: string }>) => void
}

export default function VAPIChatWidget({
  assistantId,
  mode,
  onTranscriptUpdate,
  onCallEnd
}: VAPIChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const messageListRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Initialize VAPI chat hook
  const {
    isLoading,
    error,
    currentChatId,
    sendMessage,
    startNewConversation,
    clearError,
    resetConversation
  } = useVapiChat({
    assistantId,
    initialVariables: {
      companyName: 'LevelRep',
      serviceType: 'sales training',
      customerTier: 'Premium',
      mode: mode
    },
    onError: (error) => {
      console.error('VAPI Chat error:', error)
    },
    onResponse: (response) => {
      // Add assistant response to messages
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      }
      setMessages(prev => {
        const updatedMessages = [...prev, newMessage]

        // Update transcript for parent component
        const transcriptText = updatedMessages
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n')
        onTranscriptUpdate?.(transcriptText)

        return updatedMessages
      })
    }
  })

  // Start chat session
  const startChat = async () => {
    if (!canStartChat()) {
      return
    }

    // Send initial greeting
    try {
      const initialMessage = `Hello! I'm here to help you with ${mode} training. How can I assist you today?`
      await startNewConversation(initialMessage)

      // Add initial message to display
      const greetingMessage: Message = {
        id: `msg_${Date.now()}_greeting`,
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date()
      }
      setMessages([greetingMessage])
    } catch (error) {
      console.error('Failed to start chat:', error)
    }
  }

  // End chat session
  const endChat = () => {
    const duration = 0 // No duration tracking needed

    // Create merged transcript for parent component
    const mergedTranscript = messages.map(msg => ({
      role: msg.role,
      text: msg.content
    }))

    const transcriptText = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')

    // Call parent callbacks
    onCallEnd?.(duration, transcriptText, mergedTranscript)
    setMessages([])
    resetConversation()
  }

  // Check if user can start a chat
  const canStartChat = () => {
    return true // No time restrictions
  }

  // Send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    // Add user message to display
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    // Send message to VAPI
    try {
      await sendMessage(inputMessage)
    } catch (error) {
      console.error('Failed to send message:', error)
      // Remove the message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Copy transcript
  const copyTranscript = () => {
    const transcriptText = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')
    navigator.clipboard.writeText(transcriptText)
  }

  // Clear messages
  const clearMessages = () => {
    setMessages([])
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    }
  }, [messages])

  // Auto-start chat when component mounts
  useEffect(() => {
    startChat()
  }, []) // Empty dependency array means this runs once when component mounts



  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm !mt-0 p-4">
      <div className="bg-gray-800 shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-700 rounded-2xl lg:rounded-3xl w-full max-w-6xl h-[700px] sm:h-[800px] sm:max-h-[80vh]">
        <div className="flex flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-green-500 rounded-full w-3 sm:w-4 h-3 sm:h-4 animate-pulse"></div>
              <h3 className="font-bold text-white text-lg sm:text-xl lg:text-3xl">
                {mode ? `${mode.charAt(0).toUpperCase() + mode.slice(1)} Chat` : 'VAPI Chat'}
              </h3>
            </div>
            <div className="flex items-center space-x-2 bg-gray-700 px-2 py-1 rounded-full">
              <div className="bg-green-500 rounded-full w-2 h-2 animate-pulse"></div>
              <span className="sm:hidden font-medium text-green-400 text-xs sm:text-sm">Live</span>
              <span className="hidden sm:block font-medium text-green-400 text-xs sm:text-sm">Live Session</span>
            </div>
          </div>
          <button
            onClick={endChat}
            className="bg-red-500 hover:bg-red-600 shadow-lg px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-white text-sm sm:text-base hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <div className="flex items-center space-x-1 sm:space-x-2">
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">End Chat</span>
              <span className="sm:hidden">End</span>
            </div>
          </button>
        </div>

        {/* Chat Interface */}
        <div className="flex flex-col h-[500px] sm:h-[550px] lg:h-[600px]">
          <div className="flex flex-col w-full h-full">
            {/* Error Display */}
            {error && (
              <div className="bg-red-100 mb-4 p-3 border border-red-400 rounded text-red-700">
                <p className="font-medium">Error: {error.message}</p>
                <button
                  onClick={clearError}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Chat Interface */}
            <div className="flex flex-col flex-1 bg-gray-900 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-500 rounded-full w-2 h-2 animate-pulse"></div>
                    <h4 className="font-semibold text-white text-lg">Live Chat</h4>
                  </div>
                  <span className="bg-green-900 bg-opacity-50 px-2 py-1 rounded-full font-medium text-green-400 text-xs">
                    {messages.length} messages
                  </span>
                  {isLoading && (
                    <span className="flex items-center bg-blue-900 bg-opacity-50 px-2 py-1 rounded-full font-medium text-blue-400 text-xs">
                      <RefreshCw className="mr-1 w-3 h-3 animate-spin" />
                      Typing...
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyTranscript}
                    className="hover:bg-gray-700 p-2 rounded-lg text-gray-300 hover:text-white transition-colors"
                    title="Copy transcript"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearMessages}
                    className="hover:bg-red-900 hover:bg-opacity-50 p-2 rounded-lg text-gray-300 hover:text-red-400 transition-colors"
                    title="Clear messages"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Display */}
              <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden">
                <div
                  ref={messageListRef}
                  className="p-4 h-100 h-full !max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700"
                >
                  {messages.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full text-gray-400">
                      <div className="flex justify-center items-center bg-gray-700 mb-3 rounded-full w-12 h-12">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <p className="font-medium text-sm">Starting conversation...</p>
                      <p className="mt-1 text-xs">Type your first message below</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                            : 'bg-gray-700 text-white border border-gray-600'
                            }`}>
                            <div className="flex items-start space-x-2">
                              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${message.role === 'user'
                                ? 'bg-white bg-opacity-20 text-white'
                                : 'bg-gray-500 text-gray-300'
                                }`}>
                                {message.role === 'user' ? 'U' : 'A'}
                              </div>
                              <div className="flex-1">
                                <div className="opacity-75 mb-1 font-medium text-xs text-left">
                                  {message.role === 'user' ? 'You' : `${mode} Assistant`}
                                </div>
                                <div className="text-sm text-left leading-relaxed">
                                  {message.content}
                                </div>
                                <div className="opacity-50 mt-1 text-xs">
                                  {message.timestamp.toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chat Footer */}
                <div className="bg-gray-700 px-4 py-3 border-gray-600 border-t">
                  <div className="flex justify-between items-center text-gray-300 text-xs">
                    <span>
                      {messages.length > 0 ? `${messages.length} message${messages.length !== 1 ? 's' : ''}` : 'No messages yet'}
                    </span>
                    <span>
                      {isLoading && (
                        <span className="flex items-center text-blue-400">
                          <RefreshCw className="mr-1 w-2 h-2 animate-spin" />
                          Assistant is typing...
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="flex space-x-2 mt-4">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="flex-1 bg-gray-700 px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-none placeholder-gray-400"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${!inputMessage.trim() || isLoading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 