import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async (uri?: string): Promise<void> => {
    if (isConnected) {
        console.log('MongoDB is already connected');
        return;
    }

    const mongoUri = uri || process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error('MONGODB_URI is not defined');
    }

    try {
        const conn = await mongoose.connect(mongoUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        isConnected = true;
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export const disconnectDB = async (): Promise<void> => {
    if (!isConnected) return;

    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected');
};

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
    isConnected = false;
});
