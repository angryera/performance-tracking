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
    const [scale, setScale] = useState(1)

    // Disable body scrolling when widget is open
    useEffect(() => {
        // Disable body scroll
        document.body.style.overflow = 'hidden'

        // Calculate scale based on screen height
        const calculateScale = () => {
            const screenHeight = window.innerHeight
            if (screenHeight < 600) {
                setScale(0.6)
            } else if (screenHeight < 768) {
                setScale(0.75)
            } else if (screenHeight < 900) {
                setScale(0.9)
            } else {
                setScale(1)
            }
        }

        // Calculate initial scale
        calculateScale()

        // Add resize listener
        window.addEventListener('resize', calculateScale)

        // Re-enable body scroll when component unmounts
        return () => {
            document.body.style.overflow = 'unset'
            window.removeEventListener('resize', calculateScale)
        }
    }, [])

    // Ensure video element exists and has the correct ID
    useEffect(() => {
        if (localVideoRef.current) {
            localVideoRef.current.id = config.video.elementId
        }
    }, [config.video.elementId])

    return <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm !mt-0 p-4">
        <div 
            className="bg-gray-800 shadow-2xl mt-[60px] p-4 sm:p-6 xl:p-8 border border-gray-700 rounded-2xl xl:rounded-3xl w-full md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 3xl:max-h-[90vh]"
            style={{
                transform: `scale(${scale})`,
                transition: 'transform 0.3s ease-in-out'
            }}
        >
            <div className="flex flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6 xl:mb-8">
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-emerald-500 rounded-full w-3 sm:w-4 h-3 sm:h-4 animate-pulse"></div>
                        <h3 className="font-bold text-white text-lg sm:text-xl xl:text-3xl">Chat with {config.anam.persona.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-700 px-2 py-1 rounded-full">
                        <div className="bg-green-500 rounded-full w-2 h-2 animate-pulse"></div>
                        <span className="sm:hidden font-medium text-green-400 text-xs sm:text-sm">Live</span>
                        <span className="hidden sm:block font-medium text-green-400 text-xs sm:text-sm"> Live Session</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* Mute Button */}
                    <button
                        onClick={toggleMute}
                        disabled={isMuteProcessing}
                        className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors ${isMuted
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-gray-500 hover:bg-gray-600 text-white'
                            } ${isMuteProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={`${isMuted ? 'Unmute' : 'Mute'} microphone`}
                    >
                        {isMuteProcessing ? (
                            <>
                                <div className="mr-1 sm:mr-2 border-2 border-white border-t-transparent rounded-full w-3 sm:w-4 h-3 sm:h-4 animate-spin"></div>
                                <span className="hidden sm:inline">{isMuted ? 'Unmuting...' : 'Muting...'}</span>
                            </>
                        ) : isMuted ? (
                            <>
                                <svg className="mr-1 sm:mr-2 w-3 sm:w-4 h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </svg>
                                <span className="hidden sm:inline">Muted</span>
                            </>
                        ) : (
                            <>
                                <svg className="mr-1 sm:mr-2 w-3 sm:w-4 h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                                <span className="hidden sm:inline">Mute</span>
                            </>
                        )}
                    </button>
                    
                    {/* End Session Button */}
                    <button
                        onClick={endAnamChat}
                        className="bg-red-500 hover:bg-red-600 shadow-lg px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-white text-sm sm:text-base hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="hidden sm:inline">End Session</span>
                            <span className="sm:hidden">End</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Combined Video and Text Interface */}
            <div className="flex sm:flex-row flex-col gap-4 sm:gap-6">
                {/* Video Section - Main Content */}
                <div className="flex flex-col flex-1 justify-between">
                    <div className="mb-3 sm:mb-4 xl:mb-6 text-center">
                        <h4 className="mb-1 sm:mb-2 font-semibold text-white text-base sm:text-lg xl:text-xl">Video Call</h4>
                        <p className="hidden sm:block text-gray-300 text-xs sm:text-sm">Your AI customer will appear below and start automatically</p>
                    </div>
                    <div className="relative flex-1 min-h-[200px] sm:min-h-[250px] xl:min-h-[300px]">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            className="bg-gray-900 shadow-2xl border-2 border-gray-600 rounded-xl xl:rounded-2xl w-full h-full object-cover"
                            style={{ maxWidth: config.video.maxWidth }}
                        />
                        <div className="top-2 sm:top-4 left-2 sm:left-4 absolute flex items-center space-x-1 sm:space-x-2 bg-red-500 px-2 py-1 rounded-full font-medium text-white text-xs sm:text-sm">
                            <div className="bg-white rounded-full w-1.5 sm:w-2 h-1.5 animate-pulse"></div>
                            <span className="text-xs sm:text-sm">REC</span>
                        </div>
                        {/* Mute Indicator on Video */}
                        {isMuted && (
                            <div className="top-2 sm:top-4 right-2 sm:right-4 absolute bg-red-500 px-2 py-1 rounded-full font-medium text-white text-xs sm:text-sm">
                                <div className="flex items-center space-x-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                    </svg>
                                    <span>MUTED</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="hidden sm:block bg-gray-700 mt-3 sm:mt-4 p-3 sm:p-4 border border-gray-600 rounded-lg xl:rounded-xl">
                        <div className="text-gray-300 text-xs sm:text-sm">
                            <div className="flex justify-center items-center space-x-2">
                                <div className="bg-emerald-500 rounded-full w-1.5 sm:w-2 h-1.5 animate-pulse"></div>
                                <span>Status: {anamStatus}</span>
                                {isMuted && (
                                    <span className="text-red-400">• Microphone Muted</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Text Chat Section */}
                <div className="flex flex-col bg-gray-900 p-4 border border-gray-600 rounded-xl xl:rounded-2xl w-full sm:w-80">
                    <div className="hidden sm:block mb-3 sm:mb-4 text-center">
                        <h4 className="mb-1 sm:mb-2 font-semibold text-white text-base sm:text-lg">Text Chat</h4>
                        <p className="text-gray-300 text-xs sm:text-sm">Type messages or speak naturally</p>
                    </div>

                    {/* Messages Display */}
                    <div
                        ref={messageListRef}
                        className="flex-1 bg-gray-800 mb-3 p-3 rounded-lg max-h-[230px] sm:max-h-[350px] lg:max-h-[380px] xl:max-h-[480px] overflow-y-auto"
                    >
                        {getAllMessages().map((message, index) => (
                            <div key={message.id || index} className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                                <div className={`inline-block max-w-[80%] p-2 rounded-lg ${message.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-600 text-white'
                                    }`}>
                                    <div className="mb-1 text-gray-300 text-xs">
                                        {message.role === 'user' ? 'You' : config.anam.persona.name}
                                        {message.timestamp && (
                                            <span className="ml-2">{formatTimestamp(message.timestamp)}</span>
                                        )}
                                    </div>
                                    <div className="text-sm">{message.content}</div>
                                </div>
                            </div>
                        ))}
                        {getAllMessages().length === 0 && (
                            <div className="py-4 text-gray-400 text-sm text-center">
                                Start the conversation by speaking or typing a message
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="flex space-x-2">
                        <textarea
                            ref={inputRef}
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1 bg-gray-700 px-3 py-2 border border-gray-600 focus:border-blue-500 rounded-lg focus:outline-none text-white text-sm resize-none"
                            rows={2}
                            disabled={isSendingMessage}
                        />
                        <button
                            onClick={sendTextMessage}
                            disabled={!userInput.trim() || isSendingMessage}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${userInput.trim() && !isSendingMessage
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {isSendingMessage ? (
                                <div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></div>
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