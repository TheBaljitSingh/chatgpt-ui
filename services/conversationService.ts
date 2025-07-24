import {ConversationModel } from '@/lib/mongodb'

export class ConversationService {
    static async saveConversation(userId: string, conversationId: string, messages: any[], title?: string) {
    try {
      const conversation = await ConversationModel.findOneAndUpdate(
        { userId, conversationId },
        {
          userId,
          conversationId,
          messages,
          title: title || 'New Conversation',
          updatedAt: new Date()
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );
      
      return conversation;
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  // Get conversation history
  static async getConversation(userId: string, conversationId: string) {
    try {
      const conversation = await ConversationModel.findOne({ userId, conversationId });
      return conversation;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  // Get all conversations for a user
  static async getUserConversations(userId: string, limit = 50) {
    try {
      const conversations = await ConversationModel.find({ userId })
        .select('conversationId title createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .limit(limit);
      
      return conversations;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }

  // Add a single message to existing conversation
  static async addMessage(userId: string, conversationId: string, message: any) {
    try {
      const conversation = await ConversationModel.findOneAndUpdate(
        { userId, conversationId },
        {
          $push: { messages: message },
          $set: { updatedAt: new Date() }
        },
        { new: true }
      );
      
      return conversation;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  // Generate conversation title from first message
  static generateTitle(firstMessage: string): string {
    if (!firstMessage) return 'New Conversation';
    
    // Take first 50 characters and clean up
    const title = firstMessage
      .replace(/\n/g, ' ')
      .trim()
      .substring(0, 50);
    
    return title + (firstMessage.length > 50 ? '...' : '');
  }
}