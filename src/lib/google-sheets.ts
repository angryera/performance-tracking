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

export class GoogleSheetsService {
  private auth: any
  private sheets: any

  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
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
} 