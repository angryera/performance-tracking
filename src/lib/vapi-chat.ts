// vapi-chat.ts - Client-side VAPI chat utility
// This file provides a secure way to interact with VAPI chat through our backend

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  chatId: string;
  response: string;
  fullData: {
    id: string;
    assistantId: string;
    messages: ChatMessage[];
    output: ChatMessage[];
    createdAt: string;
    updatedAt: string;
    orgId?: string;
    sessionId?: string;
    name?: string;
  };
}

export interface ChatRequestOptions {
  assistantId: string;
  input: string;
  previousChatId?: string;
  assistantOverrides?: {
    variableValues?: Record<string, string>;
  };
}

/**
 * Send a chat message to VAPI through our secure backend
 * @param options - Chat request options
 * @returns Promise with chat response
 */
export async function sendChatMessage(options: ChatRequestOptions): Promise<ChatResponse> {
  const { assistantId, input, previousChatId, assistantOverrides } = options;

  try {
    const response = await fetch('/api/vapi-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assistantId,
        input,
        ...(previousChatId && { previousChatId }),
        ...(assistantOverrides && { assistantOverrides })
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const chatResponse: ChatResponse = await response.json();
    return chatResponse;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

/**
 * Start a new conversation with a VAPI assistant
 * @param assistantId - The VAPI assistant ID to use
 * @param initialMessage - The first message to send
 * @param variables - Optional dynamic variables for the assistant
 * @returns Promise with chat response
 */
export async function startConversation(
  assistantId: string,
  initialMessage: string,
  variables?: Record<string, string>
): Promise<ChatResponse> {
  return sendChatMessage({
    assistantId,
    input: initialMessage,
    assistantOverrides: variables ? { variableValues: variables } : undefined
  });
}

/**
 * Continue an existing conversation
 * @param assistantId - The VAPI assistant ID to use
 * @param message - The message to send
 * @param previousChatId - The chat ID from the previous response
 * @returns Promise with chat response
 */
export async function continueConversation(
  assistantId: string,
  message: string,
  previousChatId: string
): Promise<ChatResponse> {
  return sendChatMessage({
    assistantId,
    input: message,
    previousChatId
  });
}

/**
 * Example usage function - demonstrates how to use the chat utility
 */
export async function exampleUsage() {
  try {
    // Start a new conversation
    const firstMessage = await startConversation(
      'your-assistant-id',
      'Hello, I need help with my account',
      {
        companyName: 'TechFlow Solutions',
        serviceType: 'software',
        customerTier: 'Premium'
      }
    );
    
    console.log('First response:', firstMessage.response);
    console.log('Chat ID:', firstMessage.chatId);

    // Continue the conversation
    const followUp = await continueConversation(
      'your-assistant-id',
      'Tell me more about your services',
      firstMessage.chatId
    );
    
    console.log('Follow-up response:', followUp.response);
    
    return { firstMessage, followUp };
  } catch (error) {
    console.error('Example usage failed:', error);
    throw error;
  }
} 