import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

class DatabaseManager {
  private static instance: DatabaseManager;
  private mongoServer: MongoMemoryServer | null = null;
  private isConnected = false;
  private connecting = false;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async connect() {
    if (this.connecting) {
      // Wait for ongoing connection
      while (this.connecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return mongoose.connection;
    }

    if (this.isConnected && mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    this.connecting = true;

    try {
      // Close existing connection if any
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        this.isConnected = false;
      }

      // Use MongoDB Memory Server for development
      if (process.env.NODE_ENV === 'development') {
        if (!this.mongoServer) {
          this.mongoServer = await MongoMemoryServer.create({
            instance: {
              dbName: 'room-scheduler'
            }
          });
        }
        const uri = this.mongoServer.getUri();
        await mongoose.connect(uri);
        console.log('Connected to MongoDB Memory Server');
      } else {
        // Use actual MongoDB URI in production
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/room-scheduler';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
      }

      this.isConnected = true;
      return mongoose.connection;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    } finally {
      this.connecting = false;
    }
  }

  async disconnect() {
    try {
      if (this.mongoServer) {
        await this.mongoServer.stop();
        this.mongoServer = null;
      }
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('MongoDB disconnection error:', error);
      throw error;
    }
  }
}

export async function connectToDatabase() {
  const dbManager = DatabaseManager.getInstance();
  return await dbManager.connect();
}

export async function disconnectFromDatabase() {
  const dbManager = DatabaseManager.getInstance();
  return await dbManager.disconnect();
}

// Schedule Schema
const scheduleSchema = new mongoose.Schema({
  college_time: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  break_periods: [{
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  }],
  rooms: [{ type: String, required: true }],
  subjects: [{
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    no_of_classes_per_week: { type: Number, required: true },
    faculty: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      availability: [{
        day: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true }
      }]
    }]
  }],
  created_at: { type: Date, default: Date.now }
});

export const ScheduleModel = mongoose.model('Schedule', scheduleSchema);