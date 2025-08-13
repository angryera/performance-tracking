import { useState, useCallback, useRef } from 'react';
import { sendChatMessage, ChatResponse, ChatRequestOptions } from '@/lib/vapi-chat';

export interface UseVapiChatOptions {
  assistantId: string;
  initialVariables?: Record<string, string>;
  onError?: (error: Error) => void;
  onResponse?: (response: ChatResponse) => void;
}

export interface UseVapiChatReturn {
  // State
  isLoading: boolean;
  error: Error | null;
  currentChatId: string | null;
  
  // Actions
  sendMessage: (message: string) => Promise<ChatResponse | null>;
  startNewConversation: (message: string, variables?: Record<string, string>) => Promise<ChatResponse | null>;
  clearError: () => void;
  resetConversation: () => void;
}

/**
 * React hook for VAPI chat functionality
 * Provides a simple interface for sending messages and managing conversation state
 */
export function useVapiChat(options: UseVapiChatOptions): UseVapiChatReturn {
  const { assistantId, initialVariables, onError, onResponse } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const currentChatIdRef = useRef<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetConversation = useCallback(() => {
    currentChatIdRef.current = null;
    setError(null);
  }, []);

  const sendMessage = useCallback(async (message: string): Promise<ChatResponse | null> => {
    if (!message.trim()) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const chatOptions: ChatRequestOptions = {
        assistantId,
        input: message,
        ...(currentChatIdRef.current && { previousChatId: currentChatIdRef.current })
      };

      const response = await sendChatMessage(chatOptions);
      
      // Store the chat ID for conversation continuity
      currentChatIdRef.current = response.chatId;
      
      // Call the onResponse callback if provided
      onResponse?.(response);
      
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [assistantId, onResponse, onError]);

  const startNewConversation = useCallback(async (
    message: string, 
    variables?: Record<string, string>
  ): Promise<ChatResponse | null> => {
    // Reset conversation state
    currentChatIdRef.current = null;
    setError(null);
    
    // Use provided variables or fall back to initial variables
    const finalVariables = variables || initialVariables;
    
    setIsLoading(true);

    try {
      const chatOptions: ChatRequestOptions = {
        assistantId,
        input: message,
        ...(finalVariables && { assistantOverrides: { variableValues: finalVariables } })
      };

      const response = await sendChatMessage(chatOptions);
      
      // Store the chat ID for conversation continuity
      currentChatIdRef.current = response.chatId;
      
      // Call the onResponse callback if provided
      onResponse?.(response);
      
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [assistantId, initialVariables, onResponse, onError]);

  return {
    // State
    isLoading,
    error,
    currentChatId: currentChatIdRef.current,
    
    // Actions
    sendMessage,
    startNewConversation,
    clearError,
    resetConversation
  };
} 