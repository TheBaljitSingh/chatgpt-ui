// app/api/conversations/route.ts
import { getAuth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectToDatabase, { ConversationModel, UserModel } from '@/lib/mongodb';
import { ConversationService } from '@/services/conversationService';

const client = await clerkClient();

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const archived = searchParams.get('archived') === 'true';

    const conversations = await ConversationService.getUserConversations(userId);


    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, model = 'gpt-3.5-turbo', temperature = 0.7 } = await req.json();

    await connectToDatabase();

    const conversation = new ConversationModel({
      id: uuidv4(),
      title: title || 'New Chat',
      clerkId: userId,
      model,
      temperature,
      messages: [],
    });

    await conversation.save();

    return NextResponse.json({
      id: conversation.id,
      title: conversation.title,
      model: conversation.model,
      temperature: conversation.temperature,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}