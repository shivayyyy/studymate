import type { Request, Response, NextFunction } from 'express';
import { User } from '@studymate/database';
import { clerkClient } from '../lib/clerk';
import { getAuth } from '@clerk/express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                username: string;
                clerkId: string;
            };
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const auth = getAuth(req);

        if (!auth || !auth.userId) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const clerkId = auth.userId;
        console.log(`[AUTH-DEBUG] Middleware checking clerkId: ${clerkId}`);

        let user = await User.findOne({ clerkId }).select('-passwordHash');

        if (!user) {
            // Auto-provision: if no user exists with this clerkId, this is a new user
            // We'll return 401 for now — the /auth/sync route will handle user creation
            res.status(401).json({ success: false, message: 'User not found. Please complete profile setup by calling /sync.' });
            return;
        }

        if (!user.isActive) {
            res.status(401).json({ success: false, message: 'User account is inactive' });
            return;
        }

        req.user = {
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
            clerkId: clerkId,
        };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const auth = getAuth(req);
        
        if (auth && auth.userId) {
            const user = await User.findOne({ clerkId: auth.userId }).select('-passwordHash');
            if (user && user.isActive) {
                req.user = {
                    userId: user._id.toString(),
                    email: user.email,
                    username: user.username,
                    clerkId: auth.userId,
                };
            }
        }
    } catch (error) {
        // Ignore error for optional auth
    }
    next();
};
