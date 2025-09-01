import mongoose, {Mongoose} from 'mongoose';
import { unique } from 'next/dist/build/utils';

const MONGODB_URI = process.env.MONGODB_URI!;

interface MongooseConn{
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null

}

let cached: MongooseConn = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null
  }
}

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function connectToDatabase() {

  if (cached.conn) return cached.conn;
  cached.promise = cached.promise ||
    mongoose.connect(MONGODB_URI, {
      dbName: 'chatgpt-db',
      bufferCommands: false,
      connectTimeoutMS: 3000
    });

  cached.conn = await cached.promise;


  return cached.conn;

}

export default connectToDatabase;



const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String, required: true, unique: true
  },
  email: {
    type: String, required: true, lowercase: true,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String
  },
  // Additional custom fields
  preferences: {
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'en' },
    defaultModel: { type: String, default: 'gpt-3.5-turbo' },
  },
  subscription: {
    plan: { type: String, default: 'free' },
    status: { type: String, default: 'active' },
    expiresAt: { type: Date },
  },
  usage: {
    messagesThisMonth: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now },
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }

});
UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
})

// Mongoose Schemas
const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  attachments: [{
    id: String,
    name: String,
    type: String,
    size: Number,
    url: String,
    cloudinaryId: String,
  }],
  //additional
  metadata: {
    model: String,
    tokens: Number,
    cost: Number,
  }
});

const ConversationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  userId: { type: String, required: false },
  clerkId: {
    type: String,
    required: true
  },
  //additional data
  model: { type: String, default: 'gpt-3.5-turbo' },
  temperature: { type: Number, default: 0.7 },
  isArchived: { type: Boolean, default: false },
  tags: [String],
  totalTokens: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
});

// Update timestamps on save
ConversationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});


ConversationSchema.index({ clerkId: 1, updatedAt: -1 });
ConversationSchema.index({ clerkId: 1, isArchived: 1 });
UserSchema.index({ clerkId: 1 });
UserSchema.index({ email: 1 });

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const ConversationModel = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);