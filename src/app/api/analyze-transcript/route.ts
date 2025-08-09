import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transcript } = body

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      )
    }

    // Analyze the transcript using OpenAI
    const analysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a sales performance analyst. Analyze the following sales conversation transcript and provide:

1. A comprehensive summary of the conversation
2. A grade (A, B, C, D, or F) based on the sales representative's performance
3. Specific feedback on what was done well and what could be improved
4. Best company matches based on the conversation content

Focus on:
- Sales techniques used
- Objection handling
- Product knowledge
- Communication skills
- Closing attempts
- Professionalism

Return your analysis in the following JSON format:
{
  "summary": "Detailed summary of the conversation...",
  "grade": "A",
  "feedback": "Detailed feedback on performance...",
  "best_matches": [
    "Company 1: Description of why this company matches",
    "Company 2: Description of why this company matches"
  ]
}`
        },
        {
          role: "user",
          content: `Please analyze this sales conversation transcript:\n\n${transcript}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const response = analysis.choices[0]?.message?.content

    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Try to parse the JSON response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(response)
    } catch (parseError) {
      // If parsing fails, create a structured response
      parsedResponse = {
        summary: response,
        grade: "C",
        feedback: "Analysis completed but could not parse structured response",
        best_matches: []
      }
    }

    return NextResponse.json(parsedResponse)

  } catch (error) {
    console.error('Error analyzing transcript:', error)
    return NextResponse.json(
      { error: 'Failed to analyze transcript' },
      { status: 500 }
    )
  }
} 