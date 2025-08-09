import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const callId = searchParams.get('callId')

    if (!callId) {
      return NextResponse.json(
        { error: 'Call ID is required' },
        { status: 400 }
      )
    }

    // Get call information from VAPI or your call tracking system
    // This is a placeholder - you would integrate with VAPI's call endpoint
    const callData = {
      id: callId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'completed',
      duration: 0 // Will be calculated from timestamps
    }

    // Calculate duration from timestamps
    const startTime = new Date(callData.createdAt)
    const endTime = new Date(callData.updatedAt)
    const durationInSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)

    return NextResponse.json({
      ...callData,
      duration: durationInSeconds
    })

  } catch (error) {
    console.error('Error fetching call data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch call data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { callId, status, transcript } = body

    if (!callId) {
      return NextResponse.json(
        { error: 'Call ID is required' },
        { status: 400 }
      )
    }

    // Update call status and get final timestamps
    // This would integrate with VAPI to update call status
    const updatedCall = {
      id: callId,
      status: status || 'completed',
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Call updated successfully',
      call: updatedCall
    })

  } catch (error) {
    console.error('Error updating call:', error)
    return NextResponse.json(
      { error: 'Failed to update call' },
      { status: 500 }
    )
  }
} 