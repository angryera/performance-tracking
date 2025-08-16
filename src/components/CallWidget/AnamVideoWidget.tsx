import React, { useEffect, useRef, useState } from 'react'

const AnamVideoWidget = ({
    config,
    endAnamChat,
    videoRef,
    messageListRef,
    getAllMessages,
    isAssistantSpeaking,
    anamStatus,
    userInput,
    setUserInput,
    handleKeyPress,
    sendTextMessage,
    isSendingMessage,
    inputRef,
    formatTimestamp,
    getMessageAge,
    isMuted,
    toggleMute,
    isMuteProcessing,
}: {
    config: any,
    endAnamChat: () => void,
    videoRef: React.RefObject<HTMLVideoElement>,
    messageListRef: React.RefObject<HTMLDivElement>,
    getAllMessages: () => any[],
    isAssistantSpeaking: boolean,
    anamStatus: string,
    userInput: string,
    setUserInput: (value: string) => void,
    handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void,
    sendTextMessage: () => void,
    isSendingMessage: boolean,
    inputRef: React.RefObject<HTMLTextAreaElement>,
    formatTimestamp: (timestamp: string) => string,
    getMessageAge: (timestamp: string) => string,
    isMuted: boolean,
    toggleMute: () => void,
    isMuteProcessing: boolean,
}) => {
    // Create a local ref for the video element to ensure it exists
    const localVideoRef = useRef<HTMLVideoElement>(null)

    // Disable body scrolling when widget is open
    useEffect(() => {
        // Disable body scroll
        document.body.style.overflow = 'hidden'

        // Re-enable body scroll when component unmounts
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    // Ensure video element exists and has the correct ID
    useEffect(() => {
        if (localVideoRef.current) {
            localVideoRef.current.id = config.video.elementId
        }
    }, [config.video.elementId])

    return <div className="z-[9999] fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm !mt-0 p-3 sm:p-4 md:p-6">
        <div
            className="bg-gray-800 shadow-2xl p-4 sm:p-6 md:p-8 xl:p-10 border border-gray-700 rounded-lg sm:rounded-xl md:rounded-2xl xl:rounded-3xl w-full h-full sm:h-auto sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl sm:max-h-[95vh] flex flex-col"
        >
            <div className="flex flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8 xl:mb-10">
                <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-emerald-500 rounded-full w-2.5 sm:w-3 md:w-4 h-2.5 sm:h-3 md:h-4 animate-pulse"></div>
                        <h3 className="font-bold text-white text-sm sm:text-base md:text-lg xl:text-2xl">Chat with {config.anam.persona.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 bg-gray-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                        <div className="bg-green-500 rounded-full w-1.5 sm:w-2 h-1.5 sm:h-2 animate-pulse"></div>
                        <span className="font-medium text-green-400 text-xs sm:text-sm">Live</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-6">
                    {/* Mute Button */}
                    <button
                        onClick={toggleMute}
                        disabled={isMuteProcessing}
                        className={`inline-flex items-center px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-medium transition-colors text-xs sm:text-sm ${isMuted
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-gray-500 hover:bg-gray-600 text-white'
                            } ${isMuteProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={`${isMuted ? 'Unmute' : 'Mute'} microphone`}
                    >
                        {isMuteProcessing ? (
                            <>
                                <div className="mr-1.5 sm:mr-2 border-2 border-white border-t-transparent rounded-full w-3 sm:w-4 h-3 sm:h-4 animate-spin"></div>
                                <span className="hidden sm:inline">{isMuted ? 'Unmuting...' : 'Muting...'}</span>
                            </>
                        ) : isMuted ? (
                            <>
                                <svg className="mr-1.5 sm:mr-2 w-3 sm:w-4 h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </svg>
                                <span className="hidden sm:inline">Muted</span>
                            </>
                        ) : (
                            <>
                                <svg className="mr-1.5 sm:mr-2 w-3 sm:w-4 h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                                <span className="hidden sm:inline">Mute</span>
                            </>
                        )}
                    </button>

                    {/* End Session Button */}
                    <button
                        onClick={endAnamChat}
                        className="bg-red-500 hover:bg-red-600 shadow-lg px-4 sm:px-5 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-medium text-white text-xs sm:text-sm md:text-base hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3">
                            <svg className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="hidden sm:inline">End Session</span>
                            <span className="sm:hidden">End</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Combined Video and Text Interface */}
            <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 flex-1 min-h-0">
                {/* Video Section - Main Content */}
                <div className="flex flex-col flex-1 justify-between min-h-0">
                    <div className="mb-3 sm:mb-4 md:mb-6 xl:mb-8 text-center">
                        <h4 className="mb-1 sm:mb-2 md:mb-3 font-semibold text-white text-sm sm:text-base md:text-lg xl:text-xl">Video Call</h4>
                        <p className="hidden md:block text-gray-300 text-xs sm:text-sm">Your AI customer will appear below and start automatically</p>
                    </div>
                    <div className="relative flex-1 min-h-[160px] sm:min-h-[180px] md:min-h-[250px] xl:min-h-[300px]">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            className="bg-gray-900 shadow-2xl border-2 border-gray-600 rounded-lg sm:rounded-xl xl:rounded-2xl w-full h-full object-cover"
                            style={{ maxWidth: config.video.maxWidth }}
                        />
                        <div className="top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 absolute flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 bg-red-500 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium text-white text-xs sm:text-sm">
                            <div className="bg-white rounded-full w-1 sm:w-1.5 md:w-2 h-1 sm:h-1.5 md:h-2 animate-pulse"></div>
                            <span className="text-xs sm:text-sm">REC</span>
                        </div>
                        {/* Mute Indicator on Video */}
                        {isMuted && (
                            <div className="top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6 absolute bg-red-500 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium text-white text-xs sm:text-sm">
                                <div className="flex items-center space-x-1.5">
                                    <svg className="w-2.5 sm:w-3 h-2.5 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                    </svg>
                                    <span className="text-xs sm:text-sm">MUTED</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="hidden md:block bg-gray-700 mt-3 sm:mt-4 md:mt-6 p-3 sm:p-4 md:p-6 border border-gray-600 rounded-lg xl:rounded-xl">
                        <div className="text-gray-300 text-xs sm:text-sm">
                            <div className="flex justify-center items-center space-x-3">
                                <div className="bg-emerald-500 rounded-full w-1.5 sm:w-2 h-1.5 sm:h-2 animate-pulse"></div>
                                <span>Status: {anamStatus}</span>
                                {isMuted && (
                                    <span className="text-red-400">• Microphone Muted</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Text Chat Section */}
                <div className="flex flex-col bg-gray-900 p-4 sm:p-6 md:p-8 border border-gray-600 rounded-lg sm:rounded-xl xl:rounded-2xl w-full sm:w-80 min-h-[180px] sm:min-h-[200px] md:min-h-0">
                    <div className="hidden md:block mb-3 sm:mb-4 md:mb-6 text-center">
                        <h4 className="mb-1 sm:mb-2 md:mb-3 font-semibold text-white text-sm sm:text-base md:text-lg">Text Chat</h4>
                        <p className="text-gray-300 text-xs sm:text-sm">Type messages or speak naturally</p>
                    </div>

                    {/* Messages Display */}
                    <div
                        ref={messageListRef}
                        className="flex-1 bg-gray-800 mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg max-h-[120px] sm:max-h-[150px] md:max-h-[200px] lg:max-h-[350px] xl:max-h-[480px] overflow-y-auto"
                    >
                        {getAllMessages().map((message, index) => (
                            <div key={message.id || index} className={`mb-2 sm:mb-3 md:mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                                <div className={`inline-block max-w-[90%] p-2 sm:p-3 rounded-lg ${message.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-600 text-white'
                                    }`}>
                                    <div className="mb-1 sm:mb-1.5 text-gray-300 text-xs">
                                        {message.role === 'user' ? 'You' : config.anam.persona.name}
                                        {message.timestamp && (
                                            <span className="ml-2 sm:ml-3">{formatTimestamp(message.timestamp)}</span>
                                        )}
                                    </div>
                                    <div className="text-xs sm:text-sm leading-relaxed">{message.content}</div>
                                </div>
                            </div>
                        ))}
                        {getAllMessages().length === 0 && (
                            <div className="py-4 sm:py-6 md:py-8 text-gray-400 text-xs sm:text-sm text-center">
                                Start the conversation by speaking or typing a message
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="flex space-x-2 sm:space-x-3">
                        <textarea
                            ref={inputRef}
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1 bg-gray-700 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-600 focus:border-blue-500 rounded-lg focus:outline-none text-white text-xs sm:text-sm resize-none"
                            rows={2}
                            disabled={isSendingMessage}
                        />
                        <button
                            onClick={sendTextMessage}
                            disabled={!userInput.trim() || isSendingMessage}
                            className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-colors ${userInput.trim() && !isSendingMessage
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {isSendingMessage ? (
                                <div className="border-2 border-white border-t-transparent rounded-full w-3 sm:w-4 h-3 sm:h-4 animate-spin"></div>
                            ) : (
                                'Send'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default AnamVideoWidget;