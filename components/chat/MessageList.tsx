'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types';
import { ChatMessage } from './ChatMessage';
import { Bot, User } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  streamingMessage: string;
  isLoading: boolean;
  onEditMessage: (messageId: string) => void;
  onStopGeneration: () => void;
}

export const MessageList = ({
  messages,
  streamingMessage,
  isLoading,
  onEditMessage,
  onStopGeneration,
}: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  return (
  <div  ref={scrollRef}
    className={`flex-1 overflow-y-auto transition-all 
      ${ messages.length === 0 && !isLoading
        ? 'flex items-center justify-center'
        : ''
    }`}
  >  
  <div className="w-full max-w-3xl mx-auto px-2 py-6">
        

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onEdit={onEditMessage}
          />
        ))}

        {streamingMessage && (
          <div className="mb-6 flex items-start gap-8">
            {/* <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div> */}
            <div className="flex-1 min-w-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
                  {streamingMessage}
                  <span className="animate-pulse">▊</span>
                </div>
              </div>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
};