import { NextRequest, NextResponse } from "next/server";

// Types for VAPI chat
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface VapiChatRequest {
  assistantId: string;
  input: string;
  previousChatId?: string;
  assistantOverrides?: {
    variableValues?: Record<string, string>;
  };
}

interface VapiChatResponse {
  id: string;
  assistantId: string;
  messages: ChatMessage[];
  output: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  orgId?: string;
  sessionId?: string;
  name?: string;
}

interface ChatResponse {
  chatId: string;
  response: string;
  fullData: VapiChatResponse;
}

export async function POST(request: NextRequest) {
  try {
    const body: VapiChatRequest = await request.json();
    const { assistantId, input, previousChatId, assistantOverrides } = body;

    // Validate required fields
    if (!assistantId || !input) {
      return NextResponse.json(
        { error: "assistantId and input are required" },
        { status: 400 }
      );
    }

    // Get VAPI API key from environment
    const vapiApiKey = process.env.VAPI_API_KEY;
    if (!vapiApiKey) {
      console.error("VAPI_API_KEY not configured in environment");
      return NextResponse.json(
        { error: "VAPI API key not configured" },
        { status: 500 }
      );
    }

    console.log("📤 Sending VAPI chat request:", {
      assistantId,
      input: input.substring(0, 100) + "...",
      previousChatId,
      hasOverrides: !!assistantOverrides
    });

    // Prepare request payload
    const payload: any = {
      assistantId,
      input,
      ...(previousChatId && { previousChatId }),
      ...(assistantOverrides && { assistantOverrides })
    };

    // Make request to VAPI API
    const response = await fetch('https://api.vapi.ai/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("VAPI API error:", response.status, errorText);
      return NextResponse.json(
        { 
          error: `VAPI API error: ${response.status}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const chat: VapiChatResponse = await response.json();
    
    console.log("📥 VAPI chat response received:", {
      chatId: chat.id,
      responseLength: chat.output[0]?.content?.length || 0
    });

    // Format response for client
    const chatResponse: ChatResponse = {
      chatId: chat.id,
      response: chat.output[0]?.content || "No response received",
      fullData: chat
    };

    return NextResponse.json(chatResponse);

  } catch (error) {
    console.error("🔥 Error during VAPI chat request:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}

// GET endpoint to check if the API is working
export async function GET() {
  return NextResponse.json({
    status: "VAPI Chat API is working",
    message: "vapi-chat endpoint is available",
    features: [
      "Secure chat through VAPI assistants",
      "Conversation context management",
      "Dynamic variable support",
      "Assistant overrides"
    ]
  });
} 