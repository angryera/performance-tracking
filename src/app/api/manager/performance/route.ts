import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week'

    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Get all users with their performance data
    const users = await prisma.user.findMany({
      where: {
        role: 'REP'
      },
      include: {
        conversations: {
          where: {
            createdAt: {
              gte: startDate
            }
          }
        }
      }
    })

    // Calculate performance metrics for each user
    const performanceData = users.map(user => {
      const conversations = user.conversations
      const totalCalls = conversations.length
      const totalDuration = conversations.reduce((sum, conv) => sum + conv.duration, 0)
      
      // Calculate average grade
      const gradedConversations = conversations.filter(conv => conv.grade)
      let avgGrade = 'N/A'
      
      if (gradedConversations.length > 0) {
        const gradeScores = gradedConversations.map(conv => {
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

      return {
        userId: user.id,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        totalCalls,
        avgGrade,
        totalDuration,
        lastActivity: conversations.length > 0 ? 
          conversations[conversations.length - 1].createdAt : null
      }
    })

    // Calculate summary statistics
    const totalReps = users.length
    const totalCalls = performanceData.reduce((sum, p) => sum + p.totalCalls, 0)
    const totalDuration = performanceData.reduce((sum, p) => sum + p.totalDuration, 0)
    
    // Calculate overall average grade
    const allGradedConversations = users.flatMap(user => 
      user.conversations.filter(conv => conv.grade)
    )
    
    let overallAvgGrade = 'N/A'
    if (allGradedConversations.length > 0) {
      const gradeScores = allGradedConversations.map(conv => {
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
      
      if (averageScore >= 3.5) overallAvgGrade = 'A'
      else if (averageScore >= 2.5) overallAvgGrade = 'B'
      else if (averageScore >= 1.5) overallAvgGrade = 'C'
      else if (averageScore >= 0.5) overallAvgGrade = 'D'
      else overallAvgGrade = 'F'
    }

    // Calculate grade distribution
    const gradeDistribution = {
      A: allGradedConversations.filter(conv => conv.grade === 'A').length,
      B: allGradedConversations.filter(conv => conv.grade === 'B').length,
      C: allGradedConversations.filter(conv => conv.grade === 'C').length,
      D: allGradedConversations.filter(conv => conv.grade === 'D').length,
      F: allGradedConversations.filter(conv => conv.grade === 'F').length
    }

    const totalGraded = Object.values(gradeDistribution).reduce((a, b) => a + b, 0)
    const gradePercentages = totalGraded > 0 ? {
      A: Math.round((gradeDistribution.A / totalGraded) * 100),
      B: Math.round((gradeDistribution.B / totalGraded) * 100),
      C: Math.round((gradeDistribution.C / totalGraded) * 100),
      D: Math.round((gradeDistribution.D / totalGraded) * 100),
      F: Math.round((gradeDistribution.F / totalGraded) * 100)
    } : { A: 0, B: 0, C: 0, D: 0, F: 0 }

    // Get call volume trend (last 7 days)
    const callTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      const dayCalls = await prisma.conversation.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      })
      
      callTrend.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        calls: dayCalls
      })
    }

    return NextResponse.json({
      summary: {
        totalReps,
        totalCalls,
        overallAvgGrade,
        totalMinutes: Math.round(totalDuration / 60)
      },
      performanceData: performanceData.sort((a, b) => b.totalCalls - a.totalCalls),
      gradeDistribution: gradePercentages,
      callTrend
    })

  } catch (error) {
    console.error('Error fetching performance data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
} 