// Function to merge consecutive messages from the same role
export const getMergedTranscript = (
  transcriptRef: React.MutableRefObject<{ role: string; content: string }[]>
) => {
  if (transcriptRef.current.length === 0) return [];

  const merged: any[] = [];
  let currentRole = transcriptRef.current[0].role;
  let currentText = transcriptRef.current[0].content;

  for (let i = 1; i < transcriptRef.current.length; i++) {
    const message = transcriptRef.current[i];

    if (message.role === currentRole) {
      // Same role, merge the text
      currentText += " " + message.content;
    } else {
      // Different role, save current and start new
      merged.push({ role: currentRole, content: currentText });
      currentRole = message.role;
      currentText = message.content;
    }
  }

  // Add the last message
  merged.push({ role: currentRole, content: currentText });

  return merged;
};

// Combine and sort all messages by timestamp
export const getAllMessages = (
  userMessages: { role: string; content: string; timestamp: string }[],
  conversationHistoryRef: React.MutableRefObject<
    {
      role: string;
      content: string;
      timestamp: string;
    }[]
  >
) => {
  const allMessages = [...userMessages, ...conversationHistoryRef.current];

  // Sort by timestamp, ensuring all messages have valid timestamps
  const sortedMessages = allMessages
    .filter((msg) => msg.timestamp) // Only include messages with timestamps
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB;
    });

  return sortedMessages;
};
