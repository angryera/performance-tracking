'use client'

import { config } from '@/lib/config'
import { formatDuration, formatTimestamp, getMessageAge } from '@/lib/utils'
import { AnamEvent, createClient } from '@anam-ai/js-sdk'
import { AlertCircle, Clock, Mic, MicOff, Phone, Play, Square, MessageSquare } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import AnamVideoWidget from './AnamVideoWidget'
import { ConnectingOverlay, ProcessingOverlay } from './Overlays'
import ErrorToast from './Toast'
import VAPISessionTypeSelector from './VAPISessionTypeSelector'
import VAPIChatWidget from './VAPIChatWidget'

import createSessionToken from './helpers/AnamSessionToken'
import scrollToBottomHelper from './helpers/ScrollToBottom'
import { getAllMessages, getMergedTranscript } from './helpers/Transcript'
import useVAPIEventListener from './hooks/useVAPIEventListener'
import VAPIWidget from './VAPIWidget'

interface CallWidgetProps {
  onTranscriptUpdate?: (transcript: string) => void
  onCallEnd?: (duration: number, transcript: string, mergedTranscript: Array<{ role: string, text: string }>) => void
  remainingSeconds?: number
  onTimeLimitReached?: () => void
}

export default function CallWidget({
  onTranscriptUpdate,
  onCallEnd,
  remainingSeconds = 0,
  onTimeLimitReached
}: CallWidgetProps) {
  const [vapi, setVapi] = useState<any>(null)
  const [isCallActive, setIsCallActive] = useState(false)
  const [selectedMode, setSelectedMode] = useState<string>('practice')
  const [transcript, setTranscript] = useState<{ role: string, text: string }[]>([])
  const transcriptRef = useRef<{ role: string, text: string }[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuteProcessing, setIsMuteProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backendResponse, setBackendResponse] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const activeModeRef = useRef<string | null>(null)
  const [currentCallId, setCurrentCallId] = useState<string | null>(null)
  const [callStartTime, setCallStartTime] = useState<Date | null>(null)
  const [displayDuration, setDisplayDuration] = useState<number>(0)
  const currentCallIdRef = useRef<string | null>(null)
  const callStartTimeRef = useRef<Date | null>(null)
  const timeLimitReachedRef = useRef<boolean>(false)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const currentCallRef = useRef<any>(null) // Store reference to VAPI call object

  // Anam video assistant states
  const [showAnamChat, setShowAnamChat] = useState(false)
  const [anamStatus, setAnamStatus] = useState('')
  const [anamClient, setAnamClient] = useState<any>(null)
  const [conversationHistory, setConversationHistory] = useState<any[]>([])
  const [userMessages, setUserMessages] = useState<any[]>([])
  const [userInput, setUserInput] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false)
  const [messageIdCounter, setMessageIdCounter] = useState(0)
  const [showVapiSessionTypeSelector, setShowVapiSessionTypeSelector] = useState(false)
  const [selectedVapiSessionType, setSelectedVapiSessionType] = useState<'chat' | 'talk'>('talk')
  const [pendingVapiMode, setPendingVapiMode] = useState<string>('')
  const [isVapiChatActive, setIsVapiChatActive] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const messageListRef = useRef<HTMLDivElement>(null)

  // Mock functions for VAPI Chat integration (these would be passed from parent component)
  const currentUser = { id: 'mock-user-id' } // This should come from parent
  const fetchConversations = () => {
    console.log('Mock fetchConversations called')
    // This should be implemented by parent component
  }
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const conversationHistoryRef = useRef<any[]>([])

  const showErrorToast = (message: string) => {
    setError(message)
    setTimeout(() => setError(null), config.ui.timeouts.errorToastDuration)
  }

  // Check if user has enough time to start a call
  const canStartCall = () => {
    return remainingSeconds > 0 && !timeLimitReachedRef.current
  }

  // Check time limit during call
  const checkTimeLimit = () => {
    if (!isCallActive || !callStartTimeRef.current || timeLimitReachedRef.current) return

    const currentTime = new Date()
    const elapsedSeconds = Math.floor((currentTime.getTime() - callStartTimeRef.current.getTime()) / 1000)
    const remainingAfterCall = remainingSeconds - elapsedSeconds

    if (remainingAfterCall <= 0) {
      console.log('⏰ Time limit reached! Stopping call...')
      timeLimitReachedRef.current = true
      endCall()
      onTimeLimitReached?.()
      showErrorToast('Time limit reached! Call has been automatically ended.')
    }
  }

  // Check if VAPI supports mute/unmute methods
  const vapiSupportsAudioControl = () => {
    if (!vapi) return false

    // Check for both mute and unmute methods on instance and prototype
    const hasMute = typeof vapi.setMuted === 'function' ||
      typeof vapi.mute === 'function' ||
      typeof Object.getPrototypeOf(vapi)?.setMuted === 'function'
    const hasUnmute = typeof vapi.setMuted === 'function' ||
      typeof vapi.unmute === 'function' ||
      typeof Object.getPrototypeOf(vapi)?.setMuted === 'function'

    return hasMute && hasUnmute
  }

  // Mute/unmute functionality
  const toggleMute = async () => {
    if (isMuteProcessing) return // Prevent multiple simultaneous mute operations

    setIsMuteProcessing(true)
    try {
      const currentMode = activeModeRef.current

      if (currentMode === 'sell') {
        // For Anam video calls, use local audio stream control
        await handleAnamMute(!isMuted)
      } else {
        // For VAPI calls, try VAPI methods first, then fallback
        await handleVAPIMute(!isMuted)
      }

    } catch (error) {
      console.error('Error toggling mute:', error)
      showErrorToast('Failed to toggle mute. Please try again.')
    } finally {
      setIsMuteProcessing(false)
    }
  }

  // Handle mute for Anam video calls
  const handleAnamMute = async (mute: boolean) => {
    try {
      if (!audioStreamRef.current) {
        await getUserMedia()

        if (!audioStreamRef.current) {
          throw new Error('Cannot access microphone for Anam mode')
        }
      }

      // Enable/disable all audio tracks
      audioStreamRef.current.getTracks().forEach(track => {
        if (track.kind === 'audio') {
          track.enabled = !mute
        }
      })

      setIsMuted(mute)
    } catch (error) {
      console.error('Anam mute control failed:', error)
      throw error
    }
  }

  // Handle mute for VAPI calls
  const handleVAPIMute = async (mute: boolean) => {
    if (!vapi) {
      throw new Error('VAPI not initialized')
    }

    // For VAPI calls, we should use the call object's mute functionality
    // The call object has isMuted and setMuted methods
    try {
      // First try: use VAPI instance setMuted method (on prototype)
      if (typeof vapi.setMuted === 'function') {
        await vapi.setMuted(mute)
        setIsMuted(mute)
        return
      }

      // Second try: use the stored call object reference
      const currentCall = currentCallRef.current

      if (currentCall && typeof currentCall.setMuted === 'function') {
        await currentCall.setMuted(mute)
        setIsMuted(mute)
        return
      }

      // Third try: try VAPI instance methods if call object doesn't have setMuted
      if (vapiSupportsAudioControl()) {
        try {
          if (mute) {
            await vapi.mute()
          } else {
            await vapi.unmute()
          }
          setIsMuted(mute)
          return
        } catch (vapiError) {
          console.warn('VAPI instance audio control failed, falling back to local stream control:', vapiError)
          // Fall through to fallback method
        }
      }

      // Final fallback: use local audio stream control
      await fallbackMuteControl(mute)
    } catch (error) {
      console.error('VAPI mute control failed:', error)
      // Fall back to local stream control
      await fallbackMuteControl(mute)
    }
  }

  // Fallback mute control for when VAPI methods fail
  const fallbackMuteControl = async (mute: boolean) => {
    try {
      if (!audioStreamRef.current) {
        await getUserMedia()

        if (!audioStreamRef.current) {
          throw new Error('Cannot access microphone for fallback control')
        }
      }

      // Enable/disable all audio tracks
      audioStreamRef.current.getTracks().forEach(track => {
        if (track.kind === 'audio') {
          track.enabled = !mute
        }
      })

      setIsMuted(mute)
    } catch (error) {
      console.error('Fallback mute control failed:', error)
      throw error
    }
  }

  // Get user media for mute functionality
  const getUserMedia = async () => {
    try {
      // Don't stop existing stream if it's already working
      if (audioStreamRef.current && audioStreamRef.current.active) {
        return audioStreamRef.current
      }

      // Stop existing stream if it's not active
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
        audioStreamRef.current = null
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Optimize for speech
          channelCount: 1 // Mono for better speech recognition
        }
      })

      audioStreamRef.current = stream

      // Set initial mute state based on current state
      if (isMuted) {
        stream.getAudioTracks().forEach(track => {
          track.enabled = false
        })
      }

      return stream
    } catch (error: any) {
      console.error('Error getting user media:', error)

      // Provide specific error messages based on error type
      if (error.name === 'NotAllowedError') {
        showErrorToast('Microphone access denied. Please allow microphone permissions and try again.')
      } else if (error.name === 'NotFoundError') {
        showErrorToast('No microphone found. Please check your device and try again.')
      } else if (error.name === 'NotReadableError') {
        showErrorToast('Microphone is already in use by another application. Please close other apps and try again.')
      } else {
        showErrorToast('Failed to access microphone. Please check permissions and try again.')
      }

      return null
    }
  }

  const startCall = async (mode: string) => {
    // Check if user has enough time
    if (!canStartCall()) {
      showErrorToast('No time remaining. Please contact your manager to add more time.')
      return
    }

    activeModeRef.current = mode
    setIsConnecting(true)
    setError(null)
    timeLimitReachedRef.current = false

    // Reset transcript state for new call
    setTranscript([])
    transcriptRef.current = []

    // Reset mute state for new call
    setIsMuted(false)

    // If it's sell mode, show Anam video assistant instead of VAPI
    if (mode === 'sell') {
      // Get user media for Anam video calls and mute functionality
      await getUserMedia()
      startAnamChat()
      return
    }

    // For VAPI modes, show session type selector
    setPendingVapiMode(mode)
    setShowVapiSessionTypeSelector(true)
    setIsConnecting(false)
    return
  }

  const startVapiCall = async () => {
    if (!pendingVapiMode) {
      showErrorToast('No VAPI mode selected. Please try again.')
      return
    }

    const mode = pendingVapiMode
    const assistantId = config.vapi.assistants[mode as keyof typeof config.vapi.assistants]

    // Handle different session types
    if (selectedVapiSessionType === 'chat') {
      // Start VAPI chat mode
      setIsVapiChatActive(true)
      setIsCallActive(false) // Ensure voice call is not active
      activeModeRef.current = mode

      // Set start time for chat
      const startTime = new Date()
      setCallStartTime(startTime)
      callStartTimeRef.current = startTime

      // Reset transcript state for new chat
      setTranscript([])
      transcriptRef.current = []

      setIsConnecting(false)
      return
    } else {
      // Start VAPI voice call mode
      if (!vapi) {
        showErrorToast('VAPI not initialized. Please refresh the page and try again.')
        return
      }

      setIsConnecting(true)
      setIsVapiChatActive(false) // Ensure chat mode is not active

      try {
        // For VAPI calls, we need to get user media for mute functionality
        // even though VAPI handles the call audio internally
        await getUserMedia()

        // Start the call and get the call ID
        const call = await vapi.start(assistantId)

        // Store the call object reference for mute functionality
        currentCallRef.current = call

        // Set the call ID if available
        if (call?.id) {
          setCurrentCallId(call.id)
          currentCallIdRef.current = call.id
        } else {
          // Fallback: generate a unique call ID
          const fallbackId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          setCurrentCallId(fallbackId)
          currentCallIdRef.current = fallbackId
        }

        // Set start time
        const startTime = new Date()
        setCallStartTime(startTime)
        callStartTimeRef.current = startTime

      } catch (error) {
        console.error('Error starting call:', error)
        setError('Failed to start call. Please try again.')
        setIsConnecting(false)
      }
    }
  }

  const endCall = () => {
    // Clean up audio stream
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      audioStreamRef.current = null
    }

    // Reset mute state
    setIsMuted(false)

    // Clear call reference
    currentCallRef.current = null

    if (activeModeRef.current === 'sell') {
      endAnamChat()
    } else if (isVapiChatActive) {
      // End VAPI chat mode
      setIsVapiChatActive(false)
    } else if (vapi && isCallActive) {
      try {
        vapi.stop()
      } catch (error) {
        console.warn('Error stopping VAPI call:', error)
      }
    }

    // Reset active mode and session type selectors
    activeModeRef.current = null
    setShowVapiSessionTypeSelector(false)
    setSelectedVapiSessionType('talk')
    setPendingVapiMode('')
    setIsCallActive(false)
  }

  const startAnamChat = async () => {
    const maxRetries = 5

    for (let i = 0; i < maxRetries; i++) {
      try {
        setAnamStatus("Creating session...")
        setShowAnamChat(true)

        const sessionToken = await createSessionToken()
        setAnamStatus("Connecting...")

        // Create Anam client
        const client = createClient(sessionToken)

        // Set up message history listener
        client.addListener(AnamEvent.MESSAGE_HISTORY_UPDATED, (messages: any[]) => {
          const newMessages = messages.map((msg, index) => {
            if (index >= conversationHistoryRef.current.length) {
              return {
                ...msg,
                timestamp: new Date().toISOString()
              }
            } else {
              return {
                ...msg,
                timestamp: conversationHistoryRef.current[index].timestamp
              }
            }
          })

          // Update both ref and state
          conversationHistoryRef.current = newMessages
          setConversationHistory(newMessages)
        })

        if (videoRef.current) {
          await client.streamToVideoElement(config.video.elementId)
          setAnamClient(client)

          setIsCallActive(true)
          setIsConnecting(false)
          setAnamStatus(`Connected! Start speaking to ${config.anam.persona.name}`)

          // Send initial greeting after connection is established
          try {
            const initialMessage = "Hello, how can you help me today?"
            console.log('📤 Sending initial greeting:', initialMessage)

            // Add the initial message to user messages
            const userMessageId = `user_${Date.now()}_init`
            const userMessage = {
              id: userMessageId,
              role: 'user',
              content: initialMessage,
              timestamp: new Date().toISOString(),
              source: 'user'
            }
            setUserMessages([userMessage])

            await client.sendUserMessage(initialMessage)
          } catch (error) {
            console.warn('Failed to send initial greeting:', error)
          }

          return // Success, exit the retry loop
        }
      } catch (error) {
        console.error(`Connection attempt ${i + 1} failed:`, error)

        // If this is the last retry, show error and exit
        if (i === maxRetries - 1) {
          setAnamStatus("Failed to connect. Please try again.")
          setIsConnecting(false)
          showErrorToast('Failed to connect to video assistant after multiple attempts. Please try again.\nError: ' + (error as Error).toString())
          return
        }

        // Wait before retrying with exponential backoff
        const delay = Math.pow(2, i) * 1000 // 1s, 2s, 4s
        setAnamStatus(`Connection failed, retrying in ${delay / 1000}s... (${i + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  const endAnamChat = () => {
    if (anamClient) {
      anamClient.stopStreaming()
      setAnamClient(null)
    }

    setShowAnamChat(false)
    setIsCallActive(false)
    setAnamStatus('')
    setConversationHistory([])
    setUserMessages([])
    setUserInput('')
    setIsAssistantSpeaking(false)
    conversationHistoryRef.current = []
    activeModeRef.current = null
  }

  const sendTextMessage = async () => {
    if (!userInput.trim() || !anamClient || isSendingMessage) return

    const messageText = userInput.trim()
    setIsSendingMessage(true)

    try {
      // Add user message to user messages array
      const userMessageId = `user_${Date.now()}_${messageIdCounter}`
      const userMessage = {
        id: userMessageId,
        role: 'user',
        content: messageText,
        timestamp: new Date().toISOString(),
        source: 'user'
      }

      setUserMessages(prev => [...prev, userMessage])
      setUserInput('')
      setMessageIdCounter(prev => prev + 1)

      console.log('📤 Sending user message:', messageText)
      await anamClient.sendUserMessage(messageText)

    } catch (error) {
      console.error('Failed to send message:', error)
      showErrorToast('Failed to send message. Please try again.')

      // Remove the message from user messages if sending failed
      setUserMessages(prev => prev.filter(msg => msg.content !== messageText))
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendTextMessage()
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isCallActive && callStartTimeRef.current) {
      interval = setInterval(() => {
        const currentTime = new Date()
        const duration = Math.floor((currentTime.getTime() - callStartTimeRef.current!.getTime()) / 1000)
        setDisplayDuration(duration)
        checkTimeLimit() // Check time limit during the interval
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isCallActive])


  // Auto-scroll when messages change
  useEffect(() => {
    // Use setTimeout to ensure DOM has updated
    const timer = setTimeout(() => {
      scrollToBottomHelper(messageListRef, inputRef)
    }, 100)

    return () => clearTimeout(timer)
  }, [conversationHistory, userMessages])


  const mergedTranscript = getMergedTranscript(transcriptRef)
  const allMessages = getAllMessages(userMessages, conversationHistoryRef)

  useVAPIEventListener({
    setVapi,
    setIsCallActive,
    setIsConnecting,
    setTranscript,
    setBackendResponse,
    setError,
    setIsSpeaking,
    setIsProcessing,
    onCallEnd,
    onTranscriptUpdate,
    getMergedTranscript,
    showErrorToast,
    transcriptRef,
    currentCallIdRef,
    callStartTimeRef,
    activeModeRef,
    setCurrentCallId,
    setCallStartTime,
  })

  return (
    <>
      <div className="bg-white mx-auto p-6 rounded-lg max-w-7xl">
        {/* Training Mode Selection */}
        {!isCallActive && (
          <div className="mb-6">
            <h3 className="mb-4 font-semibold text-gray-900 text-lg">Select Training Mode</h3>
            <div className="gap-4 grid grid-cols-2 md:grid-cols-4">
              {config.ui.trainingModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${selectedMode === mode.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="text-center">
                    <div className="flex justify-center items-center bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto mb-2 rounded-lg w-8 h-8">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm">{mode.title}</h4>
                    <p className="mt-1 text-gray-600 text-xs">{mode.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="mb-6 text-center">
          {/* Time Remaining Display */}
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">
              Time Remaining: {formatDuration(remainingSeconds)}
            </span>
            {remainingSeconds <= 0 && (
              <div className="flex items-center ml-2 text-red-600">
                <AlertCircle className="mr-1 w-4 h-4" />
                <span className="font-medium text-sm">No time available</span>
              </div>
            )}
            {remainingSeconds > 0 && remainingSeconds <= 300 && (
              <div className="flex items-center ml-2 text-orange-600">
                <AlertCircle className="mr-1 w-4 h-4" />
                <span className="font-medium text-sm">Low time remaining</span>
              </div>
            )}
          </div>

          {!isCallActive ? (
            <button
              onClick={() => startCall(selectedMode)}
              disabled={!canStartCall()}
              className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${canStartCall()
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
            >
              <Play className="mr-2 w-5 h-5" />
              {canStartCall()
                ? `Start ${config.ui.trainingModes.find(m => m.id === selectedMode)?.title} Session`
                : 'No Time Available'
              }
            </button>
          ) : (
            <>
              {/* Mode Indicator */}
              <div className="mb-4">
                <div className="inline-flex items-center bg-blue-100 px-3 py-1 rounded-full font-medium text-blue-800 text-sm">
                  {isVapiChatActive ? (
                    <>
                      <MessageSquare className="mr-2 w-4 h-4" />
                      Chat Mode Active
                    </>
                  ) : (
                    <>
                      <Phone className="mr-2 w-4 h-4" />
                      Voice Call Active
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-center items-center space-x-4">
                <div className="font-semibold text-gray-900 text-lg">
                  {formatDuration(displayDuration)}
                </div>

                {/* Mute Button - Only show when NOT in chat mode */}
                {!isVapiChatActive && (
                  <button
                    onClick={toggleMute}
                    disabled={isMuteProcessing}
                    className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${isMuted
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                      } ${isMuteProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={`${isMuted ? 'Unmute' : 'Mute'} microphone (${activeModeRef.current || 'unknown'} mode)`}
                  >
                    {isMuteProcessing ? (
                      <>
                        <div className="mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></div>
                        {isMuted ? 'Unmuting...' : 'Muting...'}
                      </>
                    ) : isMuted ? (
                      <>
                        <MicOff className="mr-2 w-4 h-4" />
                        Muted
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 w-4 h-4" />
                        Mute
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={endCall}
                  className="inline-flex items-center bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium text-white transition-colors"
                >
                  <Square className="mr-2 w-4 h-4" />
                  {isVapiChatActive ? 'End Chat' : 'End Call'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* VAPI Voice Call Widget - Only show when NOT in chat mode */}
        {!isVapiChatActive && isCallActive && (
          <VAPIWidget
            isCallActive={isCallActive}
            transcript={transcript}
            isMuted={isMuted}
            isMuteProcessing={isMuteProcessing}
            getMergedTranscript={() => mergedTranscript}
            setTranscript={setTranscript}
            isSpeaking={isSpeaking}
          />
        )}
      </div>

      {/* Anam Video Assistant Modal */}
      {showAnamChat && (
        <AnamVideoWidget
          config={config}
          endAnamChat={endAnamChat}
          videoRef={videoRef}
          messageListRef={messageListRef}
          getAllMessages={() => allMessages}
          isAssistantSpeaking={isAssistantSpeaking}
          anamStatus={anamStatus}
          userInput={userInput}
          setUserInput={setUserInput}
          handleKeyPress={handleKeyPress}
          sendTextMessage={sendTextMessage}
          isSendingMessage={isSendingMessage}
          inputRef={inputRef}
          formatTimestamp={formatTimestamp}
          getMessageAge={getMessageAge}
        />
      )}

      {/* VAPI Voice Call Modal */}
      {!isVapiChatActive && isCallActive && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm !mt-0 p-4">
          <div className="bg-gray-800 shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-700 rounded-2xl lg:rounded-3xl w-full max-w-6xl h-[700px] sm:h-[800px] sm:max-h-[80vh]">
            <div className="flex flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6 lg:mb-8">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-blue-500 rounded-full w-3 sm:w-4 h-3 sm:h-4 animate-pulse"></div>
                  <h3 className="font-bold text-white text-lg sm:text-xl lg:text-3xl">
                    {activeModeRef.current ? `${activeModeRef.current.charAt(0).toUpperCase() + activeModeRef.current.slice(1)} Voice Call` : 'VAPI Voice Call'}
                  </h3>
                </div>
                <div className="flex items-center space-x-2 bg-gray-700 px-2 py-1 rounded-full">
                  <div className="bg-green-500 rounded-full w-2 h-2 animate-pulse"></div>
                  <span className="sm:hidden font-medium text-green-400 text-xs sm:text-sm">Live</span>
                  <span className="hidden sm:block font-medium text-green-400 text-xs sm:text-sm">Live Session</span>
                </div>
              </div>
              <button
                onClick={endCall}
                className="bg-red-500 hover:bg-red-600 shadow-lg px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-white text-sm sm:text-base hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="hidden sm:inline">End Call</span>
                  <span className="sm:hidden">End</span>
                </div>
              </button>
            </div>

            {/* Voice Call Interface */}
            <div className="flex flex-col h-[500px] sm:h-[550px] lg:h-[600px]">
              <div className="mb-3 sm:mb-4 lg:mb-6 text-center">
                <h4 className="mb-1 sm:mb-2 font-semibold text-white text-base sm:text-lg lg:text-xl">Voice Call</h4>
                <p className="hidden sm:block text-gray-300 text-xs sm:text-sm">Speak naturally with the AI assistant</p>
              </div>

              {/* Call Controls */}
              <div className="flex justify-center items-center space-x-4 mb-4">
                <div className="font-semibold text-white text-lg">
                  {formatDuration(displayDuration)}
                </div>

                {/* Mute Button */}
                <button
                  onClick={toggleMute}
                  disabled={isMuteProcessing}
                  className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${isMuted
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                    } ${isMuteProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={`${isMuted ? 'Unmute' : 'Mute'} microphone`}
                >
                  {isMuteProcessing ? (
                    <>
                      <div className="mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></div>
                      {isMuted ? 'Unmuting...' : 'Muting...'}
                    </>
                  ) : isMuted ? (
                    <>
                      <MicOff className="mr-2 w-4 h-4" />
                      Muted
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 w-4 h-4" />
                      Mute
                    </>
                  )}
                </button>
              </div>

              {/* Transcript Display */}
              <div className="flex-1 bg-gray-900 p-4 rounded-xl lg:rounded-2xl overflow-y-auto">
                <VAPIWidget
                  isCallActive={isCallActive}
                  transcript={transcript}
                  isMuted={isMuted}
                  isMuteProcessing={isMuteProcessing}
                  getMergedTranscript={() => mergedTranscript}
                  setTranscript={setTranscript}
                  isSpeaking={isSpeaking}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VAPI Chat Modal */}
      {isVapiChatActive && (
        <VAPIChatWidget
          assistantId={config.vapi.assistants[activeModeRef.current as keyof typeof config.vapi.assistants] || ''}
          mode={activeModeRef.current || ''}
          onTranscriptUpdate={(transcript) => {
            console.log('VAPI Chat transcript updated:', transcript)
          }}
          onCallEnd={async (duration, transcript, mergedTranscript) => {
            setIsVapiChatActive(false)
            console.log('VAPI Chat ended:', { duration, transcript, mergedTranscript })

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

            // Save conversation to database with AI analysis
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
                  mergedTranscript,
                  duration,
                  grade,
                  summary
                }),
              })

              if (response.ok) {
                console.log('VAPI Chat conversation saved successfully with AI analysis')
                // Refresh conversations for all users (both admin and regular reps)
                fetchConversations()
              } else {
                console.error('Failed to save VAPI Chat conversation')
              }
            } catch (error) {
              console.error('Error saving VAPI Chat conversation:', error)
            } finally {
              setIsSaving(false)
              setShowSuccess(true)
              setTimeout(() => setShowSuccess(false), 3000) // Hide after 3 seconds

              // Refresh user usage data
              if (currentUser?.id) {
                fetchConversations()
              }
            }
          }}
        />
      )}

      {/* Session Type Selector Modal */}
      {showVapiSessionTypeSelector && (
        <VAPISessionTypeSelector
          pendingVapiMode={pendingVapiMode}
          setSelectedVapiSessionType={setSelectedVapiSessionType}
          selectedVapiSessionType={selectedVapiSessionType}
          setShowVapiSessionTypeSelector={setShowVapiSessionTypeSelector}
          startVapiCall={startVapiCall}
          setPendingVapiMode={setPendingVapiMode}
        />
      )}

      {/* Connecting Spinner Overlay */}
      {isConnecting && (
        <ConnectingOverlay selectedMode={selectedMode} />
      )}

      {/* Processing Spinner Overlay */}
      {(isProcessing || isAnalyzing) && (
        <ProcessingOverlay selectedMode={selectedMode} />
      )}

      {/* Error Toast */}
      {error && (
        <ErrorToast error={error} />
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
            <h3 className="mb-2 sm:mb-3 font-bold text-green-800 text-xl sm:text-2xl">
              Chat Session Complete!
            </h3>
            <p className="text-green-700 text-base sm:text-lg">
              Your VAPI chat conversation has been analyzed and saved successfully.
            </p>
          </div>
        </div>
      )}
    </>
  )
} 