import { AlertCircle } from "lucide-react"

const ErrorToast = ({ error }: { error: string }) => {
    return (
        <div className="top-4 right-4 z-[1000] fixed bg-red-500 shadow-lg px-6 py-3 rounded-lg text-white animate-slide-in-right">
            <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
            </div>
        </div>
    )
}

export default ErrorToast;