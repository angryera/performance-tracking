'use client'

import { useState, useEffect } from 'react'
import { Save, Wifi, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export default function ConfigPage() {
  const [formData, setFormData] = useState({
    spreadsheetId: '',
    range: 'A:F'
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)

  // Fetch current configuration on page load
  useEffect(() => {
    fetchCurrentConfig()
  }, [])

  const fetchCurrentConfig = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/manager/config')
      
      if (response.ok) {
        const config = await response.json()
        setFormData({
          spreadsheetId: config.spreadsheetId || '',
          range: config.range || 'A:F'
        })
      } else if (response.status === 404) {
        // No configuration exists yet, use defaults
        setFormData({
          spreadsheetId: '',
          range: 'A:F'
        })
      } else {
        setStatus({ type: 'error', message: 'Failed to load current configuration' })
      }
    } catch (error) {
      console.error('Error fetching configuration:', error)
      setStatus({ type: 'error', message: 'Error loading configuration. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setStatus(null)

    try {
      const response = await fetch('/api/manager/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setStatus({ type: 'success', message: 'Configuration saved successfully!' })
      } else {
        setStatus({ type: 'error', message: 'Failed to save configuration. Please try again.' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error saving configuration. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setStatus(null)

    try {
      const response = await fetch('/api/manager/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setStatus({ type: 'success', message: 'Connection test successful! Google Sheets is accessible.' })
      } else {
        setStatus({ type: 'error', message: 'Connection test failed. Please check your credentials and spreadsheet ID.' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error testing connection. Please try again.' })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-white text-2xl sm:text-3xl">Configuration</h1>
        <p className="mt-1 text-white/80 text-sm sm:text-base">Configure Google Sheets integration for data import</p>
      </div>

      {/* Status Message */}
      {status && (
        <div className={`p-3 sm:p-4 rounded-lg border ${status.type === 'success'
          ? 'bg-green-50 text-green-800 border-green-200'
          : status.type === 'error'
            ? 'bg-red-50 text-red-800 border-red-200'
            : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}>
          <div className="flex items-center">
            {status.type === 'success' ? (
              <CheckCircle className="flex-shrink-0 mr-2 w-4 h-4" />
            ) : (
              <AlertCircle className="flex-shrink-0 mr-2 w-4 h-4" />
            )}
            <span className="text-sm sm:text-base">{status.message}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8 sm:py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 sm:w-6 h-5 sm:h-6 text-white animate-spin" />
            <span className="text-white/80 text-sm sm:text-base">Loading configuration...</span>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      {!isLoading && (
        <div className="bg-white shadow p-4 sm:p-6 rounded-lg">
          <h2 className="mb-4 sm:mb-6 font-semibold text-gray-900 text-base sm:text-lg">Google Sheets Configuration</h2>

          <div className="space-y-4 sm:space-y-6">
            {/* Spreadsheet ID */}
            <div>
              <label htmlFor="spreadsheetId" className="block mb-2 font-medium text-gray-700 text-sm">
                Spreadsheet ID
              </label>
              <input
                type="text"
                id="spreadsheetId"
                name="spreadsheetId"
                value={formData.spreadsheetId}
                onChange={handleInputChange}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-sm sm:text-base"
              />
              <p className="mt-1 overflow-hidden text-gray-500 text-xs text-ellipsis whitespace-nowrap">
                Found in the URL: https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
              </p>
            </div>

            {/* Range */}
            <div>
              <label htmlFor="range" className="block mb-2 font-medium text-gray-700 text-sm">
                Data Range
              </label>
              <input
                type="text"
                id="range"
                name="range"
                value={formData.range}
                onChange={handleInputChange}
                placeholder="A:F"
                className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-sm sm:text-base"
              />
              <p className="mt-1 text-gray-500 text-xs">
                Range to import (e.g., A:F for columns A through F)
              </p>
            </div>

            {/* Environment Variables Info */}
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <h4 className="mb-2 font-medium text-blue-900 text-sm sm:text-base">Google Sheets Credentials</h4>
              <p className="mb-2 text-blue-800 text-xs sm:text-sm">
                Make sure you have set up the following environment variables in your .env file:
              </p>
              <div className="space-y-1 font-mono text-blue-700 text-xs">
                <div>GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com</div>
                <div>GOOGLE_SHEETS_PRIVATE_KEY=your-private-key</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex sm:flex-row flex-col sm:space-x-4 space-y-3 sm:space-y-0 mt-6 sm:mt-8">
            <button
              onClick={handleTestConnection}
              disabled={isTesting || !formData.spreadsheetId}
              className="inline-flex justify-center items-center bg-white hover:bg-gray-50 disabled:opacity-50 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg w-full sm:w-auto font-medium text-gray-700 text-sm disabled:cursor-not-allowed"
            >
              <Wifi className="mr-2 w-4 h-4" />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving || !formData.spreadsheetId}
              className="inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-3 sm:px-4 py-2 rounded-lg w-full sm:w-auto font-medium text-white text-sm disabled:cursor-not-allowed"
            >
              <Save className="mr-2 w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
        <h3 className="mb-3 sm:mb-4 font-semibold text-blue-900 text-base sm:text-lg">Setup Instructions</h3>
        <div className="space-y-2 sm:space-y-3 text-blue-800 text-xs sm:text-sm">
          <p>1. Create a Google Service Account in your Google Cloud Console</p>
          <p>2. Download the JSON credentials file</p>
          <p>3. Add the credentials to your .env file (see above)</p>
          <p>4. Share your Google Sheet with the service account email</p>
          <p>5. Copy the spreadsheet ID from the URL</p>
          <p>6. Test the connection before saving</p>
        </div>
      </div>
    </div>
  )
} 