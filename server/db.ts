// MongoDB connection is handled by server/database.ts
// This file is kept for compatibility but uses MongoDB exclusively
import { connectToDatabase } from './database';

// Initialize MongoDB connection
export const initializeDatabase = async () => {
  await connectToDatabase();
};
