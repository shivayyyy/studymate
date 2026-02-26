import type { Request, Response, NextFunction } from 'express';
import { User } from '@studymate/database';
import { supabase } from '../lib/supabase';

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
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !authUser) {
            res.status(401).json({ success: false, message: 'Invalid or expired token' });
            return;
        }

        const supabaseId = authUser.id;

        let user = await User.findOne({ supabaseId }).select('-passwordHash');

        if (!user) {
            // Auto-provision: if no user exists with this supabaseId, this is a new Supabase user
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
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const { data: { user: authUser } } = await supabase.auth.getUser(token);

            if (authUser) {
                const user = await User.findOne({ supabaseId: authUser.id }).select('-passwordHash');
                if (user && user.isActive) {
                    req.user = {
                        userId: user._id.toString(),
                        email: user.email,
                        username: user.username,
                    };
                }
            }
        }
    } catch (error) {
        // Ignore error for optional auth
    }
    next();
};
