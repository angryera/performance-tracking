import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, transcript, duration, grade, summary } = body

    // Validate required fields
    if (!userId || !transcript || !duration) {
      return NextResponse.json(
        { error: 'User ID, transcript, and duration are required' },
        { status: 400 }
      )
    }

    // Create conversation record
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        transcript,
        duration,
        grade: grade || null,
        summary: summary || null
      }
    })

    return NextResponse.json({
      message: 'Conversation saved successfully',
      conversation
    })

  } catch (error) {
    console.error('Error saving conversation:', error)
    return NextResponse.json(
      { error: 'Failed to save conversation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get conversations for the user
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json(conversations)

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
} 