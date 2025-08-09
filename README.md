# Sales Performance Tracker

A modern web application for tracking and analyzing sales representative performance using Next.js, TypeScript, Tailwind CSS, and Prisma.

## Features

### Manager Dashboard
- **Google Sheets Integration**: Import sales rep data directly from Google Sheets
- **Conversation Management**: View all conversation transcripts with AI-generated grades
- **Performance Analytics**: Comprehensive performance metrics and analytics
- **Configuration Management**: Easy setup for Google Sheets integration

### Sales Rep Portal
- **Secure Authentication**: Login with email and password
- **VAPI Integration**: AI-powered conversation widgets
- **Performance Tracking**: View personal performance metrics
- **Conversation History**: Access to past conversations and grades

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **External APIs**: Google Sheets API, OpenAI API, VAPI
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google Cloud Platform account (for Google Sheets API)
- OpenAI API key
- VAPI account

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sales-performance-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in the required environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/sales_performance_tracker"
   
   # NextAuth
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Google Sheets API
   GOOGLE_SHEETS_PRIVATE_KEY="your-google-sheets-private-key"
   GOOGLE_SHEETS_CLIENT_EMAIL="your-google-sheets-client-email"
   
   # OpenAI (for transcript analysis)
   OPENAI_API_KEY="your-openai-api-key"
   
   # JWT Secret
   JWT_SECRET="your-jwt-secret"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Google Sheets Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google Sheets API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it

3. **Create Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the service account details
   - Download the JSON credentials file

4. **Share your Google Sheet**
   - Open your Google Sheet with sales rep data
   - Share it with the service account email (found in the JSON file)
   - Give it "Viewer" permissions

5. **Configure in the app**
   - Go to the Manager Dashboard > Configuration
   - Enter the spreadsheet ID (from the URL)
   - Enter the service account email and private key
   - Test the connection

## Google Sheet Format

Your Google Sheet should have the following columns:

| Role | First_Name | Last_Name | Email | Password | Minutes |
|------|------------|-----------|-------|----------|---------|
| ADMIN | Philip | Buonforte | philipbuonforte@gmail.com | Password | 900 |
| Rep | Tara | Buonforte | tarabuonforte | Password | 99 |

## Database Schema

The application uses the following main tables:

- **users**: Sales representatives and admins
- **conversations**: Call transcripts and grades
- **performance**: Performance metrics and analytics
- **google_sheet_configs**: Google Sheets integration settings

## API Routes

### Manager APIs
- `POST /api/manager/import-sheet`: Import data from Google Sheets
- `POST /api/manager/config`: Save Google Sheets configuration
- `POST /api/manager/test-connection`: Test Google Sheets connection

### Rep APIs
- `POST /api/auth/login`: User authentication
- `POST /api/conversations`: Save conversation data
- `GET /api/conversations`: Get user's conversations

## Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   ├── manager/            # Manager dashboard pages
│   ├── rep/                # Sales rep portal pages
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # Reusable components
├── lib/                    # Utility functions and services
│   ├── db.ts              # Database client
│   ├── google-sheets.ts   # Google Sheets service
│   └── utils.ts           # Utility functions
└── types/                 # TypeScript type definitions
```

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Database Migrations

```bash
# Generate migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production environment variables**

3. **Deploy to your preferred platform**
   - Vercel (recommended for Next.js)
   - Netlify
   - AWS
   - DigitalOcean

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository. 