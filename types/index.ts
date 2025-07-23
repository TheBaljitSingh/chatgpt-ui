export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  isEditing?: boolean;
  originalContent?: string;
}

//directly uploading to coludinary and using its stirng
export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  isUploading: boolean;
  cloudinaryId?: string;
  uploadProgress:number
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface MemoryContext {
  userId: string;
  conversationId: string;
  summary: string;
  keyPoints: string[];
  lastUpdated: Date;
}