import { Router, Request, Response } from 'express';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '@studymate/validation';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { getAuth, clerkClient } from '@clerk/express';
import { User } from '@studymate/database';

const router = Router();

// Clerk sync endpoint: creates or finds a user in our DB based on Clerk identity
router.post('/sync', async (req: Request, res: Response) => {
    try {
        const { userId: clerkUserId } = getAuth(req);

        if (!clerkUserId) {
            res.status(401).json({ success: false, message: 'Not authenticated with Clerk' });
            return;
        }

        // 1. Check if user already exists in our DB by Clerk ID
        const existingUserByClerkId = await User.findOne({ clerkId: clerkUserId }).select('-passwordHash');

        if (existingUserByClerkId) {
            res.json({ success: true, data: existingUserByClerkId, message: 'User found' });
            return;
        }

        // 2. Fetch user details from Clerk to find them by email if needed
        const clerkUser = await clerkClient.users.getUser(clerkUserId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

        if (!email) {
            res.status(400).json({ success: false, message: 'No email found in Clerk profile' });
            return;
        }

        // 3. Check if user exists by email (migrating from old auth system or duplicate check)
        const existingUserByEmail = await User.findOne({ email }).select('-passwordHash');

        if (existingUserByEmail) {
            // Link existing user to Clerk
            existingUserByEmail.clerkId = clerkUserId;
            if (clerkUser.imageUrl) existingUserByEmail.profilePicture = clerkUser.imageUrl;
            await existingUserByEmail.save();
            res.json({ success: true, data: existingUserByEmail, message: 'User linked to Clerk' });
            return;
        }

        // 4. Create new user if they don't exist by ID or Email
        const username = email.split('@')[0] + '_' + Date.now().toString(36);
        const newUser = await User.create({
            email,
            username,
            fullName,
            clerkId: clerkUserId,
            profilePicture: clerkUser.imageUrl || undefined,
            isVerified: true,
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
