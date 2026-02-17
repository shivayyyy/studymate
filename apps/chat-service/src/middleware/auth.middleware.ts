import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type TokenPayload } from '@studymate/auth';
import { CacheManager } from '@studymate/cache';
import { RedisKeys } from '@studymate/config';
import { createHash } from 'crypto';

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Access token required' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyAccessToken(token);

        // Check if token is blacklisted
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const isBlacklisted = await CacheManager.get(RedisKeys.blacklistedToken(tokenHash));
        if (isBlacklisted) {
            res.status(401).json({ success: false, message: 'Token has been revoked' });
            return;
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired access token' });
        return;
    }
};
