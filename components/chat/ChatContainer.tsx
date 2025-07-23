'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { MessageList } from './MessageList';
import { EditMessageModal } from './EditMessageModal';
import { FileAttachment } from '@/types';
import { Menu, Plus, X, FileIcon, ImageIcon } from 'lucide-react';
import { ChatInput } from "@/components/chat/ChatInput";
import axios from "axios";

export const ChatContainer = () => {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);


  const {
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
  } = useChat();

 
  const handleSendMessage = async (content: string, attachments: FileAttachment[]) => {
    await sendMessage(content, attachments);
  };


//   const handleAttachFile = async () => {
//   const input = document.createElement('input');
//   input.type = 'file';
//   input.accept = 'image/*,.pdf,.txt,.doc,.docx'; 
//   input.multiple = true; // Allow multiple file selection
  
//   input.onchange = async (e) => {
//     const files = (e.target as HTMLInputElement).files;
//     if (!files) return;

//     // Process each file
//     Array.from(files).forEach(async (file) => {
//       // Validate file size (10MB limit)
//       const maxSize = 10 * 1024 * 1024; // 10MB
//       if (file.size > maxSize) {
//         alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
//         return;
//       }

//       const tempId = `temp-${Date.now()}-${Math.random()}`;
//       setUploadingFiles(prev => [...prev, tempId]);

//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append(
//         "upload_preset",
//         process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string
//       );

//       try {
//         const res = await axios.post(
//           `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
//           formData,
//           {
//             onUploadProgress: (progressEvent) => {
//               // You can add progress tracking here if needed
//               const percentCompleted = Math.round(
//                 (progressEvent.loaded * 100) / (progressEvent.total || 1)
//               );
//               console.log(`Upload progress: ${percentCompleted}%`);
//             }
//           }
//         );

//         const data = res.data;

//         setAttachments((prev) => [
//           ...prev,
//           {
//             id: tempId,
//             name: file.name,
//             type: file.type,
//             size: file.size,
//             url: data.secure_url,
//             cloudinaryId: data.public_id,
//           },
//         ]);
//       } catch (err) {
//         console.error("Upload failed:", err);
//         // Show user-friendly error message
//         alert(`Failed to upload "${file.name}". Please try again.`);
//       } finally {
//         setUploadingFiles(prev => prev.filter(id => id !== tempId));
//       }
//     });
//   };
  
//   input.click();
// };



  const handleEditMessage = async (messageId: string, newContent: string) => {
    await editMessage(messageId, newContent);
    setEditingMessageId(null);
  };

  const editingMessage = activeConversation?.messages.find(m => m.id === editingMessageId);
  const hasMessages = !!(activeConversation?.messages?.length || streamingMessage);

  // Document Preview Component
  // const DocumentPreview = ({ attachment }: { attachment: FileAttachment }) => {
  //   const isImage = attachment.type?.startsWith('image/');
    
  //   return (
  //     <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
  //       <div className="flex-shrink-0">
  //         {isImage ? (
  //           <img 
  //             src={attachment.url} 
  //             alt={attachment.name}
  //             className="w-12 h-12 object-cover rounded"
  //           />
  //         ) : (
  //           <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center">
  //             <FileIcon size={20} className="text-gray-300" />
  //           </div>
  //         )}
  //       </div>
        
  //       <div className="flex-1 min-w-0">
  //         <p className="text-white text-sm font-medium truncate">{attachment.name}</p>
  //         <p className="text-gray-400 text-xs">{formatFileSize(attachment.size || 0)}</p>
  //       </div>
        
  //       <button
  //         onClick={() => removeAttachment(attachment.id)}
  //         className="flex-shrink-0 p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
  //       >
  //         <X size={16} />
  //       </button>
  //     </div>
  //   );
  // };

  return (
  <div className="flex flex-col h-full bg-[#212121] relative overflow-hidden">
      {/* Top Header - Only visible on mobile when sidebar is closed */}
      <div className="lg:hidden border-b border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors duration-200">
            <Menu size={20} />
          </button>
          <h1 className="text-white font-medium">ChatGPT</h1>
          <button className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors duration-200">
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {hasMessages ? (
          <>
            {/* Messages Area - Made properly scrollable */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <div 
                className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500"
                style={{
                  scrollbarWidth: 'thin',
                }}
              >
                <div className="max-w-4xl mx-auto px-4 py-6 min-h-full">
                  <MessageList
                    messages={activeConversation?.messages || []}
                    streamingMessage={streamingMessage}
                    isLoading={isLoading}
                    onEditMessage={setEditingMessageId}
                    onStopGeneration={stopGeneration}
                  />
                </div>
              </div>
            </div>
            
            {/* Input Area - Fixed at bottom with animation */}
            <div 
              className="flex-shrink-0  w-full   transition-transform duration-700 ease-out"
              
            >
                
                {/* Uploading Files */}
                

                <div className="transform transition-all max-w-45xl md:mx-auto bg-transparent md:px-4 py-4 duration-300 ease-out">
                  
                  <ChatInput
                    onSend={handleSendMessage}
                    disabled={isLoading || uploadingFiles.length > 0}
                    isLoading={isLoading}
                    maxRows={8}
                    onStopGeneration={stopGeneration}
                    editingContent={editingMessage?.content}

                  />
                </div>
            </div>
          </>
        ) : (
          // /* Welcome Screen with centered input that animates */ md:items-center  md:justify-center justify-end 
     <div className="flex-1 flex flex-col px-4 relative items-center  lg:justify-center">
  {/* Welcome Message (Child 1) */}
  <div className="grow flex items-center justify-center w-full lg:grow-0 lg:mb-4">
    <div 
      className="text-center md:mb-8 max-w-2xl opacity-0 animate-fadeInUp"
      style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
    >
      <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text">
        How can I help you today?
      </h1>
    </div>
  </div>

  {/* Centered Input Area (Child 2) */}
  <div 
    className="w-full max-w-4xl opacity-0 animate-fadeInUp transition-all duration-700 ease-out mt-auto lg:mt-0"
    style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
  >
    {/* Document Previews */}
    {/* {attachments.length > 0 && (
      <div className="mb-4 space-y-2">
        {attachments.map((attachment, index) => (
          <div
            key={attachment.id}
            className="opacity-0 animate-fadeInUp"
            style={{
              animationDelay: `${600 + index * 100}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <DocumentPreview attachment={attachment} />
          </div>
        ))}
      </div>
    )} */}

    {/* Uploading Files */}
    {/* {uploadingFiles.length > 0 && (
      <div className="mb-4 space-y-2">
        {uploadingFiles.map((fileId, index) => (
          <div 
            key={fileId} 
            className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg border border-gray-600 opacity-0 animate-fadeInUp"
            style={{
              animationDelay: `${600 + index * 100}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm">Uploading...</p>
            </div>
          </div>
        ))}
      </div>
    )} */}

    <div className="transform hover:scale-[1.01] transition-transform duration-300 ease-out">
      <ChatInput
        onSend={handleSendMessage}
        disabled={isLoading || uploadingFiles.length > 0}
        isLoading={isLoading}
        maxRows={8}
        onStopGeneration={stopGeneration}

      />
    </div>
  </div>
</div>

        )}
      </div>

      {/* Edit Message Modal */}
      {/* {editingMessage && (
        <EditMessageModal
          message={editingMessage}
          onSave={(newContent) => handleEditMessage(editingMessage.id, newContent)}
          onClose={() => setEditingMessageId(null)}
        />
      )} */}

    </div>
  );
};