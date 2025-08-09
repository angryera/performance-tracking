import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user data to get their individual limit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { minutes: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's total conversation duration (in seconds)
    const userConversations = await prisma.conversation.findMany({
      where: {
        userId: userId,
      },
      select: {
        duration: true,
      },
    });

    // Calculate total seconds used
    const totalSecondsUsed = userConversations.reduce(
      (sum, conv) => sum + conv.duration,
      0
    );

    // Get user's individual granted minutes
    const grantedMinutes = user.minutes || 0;

    // Calculate remaining seconds
    const remainingSeconds = Math.max(
      0,
      grantedMinutes * 60 - totalSecondsUsed
    );

    return NextResponse.json({
      totalSecondsUsed,
      grantedMinutes,
      remainingSeconds,
      totalMinutesUsed: Math.round(totalSecondsUsed / 60),
      remainingMinutes: Math.round(remainingSeconds / 60),
    });
  } catch (error) {
    console.error("Error fetching user usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch user usage" },
      { status: 500 }
    );
  }
}
