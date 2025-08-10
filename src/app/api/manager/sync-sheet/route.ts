import { NextRequest, NextResponse } from 'next/server'
import { syncUsageDataToGoogleSheets } from '@/lib/sync-utils'

export async function POST(request: NextRequest) {
  try {
    const success = await syncUsageDataToGoogleSheets()
    
    if (success) {
      return NextResponse.json(
        { 
          message: 'Successfully synced usage data to Google Sheets',
          success: true
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Failed to sync data to Google Sheets' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error syncing to Google Sheets:', error)
    return NextResponse.json(
      { error: 'Failed to sync data to Google Sheets' },
      { status: 500 }
    )
  }
} 