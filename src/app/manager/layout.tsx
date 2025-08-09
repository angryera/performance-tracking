'use client'

import Link from 'next/link'
import { BarChart3, Settings, Users, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="z-50 relative bg-slate-800 shadow-lg border-slate-700 border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <Link href="/manager" className="flex items-center">
                <BarChart3 className="mr-2 sm:mr-3 w-6 sm:w-7 h-6 sm:h-7 text-slate-300" />
                <span className="font-semibold text-white text-lg sm:text-xl">
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
                href="/manager/config"
                className="hover:bg-slate-700 px-3 py-2 rounded-md font-medium text-slate-300 hover:text-white text-sm transition-colors"
              >
                Configuration
              </Link>
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Desktop Exit Button */}
              <Link
                href="/"
                className="hidden sm:flex items-center hover:bg-slate-700 px-3 py-2 rounded-md text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="mr-2 w-4 h-4" />
                <span className="font-medium text-sm">Exit</span>
              </Link>

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
      <div className={`md:hidden fixed top-0 left-0 h-full w-64 bg-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Drawer Header */}
        <div className="flex justify-between items-center p-4 border-slate-700 border-b">
          <div className="flex items-center">
            <BarChart3 className="mr-3 w-6 h-6 text-slate-300" />
            <span className="font-semibold text-white text-lg">Menu</span>
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
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center hover:bg-slate-700 px-3 py-3 rounded-md text-slate-300 hover:text-white transition-colors"
          >
            <LogOut className="mr-3 w-5 h-5" />
            <span className="font-medium text-sm">Exit to Home</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
        {children}
      </main>
    </div>
  )
} 