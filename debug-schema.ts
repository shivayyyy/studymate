import { Room } from './packages/database/src/models/Room.model';
import mongoose from 'mongoose';

console.log('Room Schema Paths:', Object.keys(Room.schema.paths));
console.log('createdBy path info:', Room.schema.paths.createdBy);

process.exit(0);
