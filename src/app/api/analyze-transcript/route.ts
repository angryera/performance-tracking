import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getCacheStatus } from "../../../lib/company-profiles";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GET endpoint to check cache status
export async function GET() {
  const cacheStatus = getCacheStatus();
  return NextResponse.json({
    status: "API is working",
    message: "analyze-transcript endpoint is available",
    cacheStatus,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    console.log(
      "📥 Transcript received:",
      transcript.substring(0, 200) + "..."
    );

    // Simple analysis without company profiles for now
    const analysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a sales performance analyst. Analyze the following sales conversation transcript and provide:

1. A comprehensive summary of the conversation
2. A grade (A, B, C, D, or F) based on the sales representative's performance
3. Specific feedback on what was done well and what could be improved
4. General recommendations for improvement

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
  "best_matches": []
}`,
        },
        {
          role: "user",
          content: `Please analyze this sales conversation transcript:\n\n${transcript}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const response = analysis.choices[0]?.message?.content;
    console.log(
      "🧠 GPT Response received:",
      response?.substring(0, 200) + "..."
    );

    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Try to parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
      console.log("🏆 Analysis completed successfully");
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      // If parsing fails, create a structured response
      parsedResponse = {
        summary: response,
        grade: "C",
        feedback: "Analysis completed but could not parse structured response",
        best_matches: [],
      };
    }

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("🔥 Error during transcript analysis:", error);
    return NextResponse.json(
      { error: "Failed to analyze transcript" },
      { status: 500 }
    );
  }
}
