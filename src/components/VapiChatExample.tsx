'use client'

import { useState } from 'react';
import { useVapiChat } from './hooks/useVapiChat';
import { config } from '@/lib/config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function VapiChatExample() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState<string>(config.vapi.assistants.practice);

  // Initialize VAPI chat hook with the selected assistant
  const {
    isLoading,
    error,
    currentChatId,
    sendMessage,
    startNewConversation,
    clearError,
    resetConversation
  } = useVapiChat({
    assistantId: selectedAssistant,
    initialVariables: {
      companyName: 'LevelRep',
      serviceType: 'sales training',
      customerTier: 'Premium'
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
    onResponse: (response) => {
      // Add assistant response to messages
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    }
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    // Add user message to the chat
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Send message to VAPI
    if (currentChatId) {
      // Continue existing conversation
      await sendMessage(inputMessage);
    } else {
      // Start new conversation
      await startNewConversation(inputMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartNewConversation = () => {
    resetConversation();
    setMessages([]);
  };

  return (
    <div className="bg-white shadow-lg mx-auto p-6 rounded-lg max-w-4xl">
      <div className="mb-6">
        <h2 className="mb-4 font-bold text-gray-900 text-2xl">VAPI Chat Example</h2>
        
        {/* Assistant Selection */}
        <div className="mb-4">
          <label htmlFor="assistant-select" className="block mb-2 font-medium text-gray-700 text-sm">
            Select Assistant:
          </label>
          <select
            id="assistant-select"
            value={selectedAssistant}
            onChange={(e) => setSelectedAssistant(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            <option value={config.vapi.assistants.train}>Train Assistant</option>
            <option value={config.vapi.assistants.practice}>Practice Assistant</option>
            <option value={config.vapi.assistants.repmatch}>Rep Match Assistant</option>
          </select>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 mb-4 p-3 border border-red-400 rounded text-red-700">
            <p className="font-medium">Error: {error.message}</p>
            <button
              onClick={clearError}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Chat Status */}
        <div className="mb-4 text-gray-600 text-sm">
          <p>Status: {isLoading ? 'Sending message...' : 'Ready'}</p>
          {currentChatId && (
            <p>Conversation ID: {currentChatId}</p>
          )}
        </div>

        {/* New Conversation Button */}
        <button
          onClick={handleStartNewConversation}
          className="bg-blue-600 hover:bg-blue-700 mb-4 px-4 py-2 rounded-md text-white transition-colors"
        >
          Start New Conversation
        </button>
      </div>

      {/* Messages Display */}
      <div className="bg-gray-50 mb-6 p-4 border border-gray-200 rounded-lg h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="py-8 text-gray-500 text-center">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex space-x-2">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            !inputMessage.trim() || isLoading
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 mt-6 p-4 border border-blue-200 rounded-lg">
        <h3 className="mb-2 font-medium text-blue-900">How to use:</h3>
        <ul className="space-y-1 text-blue-800 text-sm">
          <li>• Select an assistant from the dropdown above</li>
          <li>• Type your message and press Enter or click Send</li>
          <li>• The conversation will maintain context automatically</li>
          <li>• Use "Start New Conversation" to reset the chat</li>
          <li>• Dynamic variables are automatically included for personalization</li>
        </ul>
      </div>
    </div>
  );
} 