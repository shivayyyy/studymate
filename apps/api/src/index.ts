import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { connectDB } from '@studymate/database';
import { connectRedis } from '@studymate/cache';
import { createLogger } from '@studymate/logger';
import { API_PREFIX, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } from '@studymate/config';
import http from 'http';


import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { roomRouter } from './routes/room.routes';
import { postRouter } from './routes/post.routes';
import { sessionRouter } from './routes/session.routes';
import { feedRouter } from './routes/feed.routes';
import { analyticsRouter } from './routes/analytics.routes';

import uploadRouter from './routes/upload.routes';
import { errorHandler } from './middleware/error-handler';

const logger = createLogger('api');
const app = express();
const PORT = process.env.PORT || 3001;

// ==================== Middleware ====================

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX_REQUESTS,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Static uploads (local dev)
app.use('/uploads', express.static('uploads'));

// ==================== Routes ====================

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api', timestamp: new Date().toISOString() });
});

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/users`, userRouter);
app.use(`${API_PREFIX}/rooms`, roomRouter);
app.use(`${API_PREFIX}/posts`, postRouter);
app.use(`${API_PREFIX}/sessions`, sessionRouter);
app.use(`${API_PREFIX}/feed`, feedRouter);
app.use(`${API_PREFIX}/analytics`, analyticsRouter);

app.use(`${API_PREFIX}/uploads`, uploadRouter);

// ==================== Error Handling ====================

app.use(errorHandler);

// ==================== Server Startup ====================

const startServer = async () => {
    try {
        await connectDB();
        logger.info('MongoDB connected');

        await connectRedis();
        logger.info('Redis connected');





        app.listen(PORT, () => {
            logger.info(`API server running on port ${PORT}`);
            logger.info(`Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        logger.error('Failed to start API server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
