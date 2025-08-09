import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { GoogleSheetsService } from '@/lib/google-sheets'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Get the Google Sheets configuration
    const config = await prisma.googleSheetConfig.findFirst()
    
    if (!config) {
      return NextResponse.json(
        { error: 'Google Sheets configuration not found. Please configure it first.' },
        { status: 400 }
      )
    }

    // Initialize Google Sheets service
    const googleSheetsService = new GoogleSheetsService()
    
    // Fetch data from Google Sheets
    const sheetData = await googleSheetsService.getSheetData(
      config.spreadsheetId,
      config.range
    )

    // Save or update global granted minutes
    const globalSettings = await prisma.globalSettings.upsert({
      where: { id: 'default' },
      update: {
        grantedMinutes: sheetData.grantedMinutes
      },
      create: {
        id: 'default',
        grantedMinutes: sheetData.grantedMinutes
      }
    })

    // Process and save the user data
    for (const row of sheetData.users) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: row.Email }
      })

      if (existingUser) {
        // Update existing user
        await prisma.user.update({
          where: { email: row.Email },
          data: {
            firstName: row.First_Name,
            lastName: row.Last_Name,
            role: row.Role as 'ADMIN' | 'REP',
            minutes: parseInt(row.Minutes) || 0,
            // Only update password if it's different
            ...(row.Password !== existingUser.password && {
              password: await bcrypt.hash(row.Password, 10)
            })
          }
        })
      } else {
        // Create new user
        await prisma.user.create({
          data: {
            email: row.Email,
            firstName: row.First_Name,
            lastName: row.Last_Name,
            password: await bcrypt.hash(row.Password, 10),
            role: row.Role as 'ADMIN' | 'REP',
            minutes: parseInt(row.Minutes) || 0
          }
        })
      }
    }

    return NextResponse.json(
      { message: `Successfully imported ${sheetData.users.length} users from Google Sheets with ${sheetData.grantedMinutes} granted minutes` },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error importing from Google Sheets:', error)
    return NextResponse.json(
      { error: 'Failed to import data from Google Sheets' },
      { status: 500 }
    )
  }
} 