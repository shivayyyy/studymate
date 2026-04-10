import mongoose from 'mongoose';
import { User } from './dist/models/User.model.js';

async function run() {
  await mongoose.connect('mongodb+srv://shivamji:lolhogaya0025@studymate-db-official.4lrzhvh.mongodb.net/');
  console.log('Connected to DB');
  const clerkId = 'user_3C7oe0NuS1OzDLZiouAcRGXhHw7';
  const user = await User.findOne({ clerkId });
  console.log('User found EXACT:', !!user);
  if (user) {
    console.log('User isActive:', user.isActive);
  }
  
  const allUsers = await User.find({}).limit(5);
  console.log('Sample users in DB:');
  allUsers.forEach(u => {
    console.log('- _id:', u._id, 'email:', u.email, 'clerkId:', u.clerkId);
  });
  process.exit(0);
}
run();
