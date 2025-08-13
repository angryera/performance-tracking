const VAPISessionTypeSelector = ({
    pendingVapiMode,
    setSelectedVapiSessionType,
    selectedVapiSessionType,
    setShowVapiSessionTypeSelector,
    startVapiCall,
    setPendingVapiMode,
}: {
    pendingVapiMode: string,
    setSelectedVapiSessionType: (type: 'chat' | 'talk') => void,
    selectedVapiSessionType: 'chat' | 'talk',
    setShowVapiSessionTypeSelector: (show: boolean) => void,
    startVapiCall: () => void,
    setPendingVapiMode: (mode: string) => void,
}) => {
    return <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm !mt-0 p-4">
        <div className="bg-gray-800 shadow-2xl p-8 border border-gray-700 rounded-3xl w-full max-w-2xl">
            <div className="mb-8 text-center">
                <h3 className="mb-4 font-bold text-white text-3xl">Choose VAPI Session Type</h3>
                <p className="text-gray-300 text-lg">How would you like to interact with the {pendingVapiMode} assistant?</p>
            </div>

            <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mb-8">
                {/* Talk Mode - Audio + Text */}
                <button
                    onClick={() => setSelectedVapiSessionType('talk')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 hover:scale-105 ${selectedVapiSessionType === 'talk'
                        ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                        }`}
                >
                    <div className="text-center">
                        <div className="flex justify-center items-center bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-4 rounded-2xl w-16 h-16">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <h4 className="mb-2 font-semibold text-white text-xl">Talk Mode</h4>
                        <p className="text-gray-300 text-sm">Voice conversation with transcript</p>
                        <div className="mt-3 text-gray-400 text-xs">
                            <div>• Voice-to-voice conversation</div>
                            <div>• Real-time transcript display</div>
                            <div>• Natural speech interaction</div>
                        </div>
                    </div>
                </button>

                {/* Chat Mode - Text Only */}
                <button
                    onClick={() => setSelectedVapiSessionType('chat')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 hover:scale-105 ${selectedVapiSessionType === 'chat'
                        ? 'border-green-500 bg-green-500 bg-opacity-10'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                        }`}
                >
                    <div className="text-center">
                        <div className="flex justify-center items-center bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mb-4 rounded-2xl w-16 h-16">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h4 className="mb-2 font-semibold text-white text-xl">Chat Mode</h4>
                        <p className="text-gray-300 text-sm">Text-only conversation</p>
                        <div className="mt-3 text-gray-400 text-xs">
                            <div>• Pure text messaging</div>
                            <div>• Faster response times</div>
                            <div>• Focus on conversation</div>
                        </div>
                    </div>
                </button>
            </div>

            <div className="flex justify-center space-x-4">
                <button
                    onClick={() => {
                        setShowVapiSessionTypeSelector(false)
                        setPendingVapiMode('')
                    }}
                    className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-xl font-medium text-white transition-colors duration-200"
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        setShowVapiSessionTypeSelector(false)
                        startVapiCall()
                    }}
                    className="bg-gradient-to-r from-blue-500 hover:from-blue-600 to-cyan-500 hover:to-cyan-600 shadow-lg px-8 py-3 rounded-xl font-medium text-white hover:scale-105 active:scale-95 transition-all duration-200"
                >
                    Start Session
                </button>
            </div>
        </div>
    </div>
}

export default VAPISessionTypeSelector