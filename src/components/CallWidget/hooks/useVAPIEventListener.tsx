import { Dispatch, SetStateAction, useEffect } from "react";
import Vapi from '@vapi-ai/web'
import { config } from "@/lib/config";

const useVAPIEventListener = ({
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
    showErrorToast,
    transcriptRef,
    currentCallIdRef,
    callStartTimeRef,
    activeModeRef,
    setCurrentCallId,
    setCallStartTime,
    getMergedTranscript
}: {
    setVapi: (vapi: Vapi) => void,
    setIsCallActive: (isCallActive: boolean) => void,
    setIsConnecting: (isConnecting: boolean) => void,
    setTranscript: Dispatch<SetStateAction<{
        role: string;
        text: string;
    }[]>>,
    setBackendResponse: (backendResponse: any) => void,
    setError: (error: any) => void,
    setIsSpeaking: (isSpeaking: boolean) => void,
    setIsProcessing: (isProcessing: boolean) => void,
    onCallEnd?: (duration: number, transcript: string, mergedTranscript: Array<{ role: string, text: string }>) => void,
    onTranscriptUpdate?: (transcript: string) => void,
    getMergedTranscript: (transcriptRef: React.MutableRefObject<{ role: string, text: string }[]>) => Array<{ role: string, text: string }>,
    showErrorToast: (error: string) => void,
    transcriptRef: React.MutableRefObject<any[]>,
    currentCallIdRef: React.MutableRefObject<string | null>,
    callStartTimeRef: React.MutableRefObject<Date | null>,
    activeModeRef: React.MutableRefObject<string | null>,
    setCurrentCallId: (callId: string | null) => void,
    setCallStartTime: (startTime: Date | null) => void,
}) => {
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
            const mergedTranscriptData = getMergedTranscript(transcriptRef)

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
            const role: string = message.role || (message.sender === 'user' ? 'user' : 'assistant')

            console.log('🔍 VAPIWidget - Received message:', { type: message.type, isFinal, raw, role })

            if (!raw) return
            if (!isFinal) return // comment out this line if you want to show streaming partials

            // Normalize whitespace so tiny diffs don't create dupes
            const normalized = raw.replace(/\s+/g, ' ').trim()

            setTranscript((prev: { role: string, text: string }[]) => {
                // find the last message from the same role
                const lastIdx = [...prev]
                    .map((m, i) => [m, i])
                    .reverse()
                    .find(([m]: any) => m.role === role)?.[1]

                if (lastIdx !== undefined) {
                    const last = prev[lastIdx as number]

                    // If the new chunk extends the last one, replace it
                    if (normalized.startsWith(last.text)) {
                        const updated = prev.slice()
                        updated[lastIdx as number] = { role, text: normalized }
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
}

export default useVAPIEventListener;