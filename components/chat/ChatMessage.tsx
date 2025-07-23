'use client';

import { useState } from 'react';
import { Message } from '@/types';
import { Bot, User, Edit2, Copy, Check, FileIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface ChatMessageProps {
  message: Message;
  onEdit: (messageId: string) => void;
}

export const ChatMessage = ({ message, onEdit }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === 'user';

  return (
    <div className={`mb-6 flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Message content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block max-w-full ${
          isUser 
            ? `${(!message.attachments || message.attachments.length===0)?'bg-[#303030]':'bg-transparent'} text-gray-300 rounded-lg px-4 py-2` 
            : 'bg-transparent text-gray-300 rounded-lg p-4 shadow-sm'
        }`}>
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {message.attachments.map((attachment) => {
                const fileType = attachment.type?.split("/")[1]?.toUpperCase() || 'FILE';
                
                return (
                  <div key={attachment.id} className="flex items-center gap-2 w-full rounded-lg px-3 py-2">
                    {attachment.type?.startsWith('image/')? (
                      <img 
                        src={attachment.url} 
                        alt={attachment.name}
                        className="w-32 h-32 object-cover rounded"
                      />
                    ) : (
                      <div className="flex items-center w-sm max-w-xs bg-[#2e2e2e] rounded-xl p-2 relative border justify-between border-gray-600">
                        {/* File Icon */}
                        <div className='flex'>
                          <div className="bg-[#ff5588] rounded-lg w-10 h-10 flex items-center justify-center mr-3">
                            <FileIcon size={20} className="text-white" />
                          </div>

                          {/* Text Info */}
                          <div className="flex flex-col overflow-hidden ">
                            <span className="text-sm font-medium text-white truncate">{attachment.name}</span>
                            <span className="text-xs text-gray-400 truncate">{fileType}</span>
                          </div>
                        </div>

                        {/* Close Button */}
                        <div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Message content */}
          <div className={`${isUser ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
            {isUser ? (
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }:any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md my-4"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        </div>

        {/* Message actions */}
        <div className={`mt-2  flex items-center gap-2 ${isUser ? 'justify-end' : ''}`}>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy message"
            >
              {copied ? (
                <Check size={14} className="text-green-600" />
              ) : (
                <Copy size={14} className="text-gray-500" />
              )}
            </button>
          )}
          
          {isUser && (
            <button
              onClick={() => onEdit(message.id)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Edit message"
            >
              <Edit2 size={14} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};