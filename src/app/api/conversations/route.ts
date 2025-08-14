import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { syncUsageDataToGoogleSheets } from '@/lib/sync-utils'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, transcript, mergedTranscript, duration, grade, summary } = body

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Validate that the user exists before creating conversation
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!userExists) {
      return NextResponse.json(
        { error: `User with ID '${userId}' not found. Please ensure you are logged in with a valid account.` },
        { status: 400 }
      )
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        transcript,
        mergedTranscript: mergedTranscript ? JSON.stringify(mergedTranscript) : null,
        duration,
        grade,
        summary,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    // Automatically sync usage data to Google Sheets after conversation creation
    try {
      await syncUsageDataToGoogleSheets()
    } catch (error) {
      console.warn('Failed to auto-sync to Google Sheets after conversation creation:', error)
      // Don't fail the conversation creation if syncing fails
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const showDeleted = searchParams.get('deleted') === 'true'

    const conversations = await prisma.conversation.findMany({
      where: {
        deleted: showDeleted, // Show deleted conversations if requested
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Parse mergedTranscript back to array for each conversation
    const conversationsWithParsedTranscript = conversations.map((conversation: any) => ({
      ...conversation,
      mergedTranscript: conversation.mergedTranscript ? JSON.parse(conversation.mergedTranscript) : null,
    }))

    return NextResponse.json(conversationsWithParsedTranscript)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, action } = body

    if (!conversationId || !action) {
      return NextResponse.json(
        { error: 'Missing conversationId or action' },
        { status: 400 }
      )
    }

    let updateData: any = {}
    
    if (action === 'hide') {
      updateData.deleted = true
    } else if (action === 'restore') {
      updateData.deleted = false
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "hide" or "restore"' },
        { status: 400 }
      )
    }

    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: updateData,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    )
  }
}
