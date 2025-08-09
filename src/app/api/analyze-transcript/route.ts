import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  getCacheStatus,
  loadCompanyProfiles,
  extractMatches,
} from "../../../lib/company-profiles";

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

    // Load company profiles
    const profiles = await loadCompanyProfiles();
    console.log(`📂 Loaded ${Object.keys(profiles).length} company profiles`);

    if (Object.keys(profiles).length === 0) {
      console.log("⚠️ No company profiles found, using basic analysis");

      // Fallback to basic analysis without company profiles
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
      if (!response) {
        throw new Error("No response from OpenAI");
      }

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch (parseError) {
        parsedResponse = {
          summary: response,
          grade: "C",
          feedback: "Analysis completed but could not parse structured response",
          best_matches: [],
        };
      }

      return NextResponse.json(parsedResponse);
    }

    // Create company profiles blob
    const companyBlob = Object.entries(profiles)
      .map(([name, desc]) => `${name}:\n${desc}`)
      .join("\n\n");

    console.log("🧠 Sending to OpenAI with company profiles...");

    // Analyze with company profiles
    const analysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a sales recruiter assistant. You will receive a rep's transcript 
            and multiple company profiles. Your job is to:

            1. Provide a comprehensive summary of the conversation
            2. Grade the sales representative's performance (A, B, C, D, or F), please look at the transcript and consider the subjects that were covered and our training materials on these subjects.
            3. Give specific feedback on what was done well and what could be improved
            4. Recommend the best 3 company matches for the rep based on values, tone, and product alignment

            Focus on:
            - Sales techniques used
            - Objection handling
            - Product knowledge
            - Communication skills
            - Closing attempts
            - Professionalism
            - Company culture fit

            Return your analysis in the following JSON format:
            {
              "summary": "Detailed summary of the conversation...",
              "grade": "A",
              "feedback": "Detailed feedback on performance...",
              "best_matches": [
                "Company 1: Description of why this company matches",
                "Company 2: Description of why this company matches",
                "Company 3: Description of why this company matches"
              ]
            }`,
        },
        {
          role: "user",
          content: `Transcript:\n${transcript}`,
        },
        {
          role: "user",
          content: `Company Profiles:\n${companyBlob}`,
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
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    // Try to parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);

      // Extract matches if they're in the response
      if (parsedResponse.best_matches && Array.isArray(parsedResponse.best_matches)) {
        const extractedMatches = extractMatches(response);
        if (extractedMatches.length > 0) {
          parsedResponse.best_matches = extractedMatches;
        }
      }

      console.log("🏆 Analysis completed successfully");
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      // If parsing fails, create a structured response
      parsedResponse = {
        summary: response,
        grade: "C",
        feedback: "Analysis completed but could not parse structured response",
        best_matches: extractMatches(response),
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
