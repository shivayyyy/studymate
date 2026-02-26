import type { Request, Response, NextFunction } from 'express';
import { User } from '@studymate/database';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

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

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('=> FAILED: Missing or malformed Authorization Bearer token');
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !authUser) {
            console.log('=> FAILED: Supabase user verification failed:', authError?.message);
            res.status(401).json({ success: false, message: 'Invalid or expired token' });
            return;
        }

        const supabaseUserId = authUser.id;

        const user = await User.findOne({ supabaseId: supabaseUserId }).select('-passwordHash');

        if (!user) {
            console.log('=> FAILED: User not found in DB with supabaseId:', supabaseUserId);
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
