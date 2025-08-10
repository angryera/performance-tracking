import { prisma } from './db'
import { GoogleSheetsService } from './google-sheets'

export async function syncUsageDataToGoogleSheets() {
  try {
    const config = await prisma.googleSheetConfig.findFirst()
    if (!config) {
      console.log('No Google Sheets configuration found, skipping sync')
      return
    }

    const googleSheetsService = new GoogleSheetsService()
    
    // Get all users with their usage data
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, minutes: true }
    })

    const usageData = await Promise.all(
      allUsers.map(async (user) => {
        const userConversations = await prisma.conversation.aggregate({
          where: { userId: user.id },
          _sum: { duration: true }
        })

        const totalSecondsUsed = userConversations._sum.duration || 0
        const usedMinutes = Math.round(totalSecondsUsed / 60)
        const remainingMinutes = Math.max(0, user.minutes - usedMinutes)
        const totalMinutes = user.minutes

        return {
          email: user.email,
          usedMinutes,
          remainingMinutes,
          totalMinutes
        }
      })
    )

    // Update usage data in Google Sheets
    await googleSheetsService.updateUserUsageData(
      config.spreadsheetId,
      config.range,
      usageData
    )

    // Update global granted minutes
    const globalSettings = await prisma.globalSettings.findFirst({
      where: { id: 'default' }
    })

    if (globalSettings) {
      await googleSheetsService.updateGrantedMinutes(
        config.spreadsheetId,
        globalSettings.grantedMinutes
      )
    }

    console.log(`Successfully synced usage data for ${usageData.length} users to Google Sheets`)
    return true
  } catch (error) {
    console.error('Failed to sync usage data to Google Sheets:', error)
    return false
  }
} 