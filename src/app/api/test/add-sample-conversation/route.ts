import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    // Get the first user (or create one if none exists)
    let user = await prisma.user.findFirst()
    
    if (!user) {
      // Create a test user if none exists
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'password',
          role: 'REP',
          minutes: 0
        }
      })
    }

    // Create a sample conversation
    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        transcript: 'This is a sample conversation transcript for testing purposes.',
        duration: 180, // 3 minutes in seconds
        grade: 'B',
        summary: 'Sample conversation with good performance.'
      }
    })

    return NextResponse.json({
      message: 'Sample conversation created successfully',
      conversation
    })

  } catch (error) {
    console.error('Error creating sample conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create sample conversation' },
      { status: 500 }
    )
  }
} 