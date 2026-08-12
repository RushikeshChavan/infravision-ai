import mongoose from 'mongoose';

export async function connectMongo(uri: string) {
  mongoose.set('strictQuery', true);
  return mongoose.connect(uri);
}
