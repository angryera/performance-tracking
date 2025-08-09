import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Conversation } from "@prisma/client";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, transcript, mergedTranscript, duration, grade, summary } =
      body;

    // Validate required fields
    if (!userId || !transcript || !duration) {
      return NextResponse.json(
        { error: "User ID, transcript, and duration are required" },
        { status: 400 }
      );
    }

    // Convert mergedTranscript array to JSON string if provided
    let mergedTranscriptJson = null;
    if (mergedTranscript && Array.isArray(mergedTranscript)) {
      mergedTranscriptJson = JSON.stringify(mergedTranscript);
    }

    // Create conversation record with type assertion
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        transcript,
        mergedTranscript: mergedTranscriptJson,
        duration,
        grade: grade || null,
        summary: summary || null,
      } as any,
    });

    return NextResponse.json({
      message: "Conversation saved successfully",
      conversation,
    });
  } catch (error) {
    console.error("Error saving conversation:", error);
    return NextResponse.json(
      { error: "Failed to save conversation" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // If userId is provided, get conversations for that specific user
    // If no userId, get all conversations (for manager view)
    const whereClause = userId ? { userId } : {};

    // Get conversations
    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Parse mergedTranscript JSON for each conversation
    const conversationsWithParsedTranscript = conversations.map(
      (conversation: Conversation) => {
        let parsedMergedTranscript = null;
        if (conversation.mergedTranscript) {
          try {
            parsedMergedTranscript = JSON.parse(conversation.mergedTranscript);
          } catch (error) {
            console.error(
              "Error parsing mergedTranscript for conversation:",
              conversation.id,
              error
            );
          }
        }

        return {
          ...conversation,
          mergedTranscript: parsedMergedTranscript,
        };
      }
    );

    return NextResponse.json(conversationsWithParsedTranscript);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
