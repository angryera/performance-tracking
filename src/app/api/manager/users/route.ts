import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get all users with their conversations
    const users = await prisma.user.findMany({
      include: {
        conversations: true
      },
      orderBy: {
        firstName: 'asc'
      }
    })

    // Calculate performance metrics for each user
    const usersWithStats = users.map(user => {
      const conversations = user.conversations
      const totalCalls = conversations.length
      const totalDuration = conversations.reduce((sum: number, conv: any) => sum + conv.duration, 0)
      
      // Calculate average grade
      const gradedConversations = conversations.filter((conv: any) => conv.grade)
      let avgGrade = 'N/A'
      
      if (gradedConversations.length > 0) {
        const gradeScores = gradedConversations.map((conv: any) => {
          switch (conv.grade) {
            case 'A': return 4
            case 'B': return 3
            case 'C': return 2
            case 'D': return 1
            case 'F': return 0
            default: return 0
          }
        })
        
        const averageScore = gradeScores.reduce((a: number, b: number) => a + b, 0) / gradeScores.length
        
        if (averageScore >= 3.5) avgGrade = 'A'
        else if (averageScore >= 2.5) avgGrade = 'B'
        else if (averageScore >= 1.5) avgGrade = 'C'
        else if (averageScore >= 0.5) avgGrade = 'D'
        else avgGrade = 'F'
      }

      // Calculate minutes used and remaining
      const totalMinutesUsed = Math.round(totalDuration / 60)
      const grantedMinutes = user.minutes || 0
      const remainingMinutes = Math.max(0, grantedMinutes - totalMinutesUsed)

      // Get last activity
      const lastActivity = conversations.length > 0 ? 
        conversations[conversations.length - 1].createdAt : null

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        minutes: grantedMinutes,
        totalCalls,
        avgGrade,
        totalMinutesUsed,
        remainingMinutes,
        lastActivity
      }
    })

    return NextResponse.json(usersWithStats)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
} 