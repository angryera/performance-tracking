# VAPI Chat Integration Setup Guide

This guide explains how to set up and use VAPI's chat functionality in your Performance Tracking App securely.

## 🚀 What We've Built

We've created a secure, backend-driven VAPI chat integration that includes:

1. **Secure Backend API** (`/api/vapi-chat`) - Handles VAPI requests without exposing API keys
2. **Client Utility** (`src/lib/vapi-chat.ts`) - Type-safe functions for frontend use
3. **React Hook** (`src/components/hooks/useVapiChat.ts`) - Easy integration in components
4. **Example Component** (`src/components/VapiChatExample.tsx`) - Working demonstration

## 🔐 Security Features

- **No API keys in frontend code** - All VAPI requests go through your secure backend
- **Environment variable protection** - API keys stored securely in `.env.local`
- **Input validation** - Backend validates all requests before forwarding to VAPI
- **Error handling** - Secure error messages that don't leak sensitive information

## 📋 Prerequisites

1. **VAPI Account** - Sign up at [dashboard.vapi.ai](https://dashboard.vapi.ai)
2. **Assistant Created** - Create or use an existing VAPI assistant
3. **API Key** - Get your private API key from VAPI dashboard

## ⚙️ Setup Steps

### 1. Environment Configuration

Add your VAPI API key to your `.env.local` file:

```bash
# VAPI API (for chat functionality)
VAPI_API_KEY="your-actual-vapi-api-key-here"
```

**⚠️ Important:** Never commit your `.env.local` file to version control!

### 2. Get Your Assistant ID

1. Go to [dashboard.vapi.ai](https://dashboard.vapi.ai)
2. Navigate to "Assistants" in the left sidebar
3. Select or create an assistant
4. Copy the Assistant ID from the URL or assistant details

### 3. Update Configuration

Your assistant IDs are already configured in `src/lib/config.ts`:

```typescript
vapi: {
  publicKey: "a33bcaa3-fb93-472c-aaea-b3d3186e796d",
  assistants: {
    train: "f39e948b-f333-4a57-8ba8-6b01147f05db",
    practice: "33753ff6-b2dc-45d0-8f4d-12db7525c640",
    repmatch: "beb65fdb-aabc-4c5c-a3f5-63629e3ea094"
  }
}
```

Update these IDs with your actual VAPI assistant IDs.

## 🎯 Usage Examples

### Basic Usage with the Hook

```typescript
import { useVapiChat } from '@/components/hooks/useVapiChat';

function MyComponent() {
  const {
    isLoading,
    error,
    sendMessage,
    startNewConversation,
    resetConversation
  } = useVapiChat({
    assistantId: 'your-assistant-id',
    initialVariables: {
      companyName: 'Your Company',
      serviceType: 'your-service'
    }
  });

  const handleSend = async () => {
    const response = await sendMessage('Hello, how can you help me?');
    console.log('Response:', response?.response);
  };

  // ... rest of component
}
```

### Direct API Usage

```typescript
import { sendChatMessage } from '@/lib/vapi-chat';

// Start new conversation
const response = await sendChatMessage({
  assistantId: 'your-assistant-id',
  input: 'Hello, I need help',
  assistantOverrides: {
    variableValues: {
      companyName: 'TechFlow',
      customerTier: 'Premium'
    }
  }
});

// Continue conversation
const followUp = await sendChatMessage({
  assistantId: 'your-assistant-id',
  input: 'Tell me more',
  previousChatId: response.chatId
});
```

### Using Dynamic Variables

You can pass dynamic variables to personalize assistant responses:

```typescript
const response = await sendChatMessage({
  assistantId: 'your-assistant-id',
  input: 'What services do you offer?',
  assistantOverrides: {
    variableValues: {
      companyName: 'Acme Corp',
      serviceType: 'consulting',
      customerTier: 'Enterprise',
      region: 'North America'
    }
  }
});
```

## 🔧 Testing Your Setup

### 1. Test the Backend API

Visit `/api/vapi-chat` in your browser to see the status endpoint.

### 2. Test with the Example Component

Add the example component to any page:

```typescript
import VapiChatExample from '@/components/VapiChatExample';

export default function TestPage() {
  return (
    <div>
      <h1>VAPI Chat Test</h1>
      <VapiChatExample />
    </div>
  );
}
```

### 3. Test with curl

```bash
curl -X POST http://localhost:3000/api/vapi-chat \
  -H "Content-Type: application/json" \
  -d '{
    "assistantId": "your-assistant-id",
    "input": "Hello, this is a test message"
  }'
```

## 🚨 Troubleshooting

### Common Issues

1. **"VAPI API key not configured"**
   - Check that `VAPI_API_KEY` is set in your `.env.local`
   - Restart your development server after adding environment variables

2. **"VAPI API error: 401"**
   - Verify your API key is correct
   - Check that your VAPI account is active

3. **"VAPI API error: 404"**
   - Verify your assistant ID is correct
   - Ensure the assistant is published and active

4. **"assistantId and input are required"**
   - Check that you're sending both fields in your request
   - Verify the request body format

### Debug Mode

Enable detailed logging by checking your browser's developer console and your server logs.

## 🔄 Integration with Existing Features

The VAPI chat can be integrated with your existing training modes:

- **Train Mode** - Use for product knowledge questions
- **Practice Mode** - Use for sales technique guidance
- **Rep Match Mode** - Use for company matching assistance

## 📚 Additional Resources

- [VAPI Chat Documentation](https://docs.vapi.ai/chat/quickstart#overview)
- [VAPI Dashboard](https://dashboard.vapi.ai)
- [VAPI API Reference](https://docs.vapi.ai/api)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your VAPI account and assistant configuration
3. Check server logs for detailed error information
4. Ensure your environment variables are properly set

---

**Remember:** Keep your API keys secure and never expose them in client-side code! 