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
        // Use Clerk's getAuth to verify the JWT
        const { userId: clerkUserId } = getAuth(req);

        if (!clerkUserId) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        // Look up the user in our database by clerkId
        let user = await User.findOne({ clerkId: clerkUserId }).select('-passwordHash');

        if (!user) {
            // Auto-provision: if no user exists with this clerkId, this is a new Clerk user
            // We'll return 401 for now — the /auth/sync route will handle user creation
            res.status(401).json({ success: false, message: 'User not found. Please complete profile setup.' });
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
        };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userId: clerkUserId } = getAuth(req);

        if (clerkUserId) {
            const user = await User.findOne({ clerkId: clerkUserId }).select('-passwordHash');
            if (user && user.isActive) {
                req.user = {
                    userId: user._id.toString(),
                    email: user.email,
                    username: user.username,
                };
            }
        }
    } catch (error) {
        // Ignore error for optional auth
    }
    next();
};
