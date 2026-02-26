import { Router, Request, Response } from 'express';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '@studymate/validation';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { User } from '@studymate/database';

const router = Router();

// Supabase sync endpoint: creates or finds a user in our DB based on Supabase identity
router.post('/sync', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Not authenticated with Supabase' });
            return;
        }

        const token = authHeader.split(' ')[1];

        // Use the admin client to verify and fetch user info securely
        // We import the same client we created for middleware.
        const { supabase } = await import('../lib/supabase');
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !authUser) {
            res.status(401).json({ success: false, message: 'Invalid or expired token' });
            return;
        }

        const supabaseUserId = authUser.id;

        // 1. Check if user already exists in our DB by Supabase ID
        const existingUserById = await User.findOne({ supabaseId: supabaseUserId }).select('-passwordHash');

        if (existingUserById) {
            res.json({ success: true, data: existingUserById, message: 'User found' });
            return;
        }

        // 2. Extract email and basic info from JWT claims/user object
        const email = authUser.email;
        // User metadata from OAuth like Google might contain name/avatar
        const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'StudyMate User';
        const avatarUrl = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || undefined;

        if (!email) {
            res.status(400).json({ success: false, message: 'No email found in Supabase profile' });
            return;
        }

        // 3. Check if user exists by email (migrating from old auth system or duplicate check)
        const existingUserByEmail = await User.findOne({ email }).select('-passwordHash');

        if (existingUserByEmail) {
            // Link existing user to Supabase
            existingUserByEmail.supabaseId = supabaseUserId;
            if (avatarUrl && !existingUserByEmail.profilePicture) existingUserByEmail.profilePicture = avatarUrl;
            await existingUserByEmail.save();
            res.json({ success: true, data: existingUserByEmail, message: 'User linked to Supabase' });
            return;
        }

        // 4. Create new user if they don't exist by ID or Email
        const username = email.split('@')[0] + '_' + Date.now().toString(36);
        const newUser = await User.create({
            email,
            username,
            fullName,
            supabaseId: supabaseUserId,
            profilePicture: avatarUrl,
            isVerified: true, // They verified email via provider usually.
        });

        res.status(201).json({ success: true, data: newUser, message: 'User created' });
    } catch (error) {
        console.error('Auth sync error:', error);
        res.status(500).json({ success: false, message: 'Failed to sync user' });
    }
});

router.get('/me', authenticate, AuthController.me);

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/socket-token', authenticate, AuthController.socketToken);

export { router as authRouter };
