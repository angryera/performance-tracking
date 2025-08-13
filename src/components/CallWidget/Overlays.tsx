export const ConnectingOverlay = ({ selectedMode }: { selectedMode: string }) => {
    return (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm !mt-0">
            <div className="bg-gray-800 p-8 border border-gray-700 rounded-2xl text-center">
                <div className="mx-auto mb-4 border-cyan-400 border-b-2 rounded-full w-12 h-12 animate-spin"></div>
                <p className="font-semibold text-white text-lg">
                    {selectedMode === 'sell' ? 'Connecting to video assistant...' : 'Connecting to assistant...'}
                </p>
            </div>
        </div>
    )
}

export const ProcessingOverlay = ({ selectedMode }: { selectedMode: string }) => {
    return (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm !mt-0">
            <div className="bg-gray-800 p-8 border border-gray-700 rounded-2xl max-w-md text-center">
                <div className="mx-auto mb-4 border-purple-400 border-b-2 rounded-full w-12 h-12 animate-spin"></div>
                <h3 className="mb-2 font-bold text-white text-xl">
                    {selectedMode === 'sell' ? 'Analyzing Performance' : 'Analyzing Conversation'}
                </h3>
                <p className="mb-4 text-gray-300 text-sm">
                    {selectedMode === 'sell' ? 'AI is evaluating your conversation and generating insights...' : 'AI is evaluating your conversation and generating insights...'}
                </p>
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
    )
}