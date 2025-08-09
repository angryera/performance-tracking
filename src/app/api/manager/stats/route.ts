import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get total number of users (reps)
    const totalReps = await prisma.user.count({
      where: {
        role: 'REP'
      }
    })

    // Get total number of conversations
    const totalCalls = await prisma.conversation.count()

    // Get total minutes from users
    const totalMinutes = await prisma.user.aggregate({
      where: {
        role: 'REP'
      },
      _sum: {
        minutes: true
      }
    })

    // Calculate average grade from conversations
    const conversations = await prisma.conversation.findMany({
      where: {
        grade: {
          not: null
        }
      },
      select: {
        grade: true
      }
    })

    let avgGrade = 'N/A'
    if (conversations.length > 0) {
      const gradeValues = conversations.map(c => c.grade).filter(Boolean)
      if (gradeValues.length > 0) {
        // Simple grade calculation - you might want to implement a more sophisticated algorithm
        const gradeScores = gradeValues.map(grade => {
          switch (grade) {
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
    }

    return NextResponse.json({
      totalReps,
      totalCalls,
      avgGrade,
      totalMinutes: totalMinutes._sum.minutes || 0
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
} 