# Google Sheets Two-Way Sync

This document explains how the two-way synchronization between the database and Google Sheets works in the Performance Tracking App.

## Overview

The system maintains synchronization between the database and Google Sheets in two directions:

1. **Import from Google Sheets**: Import user data and update minutes
2. **Export to Google Sheets**: Sync usage data (used, remaining, total minutes)

## How It Works

### 1. Import Process (`/api/manager/import-sheet`)

When you import data from Google Sheets:

1. **Read Data**: Fetches user data and granted minutes from the sheet
2. **Update Database**: Creates/updates users and their minutes
3. **Clear Minutes**: Removes the minutes values from the Google Sheet (to prevent double-counting)
4. **Sync Usage**: Automatically syncs current usage data back to the sheet

### 2. Automatic Sync

The system automatically syncs data to Google Sheets when:

- A new conversation is created (`/api/conversations`)
- Data is imported from Google Sheets
- Manual sync is triggered

### 3. Manual Sync (`/api/manager/sync-sheet`)

You can manually sync data to Google Sheets using the "Sync to Sheet" button in the manager dashboard.

## Google Sheet Structure

Your Google Sheet should have these columns:

| Column | Purpose | Example |
|--------|---------|---------|
| Role | User role (ADMIN/REP) | ADMIN |
| First_Name | User's first name | Philip |
| Last_Name | User's last name | Buonforte |
| Email | User's email | philip@example.com |
| Password | User's password | Password123 |
| Minutes | Minutes to grant (will be cleared after import) | 900 |
| Used | Minutes used (auto-updated) | 35 |
| Remaing | Minutes remaining (auto-updated) | 865 |
| Total | Total minutes granted (auto-updated) | 900 |

**Special Cells:**
- **L1**: Global granted minutes (1500)

## Data Flow

### Import Flow
```
Google Sheet → Database → Clear Minutes → Sync Usage Back
```

### Usage Update Flow
```
Database Usage Changes → Auto-sync to Google Sheet
```

## API Endpoints

### Import Sheet
- **POST** `/api/manager/import-sheet`
- Imports user data and clears minutes fields
- Automatically syncs usage data back

### Sync Sheet
- **POST** `/api/manager/sync-sheet`
- Manually syncs current usage data to Google Sheets
- Updates used, remaining, and total minutes

### Conversations
- **POST** `/api/conversations`
- Creates new conversations
- Automatically syncs usage data to Google Sheets

## Configuration

Make sure you have these environment variables set:

```env
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Best Practices

1. **Import First**: Always import data before making changes
2. **Minutes Management**: The system automatically clears minutes after import to prevent double-counting
3. **Regular Sync**: Use the manual sync button to ensure data consistency
4. **Monitor Logs**: Check console logs for sync status and errors

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure your service account has edit access to the Google Sheet
2. **Column Mismatch**: Verify column names match exactly (case-sensitive)
3. **Sync Failures**: Check if Google Sheets configuration exists in the database

### Debug Steps

1. Check browser console for error messages
2. Verify Google Sheets API credentials
3. Ensure the sheet ID and range are correctly configured
4. Check if the sheet has the required columns

## Example Usage

1. **Setup**: Configure Google Sheets integration in the manager dashboard
2. **Import**: Click "Import Data" to bring in user data
3. **Monitor**: Watch usage data automatically sync as conversations are created
4. **Manual Sync**: Use "Sync to Sheet" button to force a sync when needed

The system ensures your database and Google Sheets stay synchronized, providing real-time visibility into user minutes and usage patterns. 