import type { Request, Response, NextFunction } from 'express';
import { User } from '@studymate/database';
import { createClerkClient, getAuth } from '@clerk/express';

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
});

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                username: string;
            };
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log('--- AUTH MIDDLEWARE TRIGGERED ---');
        console.log('Method:', req.method);
        console.log('Path:', req.path);

        const auth = getAuth(req);

        if (!auth || !auth.userId) {
            console.log('=> FAILED: Invalid or missing Clerk user identity');
            res.status(401).json({ success: false, message: 'Invalid or expired token' });
            return;
        }

        const clerkId = auth.userId;

        const user = await User.findOne({ clerkId }).select('-passwordHash');

        if (!user) {
            console.log('=> FAILED: User not found in DB with clerkId:', clerkId);
            res.status(401).json({ success: false, message: 'User not found. Please complete profile setup.' });
            return;
        }

        if (!user.isActive) {
            console.log('=> FAILED: User account is inactive');
            res.status(401).json({ success: false, message: 'User account is inactive' });
            return;
        }

        req.user = {
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
        };
        console.log('=> SUCCESS: User authenticated:', req.user.username);
        next();
    } catch (error) {
        console.error('Chat-service auth middleware error:', error);
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
