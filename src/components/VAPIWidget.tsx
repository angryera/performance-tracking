'use client'

import { useState, useEffect, useRef } from 'react'
import { Phone, Play, Square, Mic, MicOff, AlertCircle } from 'lucide-react'
import { config } from '@/lib/config'
import Vapi from '@vapi-ai/web'
import { createClient } from '@anam-ai/js-sdk'

interface VAPIWidgetProps {
  userId?: string
  onTranscriptUpdate?: (transcript: string) => void
  onCallEnd?: (duration: number, transcript: string) => void
}

export default function VAPIWidget({ userId, onTranscriptUpdate, onCallEnd }: VAPIWidgetProps) {
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

  // Anam video assistant states
  const [showAnamChat, setShowAnamChat] = useState(false)
  const [anamStatus, setAnamStatus] = useState('')
  const [anamClient, setAnamClient] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const showErrorToast = (message: string) => {
    setError(message)
    setTimeout(() => setError(null), config.ui.timeouts.errorToastDuration)
  }

  const startCall = async (mode: string) => {
    activeModeRef.current = mode
    setIsConnecting(true)
    setError(null)

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
      onCallEnd?.(finalDuration, transcriptStr)
      
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
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isCallActive])

  return (
    <>
      <div className="bg-white shadow-lg mx-auto p-6 rounded-lg max-w-4xl">
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
          {!isCallActive ? (
            <button
              onClick={() => startCall(selectedMode)}
              className="inline-flex items-center bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium text-white transition-colors"
            >
              <Play className="mr-2 w-5 h-5" />
              Start {config.ui.trainingModes.find(m => m.id === selectedMode)?.title} Session
            </button>
          ) : (
            <div className="flex justify-center items-center space-x-4">
              <div className="font-semibold text-gray-900 text-lg">
                {formatDuration(displayDuration)}
              </div>
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

        {/* Transcript Display */}
        {isCallActive && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="mb-2 font-medium text-gray-900">Live Transcript</h4>
            <div className="bg-white p-3 border rounded h-32 overflow-y-auto text-sm">
              {transcript.length === 0 ? (
                <p className="py-4 text-gray-400 text-center">
                  Conversation will appear here...
                </p>
              ) : (
                <div className="space-y-3">
                  {transcript.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${msg.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                        }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
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
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm">
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
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-gray-800 p-8 border border-gray-700 rounded-2xl text-center">
            <div className="mx-auto mb-4 border-purple-400 border-b-2 rounded-full w-12 h-12 animate-spin"></div>
            <p className="font-semibold text-white text-lg">Analyzing your performance...</p>
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