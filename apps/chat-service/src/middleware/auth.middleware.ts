import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { User } from '@studymate/database';

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
        console.log('Headers (Authorization):', req.headers.authorization);

        const authInfo = getAuth(req);
        console.log('Clerk getAuth result:', JSON.stringify(authInfo, null, 2));

        const { userId: clerkUserId } = authInfo;

        if (!clerkUserId) {
            console.log('=> FAILED: No clerkUserId parsed by getAuth');
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const user = await User.findOne({ clerkId: clerkUserId }).select('-passwordHash');

        if (!user) {
            console.log('=> FAILED: User not found in DB with clerkId:', clerkUserId);
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
