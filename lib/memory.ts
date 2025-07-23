import { MemoryContext } from '@/types';
import { Memory } from 'mem0ai/oss';

// Configure mem0 to use Gemini instead of OpenAI
const config = {
  llm: {
    provider: "google",
    config: {
      model: "gemini-2.0-flash-001",
      api_key: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    }
  },
  embedder: {
    provider: "google",
    config: {
      model: "text-embedding-004", // Gemini's embedding model
      api_key: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    }
  },
  vector_store: {
    provider: "chroma",
    config: {
      collection_name: "chat_memories",
      path: "./chroma_db"
    }
  }
};

const memory = new Memory(config);

class MemoryService {
  // Retrieve the most relevant memory context for a user/conversation
  // async getContext(userId: string, conversationId: string): Promise<MemoryContext | null> {
  //   try {
  //     // Search for relevant memories for this conversation
  //     const results = await memory.search('context', { 
  //       userId: userId,
  //       conversationId: conversationId 
  //     });
      
  //     if (!results.results || results.results.length === 0) return null;
      
  //     // Use the most recent or relevant memory
  //     const mem = results.results[0];
  //     return {
  //       userId,
  //       conversationId,
  //       summary: mem.memory || '',
  //       keyPoints: mem.memory ? mem.memory.split('.').map(s => s.trim()).filter(Boolean) : [],
  //       lastUpdated: mem.updated_at ? new Date(mem.updated_at) : new Date(),
  //     };
  //   } catch (error) {
  //     console.error('Error getting memory context:', error);
  //     return null;
  //   }
  // }

  // // Add a new conversation to memory (mem0 will automatically summarize using Gemini)
  // async addConversation(userId: string, conversationId: string, messages: Array<{ role: string; content: string }>): Promise<void> {
  //   try {
  //     // Convert messages to a readable format for mem0
  //     const conversationText = messages
  //       .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
  //       .join('\n');

  //     // Add to memory - mem0 will use Gemini to process and store
  //     await memory.add(conversationText, {
  //       userId: userId,
  //       conversationId: conversationId,
  //       metadata: {
  //         timestamp: new Date().toISOString(),
  //         message_count: messages.length
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Error adding conversation to memory:', error);
  //   }
  // }

  // // Update a memory context (by memoryId)
  // async updateContext(context: MemoryContext): Promise<void> {
  //   try {
  //     // Find the most relevant memory for this conversation
  //     const results = await memory.search('context', { 
  //       userId: context.userId,
  //       conversationId: context.conversationId 
  //     });
      
  //     if (results.results && results.results.length > 0) {
  //       const memId = results.results[0].id;
  //       await memory.update(memId, context.summary);
  //     } else {
  //       // If not found, create new
  //       await this.createContext(context.userId, context.conversationId, context.summary, context.keyPoints);
  //     }
  //   } catch (error) {
  //     console.error('Error updating memory context:', error);
  //   }
  // }

  // // Create a new memory context
  // async createContext(userId: string, conversationId: string, summary: string, keyPoints: string[]): Promise<MemoryContext> {
  //   try {
  //     const memoryText = summary + (keyPoints.length ? (' Key points: ' + keyPoints.join(', ')) : '');
  //     await memory.add(memoryText, { 
  //       userId: userId,
  //       conversationId: conversationId 
  //     });
      
  //     return {
  //       userId,
  //       conversationId,
  //       summary,
  //       keyPoints,
  //       lastUpdated: new Date(),
  //     };
  //   } catch (error) {
  //     console.error('Error creating memory context:', error);
  //     return {
  //       userId,
  //       conversationId,
  //       summary,
  //       keyPoints,
  //       lastUpdated: new Date(),
  //     };
  //   }
  // }

  // // Delete all memories for a user/conversation
  // async deleteContext(userId: string, conversationId: string): Promise<void> {
  //   try {
  //     // Delete all memories for this user and conversation
  //     await memory.deleteAll({ 
  //       userId: userId,
  //       conversationId: conversationId 
  //     });
  //   } catch (error) {
  //     console.error('Error deleting memory context:', error);
  //   }
  // }

  // // Get all memories for a user
  // async getUserMemories(userId: string): Promise<any[]> {
  //   try {
  //     const results = await memory.getAll({ userId: userId });
  //     return results.results || [];
  //   } catch (error) {
  //     console.error('Error getting user memories:', error);
  //     return [];
  //   }
  // }
}

export const memoryService = new MemoryService();