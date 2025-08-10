import { google } from 'googleapis'

export interface GoogleSheetRow {
  Role: string
  First_Name: string
  Last_Name: string
  Email: string
  Password: string
  Minutes: string
}

export interface GoogleSheetData {
  users: GoogleSheetRow[]
  grantedMinutes: number
}

export interface UserUsageData {
  email: string
  usedMinutes: number
  remainingMinutes: number
  totalMinutes: number
}

export class GoogleSheetsService {
  private auth: any
  private sheets: any

  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    this.sheets = google.sheets({ version: 'v4', auth: this.auth })
  }

  async getSheetData(spreadsheetId: string, range: string): Promise<GoogleSheetData> {
    try {
      // Get the main data
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        return { users: [], grantedMinutes: 0 }
      }

      // Assuming first row contains headers
      const headers = rows[0]
      const dataRows = rows.slice(1)

      const users = dataRows.map((row: any[]) => {
        const obj: any = {}
        headers.forEach((header: string, index: number) => {
          obj[header] = row[index] || ''
        })
        return obj as GoogleSheetRow
      })

      // Get granted minutes from cell L1
      let grantedMinutes = 0
      try {
        const grantedMinutesResponse = await this.sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'L1',
        })
        
        if (grantedMinutesResponse.data.values && grantedMinutesResponse.data.values[0]) {
          grantedMinutes = parseInt(grantedMinutesResponse.data.values[0][0]) || 0
        }
      } catch (error) {
        console.warn('Could not fetch granted minutes from L1:', error)
      }

      return { users, grantedMinutes }
    } catch (error) {
      console.error('Error fetching Google Sheet data:', error)
      throw new Error('Failed to fetch Google Sheet data')
    }
  }

  async clearMinutesFields(spreadsheetId: string, range: string): Promise<void> {
    try {
      // Get the current data to find the Minutes column
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) return

      const headers = rows[0]
      const minutesColumnIndex = headers.findIndex((header: string) => header === 'Minutes')
      
      if (minutesColumnIndex === -1) {
        console.warn('Minutes column not found in sheet')
        return
      }

      // Convert column index to A1 notation (e.g., 5 -> E)
      const columnLetter = String.fromCharCode(65 + minutesColumnIndex)
      
      // Clear all minutes fields (excluding header row)
      const clearRange = `${columnLetter}2:${columnLetter}${rows.length}`
      
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: clearRange,
      })

      console.log(`Cleared minutes fields in range ${clearRange}`)
    } catch (error) {
      console.error('Error clearing minutes fields:', error)
      throw new Error('Failed to clear minutes fields')
    }
  }

  async updateUserUsageData(spreadsheetId: string, range: string, usageData: UserUsageData[]): Promise<void> {
    try {
      // Get the current data to find column indices
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) return

      const headers = rows[0]
      const emailColumnIndex = headers.findIndex((header: string) => header === 'Email')
      const usedColumnIndex = headers.findIndex((header: string) => header === 'Used')
      const remainingColumnIndex = headers.findIndex((header: string) => header === 'Remaing')
      const totalColumnIndex = headers.findIndex((header: string) => header === 'Total')

      if (emailColumnIndex === -1) {
        console.warn('Email column not found in sheet')
        return
      }

      // Prepare batch update data
      const updates: any[] = []

      for (const usage of usageData) {
        // Find the row index for this user
        const userRowIndex = rows.findIndex((row: any[], index: number) => 
          index > 0 && row[emailColumnIndex] === usage.email
        )

        if (userRowIndex === -1) continue

        // Convert column indices to A1 notation
        const usedColumnLetter = String.fromCharCode(65 + usedColumnIndex)
        const remainingColumnLetter = String.fromCharCode(65 + remainingColumnIndex)
        const totalColumnLetter = String.fromCharCode(65 + totalColumnIndex)

        // Add updates for this user
        if (usedColumnIndex !== -1) {
          updates.push({
            range: `${usedColumnLetter}${userRowIndex + 1}`,
            values: [[usage.usedMinutes.toString()]]
          })
        }

        if (remainingColumnIndex !== -1) {
          updates.push({
            range: `${remainingColumnLetter}${userRowIndex + 1}`,
            values: [[usage.remainingMinutes.toString()]]
          })
        }

        if (totalColumnIndex !== -1) {
          updates.push({
            range: `${totalColumnLetter}${userRowIndex + 1}`,
            values: [[usage.totalMinutes.toString()]]
          })
        }
      }

      // Perform batch update
      if (updates.length > 0) {
        await this.sheets.spreadsheets.values.batchUpdate({
          spreadsheetId,
          requestBody: {
            valueInputOption: 'RAW',
            data: updates
          }
        })

        console.log(`Updated usage data for ${usageData.length} users`)
      }
    } catch (error) {
      console.error('Error updating user usage data:', error)
      throw new Error('Failed to update user usage data')
    }
  }

  async updateGrantedMinutes(spreadsheetId: string, grantedMinutes: number): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'L1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[grantedMinutes.toString()]]
        }
      })

      console.log(`Updated granted minutes to ${grantedMinutes}`)
    } catch (error) {
      console.error('Error updating granted minutes:', error)
      throw new Error('Failed to update granted minutes')
    }
  }
} 