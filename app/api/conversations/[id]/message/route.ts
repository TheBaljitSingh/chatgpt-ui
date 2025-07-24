// app/api/conversations/[id]/messages/route.ts
import { getAuth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectToDatabase, { ConversationModel, UserModel } from '@/lib/mongodb';

const client = await clerkClient();

// POST /api/conversations/[id]/messages
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, content, attachments, metadata } = await req.json();

    if (!role || !content) {
      return NextResponse.json({ error: 'Role and content are required' }, { status: 400 });
    }

    if (!['user', 'assistant', 'system'].includes(role)) {
      return NextResponse.json({ error: 'Invalid message role' }, { status: 400 });
    }

    await connectToDatabase();

    // Check usage limits for free tier
    let user = await UserModel.findOne({ clerkId: userId });
    
    // Create user if doesn't exist
    if (!user) {
      const clerkUser = await client.users.getUser(userId);
      user = new UserModel({
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        lastLogin: new Date(),
      });
      await user.save();
    }

    if (user.subscription.plan === 'free' && role === 'user') {
      const currentDate = new Date();
      const lastResetDate = new Date(user.usage.lastResetDate);
      
      // Reset monthly usage if new month
      if (currentDate.getMonth() !== lastResetDate.getMonth() || 
          currentDate.getFullYear() !== lastResetDate.getFullYear()) {
        user.usage.messagesThisMonth = 0;
        user.usage.lastResetDate = currentDate;
        await user.save();
      }
      
      if (user.usage.messagesThisMonth >= 100) {
        return NextResponse.json({ 
          error: 'Monthly message limit reached. Please upgrade your plan.' 
        }, { status: 429 });
      }
    }

    // Find conversation and verify ownership
    const conversation = await ConversationModel.findOne({
      id: params.id,
      clerkId: userId,
    });
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Create new message
    const newMessage = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date(),
      attachments: attachments || [],
      metadata: metadata || {},
    };

    // Add message to conversation
    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date();
    
    // Update conversation totals if metadata provided
    if (metadata?.tokens) {
      conversation.totalTokens += metadata.tokens;
    }
    if (metadata?.cost) {
      conversation.totalCost += metadata.cost;
    }
    
    await conversation.save();

    // Update user usage if this is a user message
    if (role === 'user') {
      user.usage.messagesThisMonth += 1;
      await user.save();
    }

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/conversations/[id]/messages/[messageId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const conversation = await ConversationModel.findOne({
      id: params.id,
      clerkId: userId,
    });
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Remove message from array
    const messageIndex = conversation.messages.findIndex(
      (message: any) => message.id === params.messageId
    );

    if (messageIndex === -1) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    conversation.messages.splice(messageIndex, 1);
    conversation.updatedAt = new Date();
    await conversation.save();
    
    return NextResponse.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}