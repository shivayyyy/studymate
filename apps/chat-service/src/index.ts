import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { connectDB } from '@studymate/database';
import { connectRedis } from '@studymate/cache';
import { createLogger } from '@studymate/logger';
import { API_PREFIX } from '@studymate/config';
import { clerkMiddleware } from '@clerk/express';
import { SocketService } from './services/SocketService';
import { chatRouter } from './routes/chat.routes';
import dotenv from 'dotenv';
dotenv.config();
const logger = createLogger('chat-service');
const app = express();
const PORT = process.env.CHAT_SERVICE_PORT || 3003;

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(clerkMiddleware({
    authorizedParties: ['http://localhost:3000']
}));

app.use((req, res, next) => {
    logger.info(`🚨 Incoming Request to Chat Service: ${req.method} ${req.originalUrl}`);
    next();
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'chat-service', timestamp: new Date().toISOString() });
});

app.use(`${API_PREFIX}/chat`, (req, res, next) => {
    logger.info(`👉 Routing to chatRouter: ${req.method} ${req.originalUrl}`);
    next();
}, chatRouter);

// Catch 404s intentionally to log them
app.use((req, res, next) => {
    logger.warn(`❌ 404 Not Found in Chat Service: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ success: false, message: 'Route not found in chat-service' });
});

const startServer = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        logger.info('MongoDB connected');

        await connectRedis();
        logger.info('Redis connected');

        const httpServer = http.createServer(app);

        // Initialize Socket Service
        SocketService.init(httpServer);
        logger.info('Socket.io initialized');

        httpServer.listen(PORT, () => {
            logger.info(`Chat Service running on port ${PORT}`);
            logger.info(`Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        logger.error('Failed to start Chat Service:', error);
        process.exit(1);
    }
};

startServer();
