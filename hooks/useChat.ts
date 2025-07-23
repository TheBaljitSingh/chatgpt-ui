'use client';

import { useState, useCallback, useRef } from 'react';
import { Message, Conversation, FileAttachment } from '@/types';
import { nanoid } from 'nanoid';

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const createConversation = useCallback((title?: string) => {
    const newConversation: Conversation = {
      id: nanoid(),
      title: title || 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation;
  }, []);

const sendMessage = useCallback(async (
  content: string,
  attachments?: FileAttachment[]
) => {
  if (!content.trim() && (!attachments || attachments.length === 0)) return;

  let conversation = activeConversation;
  if (!conversation) {
    conversation = createConversation();
  }

  const userMessage: Message = {
    id: nanoid(),
    role: 'user',
    content,
    timestamp: new Date(),
    attachments,
  };

  // Add user message immediately
  setConversations(prev => prev.map(c =>
    c.id === conversation!.id
      ? { ...c, messages: [...c.messages, userMessage], updatedAt: new Date() }
      : c
  ));

  setIsLoading(true);
  setStreamingMessage('');

//   const toGeminiMessageFormat = (message: Message): { role: 'user' | 'assistant'; content: any } => {
//   // If message has attachments, convert to multimodal content
//   if (message.attachments && message.attachments.length > 0) {
//     const parts = [];

//     if (message.content) {
//       parts.push({ type: 'text', text: message.content });
//     }

//     for (const attachment of message.attachments) {
//       parts.push({
//         type: 'file_data',
//         fileUri: attachment.url, // or wherever the Gemini-compatible file URI is
//         mimeType: attachment.type,
//       });
//     }

//     return {
//       role: message.role,
//       content: parts,
//     };
//   }

//   return {
//     role: message.role,
//     content: message.content,
//   };
// };


  try {
    abortControllerRef.current = new AbortController();

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json', //if file the use formData if not then use
      },
      body: JSON.stringify({
        messages: [...conversation.messages, userMessage],
        conversationId: conversation.id,
        userId: 'testuser-1'
      }),
      signal: abortControllerRef.current.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              
              // Handle error messages from stream
              if (parsed.error) {
                console.error('Stream error:', parsed.error, parsed.message);
                throw new Error(parsed.message || 'Streaming error occurred');
              }
              
              if (parsed.content) {
                assistantMessage += parsed.content;
                setStreamingMessage(assistantMessage);
              }
            } catch (parseError) {
              if (parseError instanceof SyntaxError) {
                console.warn('Error parsing stream chunk:', parseError);
                // Continue processing other chunks
                continue;
              }
              throw parseError; // Re-throw non-parsing errors
            }
          }
        }
      }
    }

    // Ensure we have some response content
    if (!assistantMessage.trim()) {
      throw new Error('No response received from the AI model');
    }

    // Add final assistant message
    const finalAssistantMessage: Message = {
      id: nanoid(),
      role: 'assistant',
      content: assistantMessage.trim(),
      timestamp: new Date(),
    };

    setConversations(prev => prev.map(c =>
      c.id === conversation!.id
        ? { ...c, messages: [...c.messages, finalAssistantMessage], updatedAt: new Date() }
        : c
    ));

    console.log('Message sent successfully, response length:', assistantMessage.length);

  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error sending message:', error);
      
      // Add error message to conversation
      const errorMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: `Sorry, I encountered an error while processing your message: ${error.message}. Please try again.`,
        timestamp: new Date(),
        isError: true, // Add this flag to style error messages differently
      };

      setConversations(prev => prev.map(c =>
        c.id === conversation!.id
          ? { ...c, messages: [...c.messages, errorMessage], updatedAt: new Date() }
          : c
      ));
    }
  } finally {
    setIsLoading(false);
    setStreamingMessage('');
    abortControllerRef.current = null;
  }
}, [activeConversation, createConversation]);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!activeConversation) return;

    const messageIndex = activeConversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Remove messages after the edited message
    const truncatedMessages = activeConversation.messages.slice(0, messageIndex + 1);
    
    // Update the message content
    const updatedMessage = {
      ...truncatedMessages[messageIndex],
      content: newContent,
      isEditing: false,
    };

    const updatedMessages = [...truncatedMessages.slice(0, messageIndex), updatedMessage];

    setConversations(prev => prev.map(c => 
      c.id === activeConversation.id 
        ? { ...c, messages: updatedMessages, updatedAt: new Date() }
        : c
    ));

    // Regenerate response if it was a user message
    if (updatedMessage.role === 'user') {
      await sendMessage(newContent);
    }
  }, [activeConversation, sendMessage]);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
  }, [activeConversationId]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // aborting the stream
      abortControllerRef.current = null;
    }
  }, []);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    isLoading,
    streamingMessage,
    sendMessage,
    editMessage,
    createConversation,
    deleteConversation,
    stopGeneration,
  };
};