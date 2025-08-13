export const AnamVideoWidget = ({
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
}:{
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
}) => {
    return <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm !mt-0 p-4">
        <div className="bg-gray-800 shadow-2xl p-8 border border-gray-700 rounded-3xl w-full max-w-7xl max-h-[95vh]">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-500 rounded-full w-4 h-4 animate-pulse"></div>
                        <h3 className="font-bold text-white text-3xl">Chat with {config.anam.persona.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-full">
                        <div className="bg-green-500 rounded-full w-2 h-2 animate-pulse"></div>
                        <span className="font-medium text-green-400 text-sm">Live Session</span>
                    </div>
                </div>
                <button
                    onClick={endAnamChat}
                    className="bg-red-500 hover:bg-red-600 shadow-lg px-6 py-3 rounded-xl font-medium text-white hover:scale-105 active:scale-95 transition-all duration-200"
                >
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>End Session</span>
                    </div>
                </button>
            </div>

            {/* Combined Video and Text Interface */}
            <div className="flex gap-6 h-[700px]">
                {/* Video Section - Main Content */}
                <div className="flex flex-col flex-1">
                    <div className="mb-6 text-center">
                        <h4 className="mb-2 font-semibold text-white text-xl">Video Call</h4>
                        <p className="text-gray-300 text-sm">Your AI customer will appear below and start automatically</p>
                    </div>
                    <div className="relative flex-1">
                        <video
                            id={config.video.elementId}
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="bg-gray-900 shadow-2xl border-2 border-gray-600 rounded-2xl w-full h-full object-cover"
                            style={{ maxWidth: config.video.maxWidth }}
                        />
                        <div className="top-4 left-4 absolute flex items-center space-x-2 bg-red-500 px-3 py-1 rounded-full font-medium text-white text-sm">
                            <div className="bg-white rounded-full w-2 h-2 animate-pulse"></div>
                            <span>REC</span>
                        </div>
                    </div>
                    <div className="bg-gray-700 mt-4 p-4 border border-gray-600 rounded-xl">
                        <div className="text-gray-300 text-sm">
                            <div className="flex justify-center items-center space-x-2">
                                <div className="bg-emerald-500 rounded-full w-2 h-2 animate-pulse"></div>
                                <span>{anamStatus}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Text Chat Sidebar */}
                <div className="flex flex-col bg-gray-800 shadow-xl border border-gray-700 rounded-2xl w-96">
                    {/* Chat Header */}
                    <div className="p-4 border-gray-700 border-b">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-white text-lg">Text Chat</h4>
                            <div className="bg-blue-500 px-2 py-1 rounded-full font-medium text-white text-xs">
                                {getAllMessages().length} messages
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <div className="bg-green-500 rounded-full w-2 h-2 animate-pulse"></div>
                                <span className="text-green-400 text-sm">Connected</span>
                            </div>
                            {isAssistantSpeaking && (
                                <div className="flex items-center space-x-2 bg-yellow-500 bg-opacity-20 px-2 py-1 border border-yellow-500 rounded-full">
                                    <div className="bg-yellow-400 rounded-full w-2 h-2 animate-pulse"></div>
                                    <span className="font-medium text-yellow-400 text-xs">Speaking</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Conversation Display */}
                    <div className="flex-1 p-4 overflow-y-auto" ref={messageListRef}>
                        {getAllMessages().length === 0 ? (
                            <div className="flex flex-col justify-center items-center h-full text-gray-400">
                                <div className="flex justify-center items-center bg-gray-700 mb-3 rounded-full w-12 h-12">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="font-medium text-sm">Starting conversation...</p>
                                <p className="mt-1 text-gray-500 text-xs">Type your message below to begin</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {getAllMessages().map((message, index) => (
                                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] px-3 py-2 rounded-xl shadow-sm ${message.role === 'user'
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                            : 'bg-gray-700 text-gray-200 border border-gray-500'
                                            }`}>
                                            <div className="flex items-start space-x-2">
                                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${message.role === 'user'
                                                    ? 'bg-white bg-opacity-20 text-white'
                                                    : 'bg-gray-500 text-gray-300'
                                                    }`}>
                                                    {message.role === 'user' ? 'U' : 'A'}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="opacity-90 font-semibold text-xs">
                                                            {message.role === 'user' ? 'You' : config.anam.persona.name}
                                                        </div>
                                                        <div className="opacity-70 text-xs">
                                                            {formatTimestamp(message.timestamp)}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs leading-relaxed">
                                                        {message.content}
                                                    </div>
                                                    {message.source && (
                                                        <div className="opacity-60 mt-1 text-xs">
                                                            Source: {message.source} • {getMessageAge(message.timestamp)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-gray-700 border-t">
                        <div className="flex space-x-2">
                            <div className="relative flex-1">
                                <textarea
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={`Type your message...`}
                                    className="bg-gray-700 shadow-sm px-3 py-2 border border-gray-600 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-full text-white text-sm transition-all duration-200 resize-none placeholder-gray-400"
                                    rows={2}
                                    disabled={isSendingMessage}
                                    ref={inputRef}
                                />
                                <div className="right-2 bottom-1 absolute text-gray-500 text-xs">
                                    {userInput.length}/500
                                </div>
                            </div>
                            <button
                                onClick={sendTextMessage}
                                disabled={!userInput.trim() || isSendingMessage}
                                className={`px-4 py-1 rounded-lg font-medium transition-all shadow-sm ${userInput.trim() && !isSendingMessage
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white hover:scale-105 active:scale-95'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isSendingMessage ? (
                                    <div className="flex items-center space-x-1">
                                        <div className="border-2 border-white border-t-transparent rounded-full w-3 h-3 animate-spin"></div>
                                        <span className="text-xs">Sending...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        <span className="text-xs">Send</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}