import { NextRequest, NextResponse } from 'next/server'
import { GoogleSheetsService } from '@/lib/google-sheets'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { spreadsheetId, range, clientEmail, privateKey } = body

    // Validate required fields
    if (!spreadsheetId || !range || !clientEmail || !privateKey) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Temporarily set environment variables for testing
    process.env.GOOGLE_SHEETS_CLIENT_EMAIL = clientEmail
    process.env.GOOGLE_SHEETS_PRIVATE_KEY = privateKey

    // Initialize Google Sheets service
    const googleSheetsService = new GoogleSheetsService()
    
    // Test the connection by fetching a small amount of data
    const sheetData = await googleSheetsService.getSheetData(spreadsheetId, range)

    return NextResponse.json(
      { 
        message: 'Connection test successful',
        rowCount: sheetData.length,
        sampleData: sheetData.slice(0, 2) // Return first 2 rows as sample
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error testing Google Sheets connection:', error)
    return NextResponse.json(
      { error: 'Connection test failed. Please check your credentials and spreadsheet ID.' },
      { status: 500 }
    )
  }
} 