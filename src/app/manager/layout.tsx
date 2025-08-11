'use client'

import Link from 'next/link'
import { BarChart3, Settings, Users, LogOut, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Quicksand } from 'next/font/google'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin']
})

const quicksand = Quicksand({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin']
})

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  minutes: number
}

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // Check for existing session on component mount and listen for changes
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser)
          if (user.role === 'ADMIN') {
            setCurrentUser(user)
          } else {
            localStorage.removeItem('user')
            setCurrentUser(null)
          }
        } catch (error) {
          console.error('Error parsing saved user:', error)
          localStorage.removeItem('user')
          setCurrentUser(null)
        }
      } else {
        setCurrentUser(null)
      }
      setIsLoading(false)
    }

    // Check immediately
    checkAuth()

    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        checkAuth()
      }
    }

    // Listen for custom events (when user logs in/out from same tab)
    const handleAuthChange = () => {
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('managerAuthChange', handleAuthChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('managerAuthChange', handleAuthChange)
    }
  }, [])

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('user')
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('managerAuthChange'))
    window.location.href = '/manager'
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // If we're on the main manager page and not authenticated, don't show layout
  if (pathname === '/manager' && !currentUser && !isLoading) {
    return <>{children}</>
  }

  // If loading, show a simple loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white/80">Loading...</div>
      </div>
    )
  }

  // If not authenticated and not on login page, don't show layout
  if (!currentUser) {
    return <>{children}</>
  }

  return (
    <div
      className={`${quicksand.className} bg-gray-50 min-h-screen`}
      style={{
        backgroundImage: "url('/VitlBackground.png')",
        backgroundSize: '100%',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Header */}
      <header className="z-50 relative bg-slate-800 shadow-lg border-slate-700 border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <Link href="/manager" className="flex items-center">
                <BarChart3 className="mr-2 sm:mr-3 w-6 sm:w-7 h-6 sm:h-7 text-slate-300" />
                <span className={`${quicksand.className} font-semibold text-white text-lg sm:text-xl`}>
                  Manager Dashboard
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 lg:space-x-8">
              <Link
                href="/manager"
                className="hover:bg-slate-700 px-3 py-2 rounded-md font-medium text-slate-300 hover:text-white text-sm transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/manager/conversations"
                className="hover:bg-slate-700 px-3 py-2 rounded-md font-medium text-slate-300 hover:text-white text-sm transition-colors"
              >
                Conversations
              </Link>
              <Link
                href="/manager/performance"
                className="hover:bg-slate-700 px-3 py-2 rounded-md font-medium text-slate-300 hover:text-white text-sm transition-colors"
              >
                Performance
              </Link>
              <Link
                href="/manager/users"
                className="hover:bg-slate-700 px-3 py-2 rounded-md font-medium text-slate-300 hover:text-white text-sm transition-colors"
              >
                Users
              </Link>
              <Link
                href="/manager/config"
                className="hover:bg-slate-700 px-3 py-2 rounded-md font-medium text-slate-300 hover:text-white text-sm transition-colors"
              >
                Configuration
              </Link>
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Desktop Rep Portal Button */}
              <Link
                href="/rep"
                className="hidden sm:flex items-center hover:bg-slate-700 px-3 py-2 rounded-md text-slate-300 hover:text-white transition-colors"
              >
                <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium text-sm">Rep Portal</span>
              </Link>

              {/* Desktop Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center hover:bg-slate-700 px-3 py-2 rounded-md text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="mr-2 w-4 h-4" />
                <span className="font-medium text-sm">Sign Out</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden hover:bg-slate-700 p-2 rounded-md text-slate-300 hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden z-40 fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Drawer Menu */}
      <div className={`md:hidden fixed top-0 left-0 h-full w-64 bg-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        {/* Drawer Header */}
        <div className="flex justify-between items-center p-4 border-slate-700 border-b">
          <div className="flex items-center">
            <BarChart3 className="mr-3 w-6 h-6 text-slate-300" />
            <span className={`${quicksand.className} font-semibold text-white text-lg`}>Menu</span>
          </div>
          <button
            onClick={closeMobileMenu}
            className="hover:bg-slate-700 p-2 rounded-md text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Navigation */}
        <nav className="space-y-2 p-4">
          <Link
            href="/manager"
            onClick={closeMobileMenu}
            className="flex items-center hover:bg-slate-700 px-3 py-3 rounded-md font-medium text-slate-300 hover:text-white text-sm transition-colors"
          >
            <BarChart3 className="mr-3 w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/manager/conversations"
            onClick={closeMobileMenu}
            className="flex items-center hover:bg-slate-700 px-3 py-3 rounded-md font-medium text-slate-300 hover:text-white text-sm transition-colors"
          >
            <Users className="mr-3 w-5 h-5" />
            Conversations
          </Link>
          <Link
            href="/manager/performance"
            onClick={closeMobileMenu}
            className="flex items-center hover:bg-slate-700 px-3 py-3 rounded-md font-medium text-slate-300 hover:text-white text-sm transition-colors"
          >
            <BarChart3 className="mr-3 w-5 h-5" />
            Performance
          </Link>
          <Link
            href="/manager/users"
            onClick={closeMobileMenu}
            className="flex items-center hover:bg-slate-700 px-3 py-3 rounded-md font-medium text-slate-300 hover:text-white text-sm transition-colors"
          >
            <Users className="mr-3 w-5 h-5" />
            Users
          </Link>
          <Link
            href="/manager/config"
            onClick={closeMobileMenu}
            className="flex items-center hover:bg-slate-700 px-3 py-3 rounded-md font-medium text-slate-300 hover:text-white text-sm transition-colors"
          >
            <Settings className="mr-3 w-5 h-5" />
            Configuration
          </Link>
        </nav>

        {/* Drawer Footer */}
        <div className="right-0 bottom-0 left-0 absolute p-4 border-slate-700 border-t">
          <Link
            href="/rep"
            onClick={closeMobileMenu}
            className="flex items-center hover:bg-slate-700 mb-2 px-3 py-3 rounded-md text-slate-300 hover:text-white transition-colors"
          >
            <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium text-sm">Rep Portal</span>
          </Link>
          <button
            onClick={() => {
              handleLogout()
              closeMobileMenu()
            }}
            className="flex items-center hover:bg-slate-700 px-3 py-3 rounded-md w-full text-slate-300 hover:text-white transition-colors"
          >
            <LogOut className="mr-3 w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="z-10 relative bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3 max-w-7xl">
          <div className="flex sm:flex-row flex-col justify-between items-center">
            <div className="flex items-center space-x-3">
              <p className={`${poppins.className} text-sm text-gray-700`}>
                Welcome back, <span className="font-semibold">{currentUser?.firstName} {currentUser?.lastName}</span>
                {currentUser?.role === 'ADMIN' && (
                  <span className="inline-flex items-center bg-blue-100 ml-2 px-2 py-0.5 rounded-full font-medium text-blue-800 text-xs">
                    Admin
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
        {children}
      </main>
    </div>
  )
} 