import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { spreadsheetId, range } = body

    // Validate required fields
    if (!spreadsheetId || !range) {
      return NextResponse.json(
        { error: 'Spreadsheet ID and range are required' },
        { status: 400 }
      )
    }

    // Create or update the configuration
    const config = await prisma.googleSheetConfig.upsert({
      where: { id: 'default' }, // Use a default ID for single config
      update: {
        spreadsheetId,
        range
      },
      create: {
        id: 'default',
        spreadsheetId,
        range
      }
    })

    return NextResponse.json(
      { message: 'Configuration saved successfully', config },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error saving configuration:', error)
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const config = await prisma.googleSheetConfig.findFirst()
    
    if (!config) {
      return NextResponse.json(
        { error: 'No configuration found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      spreadsheetId: config.spreadsheetId,
      range: config.range
    })

  } catch (error) {
    console.error('Error fetching configuration:', error)
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    )
  }
} 