import Link from 'next/link'
import { BarChart3, Users, Phone } from 'lucide-react'
import { Poppins, Quicksand } from 'next/font/google'

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
})

const quicksand = Quicksand({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-quicksand'
})

export default function HomePage() {
  return (
    // <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
    <div
      className={`${poppins.variable} ${quicksand.variable} min-h-screen relative`}
      style={{
        backgroundImage: "url('/VitlBackground.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Background Blur Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      <div className="z-10 relative mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 container">
        <div className="mb-8 sm:mb-12 lg:mb-16 text-center">
          <h1 className={`${quicksand.className} mb-3 sm:mb-4 px-2 font-bold text-white text-3xl sm:text-4xl lg:text-5xl drop-shadow-lg`}>
            Sales Performance Tracker
          </h1>
          <p className={`${poppins.className} mx-auto px-4 max-w-2xl text-white text-base sm:text-lg lg:text-xl drop-shadow-md opacity-95 font-light`}>
            Track, analyze, and optimize your sales team's performance with AI-powered insights
          </p>
        </div>

        <div className="gap-6 sm:gap-8 grid grid-cols-1 md:grid-cols-2 mx-auto max-w-4xl">
          {/* Manager Section */}
          <div className="bg-white/95 shadow-2xl hover:shadow-3xl backdrop-blur-sm p-6 sm:p-8 border border-white/20 rounded-xl transition-all duration-300">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                <BarChart3 className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
              </div>
              <h2 className={`${quicksand.className} ml-3 sm:ml-4 font-semibold text-xl sm:text-2xl text-gray-900`}>Manager Dashboard</h2>
            </div>
            <p className={`${poppins.className} mb-4 sm:mb-6 text-gray-700 text-sm sm:text-base font-light`}>
              Import data from Google Sheets, view performance metrics, and manage your sales team.
            </p>
            <ul className={`${poppins.className} space-y-1.5 sm:space-y-2 mb-6 sm:mb-8 text-gray-600 text-xs sm:text-sm font-light`}>
              <li>• Import reps data from Google Sheets</li>
              <li>• View conversation transcripts and grades</li>
              <li>• Access performance analytics</li>
              <li>• Manage team configurations</li>
            </ul>
            <Link
              href="/manager"
              className={`${poppins.className} inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg w-full sm:w-auto font-medium text-white text-sm sm:text-base transition-all duration-200 hover:scale-105 shadow-lg`}
            >
              Access Manager Dashboard
            </Link>
          </div>

          {/* Rep Section */}
          <div className="bg-white/95 shadow-2xl hover:shadow-3xl backdrop-blur-sm p-6 sm:p-8 border border-white/20 rounded-xl transition-all duration-300">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                <Phone className="w-6 sm:w-8 h-6 sm:h-8 text-green-600" />
              </div>
              <h2 className={`${quicksand.className} ml-3 sm:ml-4 font-semibold text-xl sm:text-2xl text-gray-900`}>LevelRep</h2>
            </div>
            <p className={`${poppins.className} mb-4 sm:mb-6 text-gray-700 text-sm sm:text-base font-light`}>
              Login to access your performance dashboard and start conversations with AI-powered bots.
            </p>
            <ul className={`${poppins.className} space-y-1.5 sm:space-y-2 mb-6 sm:mb-8 text-gray-600 text-xs sm:text-sm font-light`}>
              <li>• Secure login with email and password</li>
              <li>• Interactive VAPI widget for calls</li>
              <li>• View your performance metrics</li>
              <li>• Access conversation history</li>
            </ul>
            <Link
              href="/rep"
              className={`${poppins.className} inline-flex justify-center items-center bg-green-600 hover:bg-green-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg w-full sm:w-auto font-medium text-white text-sm sm:text-base transition-all duration-200 hover:scale-105 shadow-lg`}
            >
              Access Rep Portal
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 sm:mt-16 text-center">
          <h3 className={`${quicksand.className} mb-6 sm:mb-8 px-2 font-semibold text-xl sm:text-2xl text-white drop-shadow-lg`}>Key Features</h3>
          <div className="gap-6 sm:gap-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-4xl">
            <div className="text-center">
              <div className="flex justify-center items-center bg-purple-100 shadow-lg mx-auto mb-3 sm:mb-4 p-3 sm:p-4 rounded-full w-12 sm:w-16 h-12 sm:h-16">
                <Users className="w-6 sm:w-8 h-6 sm:h-8 text-purple-600" />
              </div>
              <h4 className={`${quicksand.className} mb-2 font-semibold text-base sm:text-lg text-white drop-shadow-md`}>Team Management</h4>
              <p className={`${poppins.className} px-2 text-white/90 text-xs sm:text-sm drop-shadow-sm font-light`}>
                Easily manage your sales team with Google Sheets integration
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center items-center bg-orange-100 shadow-lg mx-auto mb-3 sm:mb-4 p-3 sm:p-4 rounded-full w-12 sm:w-16 h-12 sm:h-16">
                <BarChart3 className="w-6 sm:w-8 h-6 sm:h-8 text-orange-600" />
              </div>
              <h4 className={`${quicksand.className} mb-2 font-semibold text-base sm:text-lg text-white drop-shadow-md`}>Performance Analytics</h4>
              <p className={`${poppins.className} px-2 text-white/90 text-xs sm:text-sm drop-shadow-sm font-light`}>
                AI-powered analysis of conversation quality and performance metrics
              </p>
            </div>
            <div className="sm:col-span-2 lg:col-span-1 text-center">
              <div className="flex justify-center items-center bg-teal-100 shadow-lg mx-auto mb-3 sm:mb-4 p-3 sm:p-4 rounded-full w-12 sm:w-16 h-12 sm:h-16">
                <Phone className="w-6 sm:w-8 h-6 sm:h-8 text-teal-600" />
              </div>
              <h4 className={`${quicksand.className} mb-2 font-semibold text-base sm:text-lg text-white drop-shadow-md`}>VAPI Integration</h4>
              <p className={`${poppins.className} px-2 text-white/90 text-xs sm:text-sm drop-shadow-sm font-light`}>
                Seamless integration with VAPI for AI-powered sales conversations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 