import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface Activity {
  id: string
  type: 'conversation' | 'user_import'
  message: string
  grade?: string
  duration?: number
  timestamp: Date
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

export async function GET() {
  try {
    // Get recent conversations (last 5)
    const recentConversations = await prisma.conversation.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Get recent user imports (last 5)
    const recentImports = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true
      }
    })

    // Format activities
    const activities: Activity[] = []

    // Add recent conversations
    recentConversations.forEach(conv => {
      activities.push({
        id: `conv-${conv.id}`,
        type: 'conversation',
        message: `New conversation recorded for ${conv.user.firstName} ${conv.user.lastName}`,
        grade: conv.grade || undefined,
        duration: conv.duration,
        timestamp: conv.createdAt,
        user: conv.user
      })
    })

    // Add recent user imports
    recentImports.forEach(user => {
      activities.push({
        id: `user-${user.email}`,
        type: 'user_import',
        message: `New user imported: ${user.firstName} ${user.lastName}`,
        timestamp: user.createdAt,
        user: user
      })
    })

    // Sort by timestamp and take top 5
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)

    return NextResponse.json(sortedActivities)

  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent activities' },
      { status: 500 }
    )
  }
} 