import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { GoogleSheetsService } from '@/lib/google-sheets'
import { syncUsageDataToGoogleSheets } from '@/lib/sync-utils'
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
            // Only update minutes if they are available and greater than 0
            ...(row.Minutes && parseInt(row.Minutes) > 0 && {
              minutes: parseInt(row.Minutes)
            }),
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

    // Clear minutes fields in Google Sheets after successful import
    try {
      await googleSheetsService.clearMinutesFields(
        config.spreadsheetId,
        config.range
      )
      console.log('Successfully cleared minutes fields in Google Sheets')
    } catch (error) {
      console.warn('Failed to clear minutes fields in Google Sheets:', error)
      // Don't fail the entire import if clearing fails
    }

    // Sync current usage data back to Google Sheets
    try {
      await syncUsageDataToGoogleSheets()
      console.log('Successfully synced usage data to Google Sheets')
    } catch (error) {
      console.warn('Failed to sync usage data to Google Sheets:', error)
      // Don't fail the entire import if syncing fails
    }

    return NextResponse.json(
      { message: `Successfully imported ${sheetData.users.length} users from Google Sheets with ${sheetData.grantedMinutes} granted minutes. Minutes fields cleared and usage data synced.` },
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