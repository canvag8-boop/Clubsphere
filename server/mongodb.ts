import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/clubsphere';
export const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGO_URI;

let isConnecting = false;

export async function connectMongoDB(uri: string = MONGODB_URI): Promise<boolean> {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (isConnecting) {
    return false;
  }

  isConnecting = true;
  try {
    console.log(`[MongoDB] Attempting to connect to: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    console.log('[MongoDB] ✅ Successfully connected to MongoDB database!');
    isConnecting = false;
    return true;
  } catch (error: any) {
    console.warn(`[MongoDB] ⚠️ Connection warning: ${error.message}`);
    console.warn('[MongoDB] Note: To use MongoDB, ensure local mongod is running or supply MONGODB_URI in .env');
    isConnecting = false;
    return false;
  }
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getMongoConnectionState(): {
  state: string;
  connected: boolean;
  uri: string;
  database: string;
} {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateStr = states[mongoose.connection.readyState] || 'unknown';
  const maskedUri = MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  
  return {
    state: stateStr,
    connected: mongoose.connection.readyState === 1,
    uri: maskedUri,
    database: mongoose.connection.name || 'clubsphere',
  };
}

export async function disconnectMongoDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[MongoDB] Disconnected from MongoDB.');
  }
}
