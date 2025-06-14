import mongoose from 'mongoose';

class DatabaseManager {
  private static instance: DatabaseManager;
  private isConnected = false;
  private connecting = false;
  private mongoServer: any = null;

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

      // Use actual MongoDB URI - fallback to memory server if no URI provided
      const MONGODB_URI = process.env.MONGODB_URI;
      
      if (MONGODB_URI) {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
      } else {
        // Fallback to memory server for development
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        if (!this.mongoServer) {
          this.mongoServer = await MongoMemoryServer.create({
            instance: {
              dbName: 'room-scheduler'
            }
          });
        }
        const uri = this.mongoServer.getUri();
        await mongoose.connect(uri);
        console.log('Connected to MongoDB Memory Server (fallback)');
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