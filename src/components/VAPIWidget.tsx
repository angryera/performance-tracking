'use client'

import { useState, useEffect, useRef } from 'react'
import { Phone, Play, Square, Mic, MicOff, AlertCircle, Clock } from 'lucide-react'
import { config } from '@/lib/config'
import Vapi from '@vapi-ai/web'
import { createClient } from '@anam-ai/js-sdk'

interface VAPIWidgetProps {
  userId?: string
  onTranscriptUpdate?: (transcript: string) => void
  onCallEnd?: (duration: number, transcript: string, mergedTranscript: Array<{role: string, text: string}>) => void
  remainingSeconds?: number
  onTimeLimitReached?: () => void
}

export default function VAPIWidget({ 
  userId, 
  onTranscriptUpdate, 
  onCallEnd, 
  remainingSeconds = 0,
  onTimeLimitReached 
}: VAPIWidgetProps) {
  const [vapi, setVapi] = useState<any>(null)
  const [isCallActive, setIsCallActive] = useState(false)
  const [selectedMode, setSelectedMode] = useState<string>('practice')
  const [transcript, setTranscript] = useState<any[]>([])
  const transcriptRef = useRef<any[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
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
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)

  // Anam video assistant states
  const [showAnamChat, setShowAnamChat] = useState(false)
  const [anamStatus, setAnamStatus] = useState('')
  const [anamClient, setAnamClient] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

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

  // Mute/unmute functionality
  const toggleMute = async () => {
    try {
      if (!isMuted) {
        // Mute: Stop all audio tracks
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => {
            track.enabled = false
          })
        }
        setIsMuted(true)
        console.log('Microphone muted')
      } else {
        // Unmute: Enable all audio tracks
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => {
            track.enabled = true
          })
        }
        setIsMuted(false)
        console.log('Microphone unmuted')
      }
    } catch (error) {
      console.error('Error toggling mute:', error)
      showErrorToast('Failed to toggle mute. Please try again.')
    }
  }

  // Get user media for mute functionality
  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = stream
      console.log('Audio stream obtained for mute functionality')
    } catch (error) {
      console.error('Error getting user media:', error)
      // Don't show error toast as this is just for mute functionality
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

    // Get user media for mute functionality
    await getUserMedia()

    // If it's sell mode, show Anam video assistant instead of VAPI
    if (mode === 'sell') {
      startAnamChat()
      return
    }

    if (!vapi) return

    const assistantId = config.vapi.assistants[mode as keyof typeof config.vapi.assistants]

    try {
      // Start the call and get the call ID
      const call = await vapi.start(assistantId)
      console.log('VAPI start response:', call)
      console.log('Call started with ID:', call?.id)

      // Set the call ID if available
      if (call?.id) {
        setCurrentCallId(call.id)
        currentCallIdRef.current = call.id
        console.log('Set call ID to:', call.id)
      } else {
        // Fallback: generate a unique call ID
        const fallbackId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setCurrentCallId(fallbackId)
        currentCallIdRef.current = fallbackId
        console.log('Set fallback call ID to:', fallbackId)
      }

      // Set start time
      const startTime = new Date()
      setCallStartTime(startTime)
      callStartTimeRef.current = startTime
      console.log('Set call start time to:', startTime.toISOString())

    } catch (error) {
      console.error('Error starting call:', error)
      setError('Failed to start call. Please try again.')
      setIsConnecting(false)
    }
  }

  const endCall = () => {
    // Clean up audio stream
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
      audioStreamRef.current = null
    }
    
    // Reset mute state
    setIsMuted(false)
    
    if (activeModeRef.current === 'sell') {
      endAnamChat()
    } else if (vapi) {
      vapi.stop()
    }
  }

  // Anam video assistant functions
  const createSessionToken = async () => {
    const response = await fetch(config.anam.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.anam.apiKey}`,
      },
      body: JSON.stringify({
        personaConfig: config.anam.persona,
      }),
    })

    const data = await response.json()
    return data.sessionToken
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

        if (videoRef.current) {
          await client.streamToVideoElement(config.video.elementId)
          setAnamClient(client)

          setIsCallActive(true)
          setIsConnecting(false)
          setAnamStatus(`Connected! Start speaking to ${config.anam.persona.name}`)
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
    activeModeRef.current = null
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const vapiInstance = new Vapi(config.vapi.publicKey)
    setVapi(vapiInstance)

    vapiInstance.on('call-start', () => {
      setIsCallActive(true)
      setIsConnecting(false)
      setTranscript([])
      transcriptRef.current = []
      setBackendResponse(null)
      setError(null)

      // Call ID and start time are now set in startCall function
      console.log('Call started event triggered')
    })

    vapiInstance.on('call-end', async () => {
      console.log("✅ Call ended. Starting to process transcript...")
      setIsCallActive(false)
      setIsSpeaking(false)

      // Calculate duration from timestamps using refs
      let finalDuration = 0
      const actualCallId = currentCallIdRef.current
      const actualStartTime = callStartTimeRef.current

      console.log('Call end - Call ID from ref:', actualCallId)
      console.log('Call end - Start time from ref:', actualStartTime)

      if (actualStartTime) {
        const endTime = new Date()
        finalDuration = Math.floor((endTime.getTime() - actualStartTime.getTime()) / 1000)
        console.log('Calculated duration from timestamps:', finalDuration, 'seconds')
      }

      // Get final call data from VAPI if call ID exists
      if (actualCallId) {
        try {
          console.log('Fetching call data for ID:', actualCallId)
          const callResponse = await fetch(`/api/call?callId=${actualCallId}`)
          if (callResponse.ok) {
            const callData = await callResponse.json()
            if (callData.duration && callData.duration > 0) {
              finalDuration = callData.duration
              console.log('Using VAPI duration:', finalDuration, 'seconds')
            } else {
              console.log('VAPI duration not available, using calculated duration:', finalDuration, 'seconds')
            }
          } else {
            console.log('VAPI call data not available, using calculated duration:', finalDuration, 'seconds')
          }
        } catch (error) {
          console.warn('Could not fetch call data, using calculated duration:', finalDuration, 'seconds', error)
        }
      } else {
        console.log('No call ID available, using calculated duration:', finalDuration, 'seconds')
      }

      console.log("Current mode is ", activeModeRef.current)
      if (activeModeRef.current === 'repmatch') {
        setIsProcessing(true)
        try {
          const transcriptStr = transcriptRef.current.map((t: any) => t.text).join(' ')
          console.log("🧾 Full transcriptRef.current:", transcriptRef.current)

          if (transcriptStr.trim()) {
            console.log("📨 Sending transcript to backend:", transcriptStr)

            const response = await fetch(config.api.endpoints.analyzeTranscript, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transcript: transcriptStr }),
            })

            console.log("✅ Got raw response from backend:", response)

            if (!response.ok) {
              throw new Error(`Backend error: ${response.status} ${response.statusText}`)
            }

            const result = await response.json()
            console.log("📦 Parsed JSON result:", result)

            setBackendResponse(result)
          }
        } catch (err) {
          console.error('Error sending transcript:', err)
          showErrorToast('Failed to analyze transcript. Please try again.')
        } finally {
          setIsProcessing(false)
        }
      }

      // Call the onCallEnd callback with accurate duration and transcript
      const transcriptStr = transcriptRef.current.map((t: any) => t.text).join(' ')
      const mergedTranscriptData = getMergedTranscript()
      
      console.log('🔍 VAPIWidget - Call ending with:')
      console.log('  - Duration:', finalDuration)
      console.log('  - Transcript:', transcriptStr)
      console.log('  - MergedTranscript:', mergedTranscriptData)
      console.log('  - Transcript array:', transcriptRef.current)
      
      onCallEnd?.(finalDuration, transcriptStr, mergedTranscriptData)

      // Reset call tracking
      setCurrentCallId(null)
      setCallStartTime(null)
      currentCallIdRef.current = null
      callStartTimeRef.current = null
    })

    vapiInstance.on('speech-start', () => setIsSpeaking(true))
    vapiInstance.on('speech-end', () => setIsSpeaking(false))

    vapiInstance.on('message', (message: any) => {
      if (message.type !== 'transcript') return

      // Some providers emit partial + final chunks. If a flag exists, keep finals only.
      const isFinal = message.is_final ?? message.final ?? true

      const raw = (message.transcript ?? message.text ?? '').trim()
      const role = message.role || (message.sender === 'user' ? 'user' : 'assistant')

      console.log('🔍 VAPIWidget - Received message:', { type: message.type, isFinal, raw, role })

      if (!raw) return
      if (!isFinal) return // comment out this line if you want to show streaming partials

      // Normalize whitespace so tiny diffs don't create dupes
      const normalized = raw.replace(/\s+/g, ' ').trim()

      setTranscript((prev) => {
        // find the last message from the same role
        const lastIdx = [...prev].map((m, i) => [m, i]).reverse().find(([m]) => m.role === role)?.[1]

        if (lastIdx !== undefined) {
          const last = prev[lastIdx]

          // If the new chunk extends the last one, replace it
          if (normalized.startsWith(last.text)) {
            const updated = prev.slice()
            updated[lastIdx] = { role, text: normalized }
            transcriptRef.current = updated
            return updated
          }

          // If the new chunk is contained in the last, ignore it
          if (last.text.startsWith(normalized)) {
            transcriptRef.current = prev
            return prev
          }
        }

        // Drop exact dupes anywhere
        if (prev.some(m => m.role === role && m.text === normalized)) {
          transcriptRef.current = prev
          return prev
        }

        const updated = [...prev, { role, text: normalized }]
        transcriptRef.current = updated
        return updated
      })

      // Call the onTranscriptUpdate callback
      const transcriptStr = transcriptRef.current.map((t: any) => t.text).join(' ')
      onTranscriptUpdate?.(transcriptStr)
    })

    return () => {
      if (vapiInstance && typeof vapiInstance.stop === 'function') {
        vapiInstance.stop()
      }
    }
  }, [onCallEnd, onTranscriptUpdate])

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

  // Function to merge consecutive messages from the same role
  const getMergedTranscript = () => {
    if (transcriptRef.current.length === 0) return []
    
    const merged: any[] = []
    let currentRole = transcriptRef.current[0].role
    let currentText = transcriptRef.current[0].text
    
    for (let i = 1; i < transcriptRef.current.length; i++) {
      const message = transcriptRef.current[i]
      
      if (message.role === currentRole) {
        // Same role, merge the text
        currentText += ' ' + message.text
      } else {
        // Different role, save current and start new
        merged.push({ role: currentRole, text: currentText })
        currentRole = message.role
        currentText = message.text
      }
    }
    
    // Add the last message
    merged.push({ role: currentRole, text: currentText })
    
    return merged
  }

  useEffect(() => {
    console.log('🔍 VAPIWidget - transcript state changed:', transcript)
    console.log('🔍 VAPIWidget - transcriptRef.current:', transcriptRef.current)
  }, [transcript])

  useEffect(() => {
    console.log('🔍 VAPIWidget - transcriptRef.current changed:', transcriptRef.current)
  }, [transcriptRef.current])

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
              className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                canStartCall()
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
            <div className="flex justify-center items-center space-x-4">
              <div className="font-semibold text-gray-900 text-lg">
                {formatDuration(displayDuration)}
              </div>
              
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  isMuted 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <>
                    <MicOff className="mr-2 w-4 h-4" />
                    Unmuted
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 w-4 h-4" />
                    Muted
                  </>
                )}
              </button>
              
              <button
                onClick={endCall}
                className="inline-flex items-center bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium text-white transition-colors"
              >
                <Square className="mr-2 w-4 h-4" />
                End Call
              </button>
            </div>
          )}
        </div>

        {/* Video/Audio Interface */}
        <div className="mb-6">
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <div className="flex justify-center items-center bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto mb-4 rounded-full w-16 h-16">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h4 className="mb-2 font-medium text-gray-900">
              {isCallActive ? 'Call in Progress' : 'Ready to Start'}
            </h4>
            <p className="text-gray-600 text-sm">
              {isCallActive
                ? `Connected to ${config.anam.persona.name}`
                : `Practice with ${config.anam.persona.name}`
              }
            </p>
          </div>
        </div>

        {/* Enhanced Transcript Display */}
        {isCallActive && (
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 shadow-sm p-6 border border-gray-200 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="bg-green-500 rounded-full w-2 h-2 animate-pulse"></div>
                  <h4 className="font-semibold text-gray-900 text-lg">Live Transcript</h4>
                </div>
                <span className="bg-green-100 px-2 py-1 rounded-full font-medium text-green-800 text-xs">
                  {getMergedTranscript().length} messages
                </span>
                {isMuted && (
                  <span className="flex items-center bg-red-100 px-2 py-1 rounded-full font-medium text-red-800 text-xs">
                    <MicOff className="mr-1 w-3 h-3" />
                    Muted
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const transcriptText = transcript.map(msg => `${msg.role}: ${msg.text}`).join('\n')
                    navigator.clipboard.writeText(transcriptText)
                  }}
                  className="hover:bg-gray-100 p-2 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copy transcript"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setTranscript([])}
                  className="hover:bg-red-50 p-2 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                  title="Clear transcript"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="bg-white shadow-inner border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {transcript.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-gray-400">
                    <div className="flex justify-center items-center bg-gray-100 mb-3 rounded-full w-12 h-12">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="font-medium text-sm">Waiting for conversation...</p>
                    <p className="mt-1 text-xs">Start speaking to see the transcript here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getMergedTranscript().map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                          <div className="flex items-start space-x-2">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${msg.role === 'user'
                              ? 'bg-white bg-opacity-20 text-white'
                              : 'bg-gray-300 text-gray-600'
                              }`}>
                              {msg.role === 'user' ? 'U' : 'A'}
                            </div>
                            <div className="flex-1">
                              <div className="opacity-75 mb-1 font-medium text-xs text-left">
                                {msg.role === 'user' ? 'You' : config.anam.persona.name}
                              </div>
                              <div className="text-sm text-left leading-relaxed">
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transcript Footer */}
              <div className="bg-gray-50 px-4 py-3 border-gray-200 border-t">
                <div className="flex justify-between items-center text-gray-500 text-xs">
                  <span>
                    {getMergedTranscript().length > 0 ? `${getMergedTranscript().length} message${getMergedTranscript().length !== 1 ? 's' : ''}` : 'No messages yet'}
                  </span>
                  <span>
                    {isSpeaking && (
                      <span className="flex items-center text-green-600">
                        <div className="bg-green-500 mr-1 rounded-full w-2 h-2 animate-pulse"></div>
                        Speaking...
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isCallActive && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="mb-2 font-medium text-blue-900">Instructions</h4>
            <ul className="space-y-1 text-blue-800 text-sm">
              <li>• Select your preferred training mode</li>
              <li>• Click "Start Session" to begin your practice call</li>
              <li>• Speak naturally and follow your sales training</li>
              <li>• The AI customer will respond based on your approach</li>
              <li>• Your performance will be analyzed and graded</li>
            </ul>
          </div>
        )}
      </div>

      {/* Anam Video Assistant Modal */}
      {showAnamChat && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm !mt-0 p-4">
          <div className="bg-gray-800 shadow-2xl p-6 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-3 font-bold text-white text-2xl">
                <div className="bg-emerald-500 rounded-full w-3 h-3 animate-pulse"></div>
                Chat with {config.anam.persona.name}
              </h3>
              <button
                onClick={endAnamChat}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white hover:scale-105 active:scale-95 transition-all duration-200"
              >
                End Session
              </button>
            </div>

            <div className="text-center">
              <p className="mb-4 text-gray-300">Your AI customer will appear below and start automatically</p>
              <video
                id={config.video.elementId}
                ref={videoRef}
                autoPlay
                playsInline
                className="justify-self-center bg-gray-900 border border-gray-600 rounded-lg max-w-full h-96 object-cover"
                style={{ maxWidth: config.video.maxWidth }}
              />
              <div className="mt-4 text-gray-400 text-sm">
                {anamStatus}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connecting Spinner Overlay */}
      {isConnecting && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm !mt-0">
          <div className="bg-gray-800 p-8 border border-gray-700 rounded-2xl text-center">
            <div className="mx-auto mb-4 border-cyan-400 border-b-2 rounded-full w-12 h-12 animate-spin"></div>
            <p className="font-semibold text-white text-lg">
              {selectedMode === 'sell' ? 'Connecting to video assistant...' : 'Connecting to assistant...'}
            </p>
          </div>
        </div>
      )}

      {/* Processing Spinner Overlay */}
      {isProcessing && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm !mt-0">
          <div className="bg-gray-800 p-8 border border-gray-700 rounded-2xl max-w-md text-center">
            <div className="mx-auto mb-4 border-purple-400 border-b-2 rounded-full w-12 h-12 animate-spin"></div>
            <h3 className="mb-2 font-bold text-white text-xl">Analyzing Performance</h3>
            <p className="mb-4 text-gray-300 text-sm">AI is evaluating your conversation and generating insights...</p>
            <div className="space-y-2 text-left">
              <div className="flex items-center text-gray-400 text-sm">
                <div className="bg-purple-400 mr-2 rounded-full w-2 h-2"></div>
                Processing transcript
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <div className="bg-purple-400 mr-2 rounded-full w-2 h-2"></div>
                Evaluating sales techniques
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <div className="bg-purple-400 mr-2 rounded-full w-2 h-2"></div>
                Generating performance grade
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="top-4 right-4 z-[1000] fixed bg-red-500 shadow-lg px-6 py-3 rounded-lg text-white animate-slide-in-right">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </>
  )
} 