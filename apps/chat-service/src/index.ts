import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { connectDB } from '@studymate/database';
import { connectRedis } from '@studymate/cache';
import { createLogger } from '@studymate/logger';
import { API_PREFIX } from '@studymate/config';
import { SocketService } from './services/SocketService';
import { chatRouter } from './routes/chat.routes';

const logger = createLogger('chat-service');
const app = express();
const PORT = process.env.CHAT_SERVICE_PORT || 3002;

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'chat-service', timestamp: new Date().toISOString() });
});

app.use(`${API_PREFIX}/chat`, chatRouter);

const startServer = async () => {
    try {
        await connectDB();
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
