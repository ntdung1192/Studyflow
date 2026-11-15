import mongoose from 'mongoose';

export async function connectDatabase() {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Create server/.env from server/.env.example.');
  }

  await mongoose.connect(MONGODB_URI);
  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
