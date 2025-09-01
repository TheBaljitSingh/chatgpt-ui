import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { Message, FileAttachment } from '@/types';
import connectToDatabase from '@/lib/mongodb';
import { ConversationModel } from '@/lib/mongodb';
import { memoryService } from '@/lib/memory';
import { auth, getAuth } from '@clerk/nextjs/server';
import {v4 as uuid} from 'uuid';
import { ConversationService  } from '@/services/conversationService';


// Helper function to fetch file content from Cloudinary URL
async function fetchFileContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const contentType = response.headers.get('content-type') || '';
    
    // Only process text files, not images or PDFs
    if (contentType.includes('text/') || url.includes('.txt') || url.includes('.md')) {
      return await response.text();
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching file content:', error);
    return null;
  }
}

// Helper function to convert image URL to base64
async function urlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
}

// Helper function to upload file to Gemini File API
// Helper function to upload file to Gemini File API
async function uploadFileToGemini(url: string, mimeType: string, displayName: string): Promise<string | null> {
  try {
    // First, fetch the file
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const arrayBuffer = await response.arrayBuffer();
    
    // Create FormData and append the file as a Blob
    const form = new FormData();
    const blob = new Blob([arrayBuffer], { type: mimeType });
    form.append('file', blob, displayName);
    
    // Upload to Gemini File API
    const uploadResponse = await fetch('https://generativelanguage.googleapis.com/upload/v1beta/files', {
      method: 'POST',
      headers: {
        'X-goog-api-key': `${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
        // Don't set Content-Type header - let FormData set it automatically with boundary
      },
      body: form
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Failed to upload file to Gemini:', errorText);
      return null;
    }
    
    const result = await uploadResponse.json();
    console.log('Gemini upload result:', result);
    

    console.log("printing the uploaded file details,", result.file);
    // The response should contain the file URI
    return result.file?.uri || null;
  } catch (error) {
    console.error('Error uploading file to Gemini:', error);
    return null;
  }
}

// Helper function to process message attachments
// async function processMessageAttachments(messages: Message[]): Promise<any[]> {
//   const processedMessages = [];
  
//   for (const msg of messages) {
//     if (msg.role === 'user' && msg.attachments && msg.attachments.length > 0) {
//       const contentParts = [{ type: 'text', text: msg.content }];
//       let hasMultimodalContent = false;
      
//       // Process each attachment
//       for (const attachment of msg.attachments) {
//         if (attachment.type?.startsWith('image/')) {
//           // Handle images - convert to base64 for Gemini Vision
//           const base64 = await urlToBase64(attachment.url);
//           if (base64) {
//             contentParts.push({
//               type: 'image',
//               image: `data:${attachment.type};base64,${base64}`, // Proper data URL format
//             });
//             hasMultimodalContent = true;
//           }
//         } else if (attachment?.type === 'application/pdf') {
//           // Handle PDF files - upload to Gemini File API first
//           const geminiFileUri = await uploadFileToGemini(
//             attachment.url, 
//             attachment.type, 
//             attachment.name || 'document.pdf'
//           );
          
//           if (geminiFileUri) {
//             // For AI SDK with Google provider, use this format
//             contentParts.push({
//               type: 'file',
//               fileUri: geminiFileUri,
//               mimeType: attachment.type,
//             });
//             hasMultimodalContent = true;
//           } else {
//             // Fallback: mention the file in text
//             contentParts[0].text += `\n\n[PDF File: ${attachment.name}] - Unable to process PDF content directly. Please describe what you'd like me to help you with regarding this PDF.`;
//           }
//         } else {
//           // Handle other text documents - fetch content and append to message
//           const fileContent = await fetchFileContent(attachment.url);
//           if (fileContent) {
//             contentParts[0].text += `\n\n[File: ${attachment.name}]\n${fileContent}`;
//           } else {
//             contentParts[0].text += `\n\n[File: ${attachment.name}]\nFile URL: ${attachment.url}`;
//           }
//         }
//       }
      
//       // Add processed message
//       if (hasMultimodalContent) {
//         processedMessages.push({
//           role: msg.role,
//           content: contentParts
//         });
//       } else {
//         processedMessages.push({
//           role: msg.role,
//           content: contentParts[0].text // Just the text content
//         });
//       }
//     } else {
//       // Regular message without attachments
//       processedMessages.push({
//         role: msg.role,
//         content: msg.content,
//       });
//     }
//   }
  
//   return processedMessages;
// }
async function processMessageAttachments(messages: Message[]): Promise<any[]> {
  const processedMessages = [];
  
  for (const msg of messages) {
    if (msg.role === 'user' && msg.attachments && msg.attachments.length > 0) {
      let textContent = msg.content;
      
      // Process each attachment
      for (const attachment of msg.attachments) {
        if (attachment.type?.startsWith('image/')) {
          // For now, just mention the image in text
          textContent += `\n\n[Image: ${attachment.name}] - Image processing available`;
        } else if (attachment?.type === 'application/pdf') {
          // Upload PDF and get URI
          const geminiFileUri = await uploadFileToGemini(
            attachment.url, 
            attachment.type, 
            attachment.name || 'document.pdf'
          );
          
          if (geminiFileUri) {
            textContent += `\n\n[PDF File Uploaded: ${attachment.name}] - File URI: ${geminiFileUri}`;
          } else {
            textContent += `\n\n[PDF File: ${attachment.name}] - Unable to process PDF content directly.`;
          }
        } else {
          // Handle other text documents
          const fileContent = await fetchFileContent(attachment.url);
          if (fileContent) {
            textContent += `\n\n[File: ${attachment.name}]\n${fileContent}`;
          }
        }
      }
      
      // Add as simple text message
      processedMessages.push({
        role: msg.role,
        content: textContent,
      });
    } else {
      // Regular message without attachments
      processedMessages.push({
        role: msg.role,
        content: msg.content,
      });
    }
  }
  
  return processedMessages;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId,  } = await req.json();
    let { userId } = getAuth(req);
    
    if(!userId){
      userId = 'testUser-1'; // don't save it in db
    }

    console.log("Detailed message with attachments URL: ", messages);

    // Validate required environment variable
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not configured');
    }

    // Connect to database
    await connectToDatabase();
    const existingConversation = await ConversationService.getConversation(userId, conversationId);
    let allMessage = [];

    if(existingConversation){
      allMessage = [...existingConversation.message, ...messages];
    }else{
      allMessage = messages;
    }
    

    // Get memory context for better responses
    // const memoryContext = await memoryService.getContext(userId, conversationId);

    // Process messages and handle attachments
    const processedMessages = await processMessageAttachments(allMessage); // previouslty (message);

    // Add memory context if available
    // if (memoryContext) {
    //   processedMessages.unshift({
    //     role: 'system',
    //     content: `Context from previous conversations: ${memoryContext.summary}. Key points: ${memoryContext.keyPoints.join(', ')}`,
    //   });
    // }

    // Handle context window - keep only recent messages if too long
    const MAX_CONTEXT_MESSAGES = 20;
    const contextMessages = processedMessages.slice(-MAX_CONTEXT_MESSAGES);

    console.log("Context Messages: ", contextMessages);

    // Check if any message has multimodal content (images or files)
    const hasMultimodalContent = contextMessages.some(msg => 
      Array.isArray(msg.content) && 
      msg.content.some((part:any) => part.type === 'image' || part.type === 'file')
    );

    // Use Gemini 2.0 Flash for both text and multimodal content
    const model = google('gemini-2.0-flash-exp');

    // Stream the response using Gemini
    const result = await streamText({
      model,
      messages: contextMessages,
      maxTokens: 4000,
      temperature: 0.7,
    });

    // Create a streaming response
    const encoder = new TextEncoder();
    let aiResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            aiResponse += chunk;
            const data = `data: ${JSON.stringify({ content: chunk })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          
          // Save conversation to memory if there's a meaningful response
          if (aiResponse.trim()) {
            const assistantMessage = { 
              role: 'assistant', 
              content: aiResponse.trim(),
              timestamp: new Date()
            };
            
            // Add timestamp to user messages if not present
            const userMessagesWithTimestamp = messages.map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp || new Date()
            }));
            
            // Complete conversation with all messages
            const completeMessages = [
              ...(existingConversation ? existingConversation.messages : []),
              ...userMessagesWithTimestamp,
              assistantMessage
            ];

                 // Generate title if this is a new conversation
            let title = existingConversation?.title;
            if (!existingConversation && messages.length > 0) {
              const firstUserMessage = messages.find((msg: any) => msg.role === 'user');
              if (firstUserMessage) {
                const content = typeof firstUserMessage.content === 'string' 
                  ? firstUserMessage.content 
                  : JSON.stringify(firstUserMessage.content);
                title = ConversationService.generateTitle(content);
              }
            }
            
            // Save the complete conversation
            await ConversationService.saveConversation(
              userId, 
              conversationId, 
              completeMessages,
              title
            );

            // const completeConversation = [
            //   ...messages,
            //   { role: 'assistant', content: aiResponse.trim() }
            // ];
            // await memoryService.addConversation(userId, conversationId, completeConversation);
          }
          

          controller.close();
        } catch (streamError) {
          console.error('Streaming error:', streamError);
          controller.error(streamError);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const conversation = await ConversationService.getConversation(userId, params.conversationId);
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
