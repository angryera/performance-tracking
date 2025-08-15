'use client'

import { config } from '@/lib/config'
import { Mic, MicOff, Phone } from 'lucide-react'
import { Instructions } from './Instructions'

const VAPICallWidget = ({
    isCallActive,
    transcript,
    isMuted,
    isMuteProcessing,
    getMergedTranscript,
    setTranscript,
    isSpeaking,
    activeModeRef,
    endCall,
    formatDuration,
    displayDuration,
    toggleMute,
}: {
    isCallActive: boolean,
    transcript: any[],
    isMuted: boolean,
    isMuteProcessing: boolean,
    getMergedTranscript: () => any[],
    setTranscript: (transcript: any[]) => void,
    isSpeaking: boolean,
    activeModeRef: React.RefObject<string>,
    endCall: () => void,
    formatDuration: (duration: number) => string,
    displayDuration: number,
    toggleMute: () => void,
}) => {
    return <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm !mt-0 p-4">
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
                                    {isMuteProcessing && (
                                        <span className="flex items-center bg-yellow-100 px-2 py-1 rounded-full font-medium text-yellow-800 text-xs">
                                            <div className="mr-1 border-2 border-yellow-600 border-t-transparent rounded-full w-3 h-3 animate-spin"></div>
                                            Processing...
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => {
                                            const transcriptText = transcript.map(msg => `${msg.role}: ${msg.content}`).join('\n')
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
                                                                    {msg.content}
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
                        <Instructions />
                    )}
                </div>
            </div>
        </div>
    </div>
}

export default VAPICallWidget