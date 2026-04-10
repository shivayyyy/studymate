import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { User } from '@studymate/database';
import { clerkClient } from '../lib/clerk';
import { generateAccessToken } from '@studymate/auth';

import { getAuth } from '@clerk/express';

const router = Router();

// Clerk sync endpoint: creates or finds a user in our DB based on Clerk identity
router.post('/sync', async (req: Request, res: Response) => {
    try {
        const auth = getAuth(req);

        if (!auth || !auth.userId) {
            res.status(401).json({ success: false, message: 'Not authenticated with Clerk' });
            return;
        }

        const clerkId = auth.userId;
        console.log(`[AUTH-DEBUG] Sync checking clerkId: ${clerkId}`);

        // 1. Check if user already exists in our DB by Clerk ID
        const existingUserById = await User.findOne({ clerkId }).select('-passwordHash');

        if (existingUserById) {
            res.json({ success: true, data: existingUserById, message: 'User found' });
            return;
        }

        // 2. Extract user info from Clerk backend
        const clerkUser = await clerkClient.users.getUser(clerkId);
        
        let email = '';
        if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
            email = clerkUser.emailAddresses[0].emailAddress;
        } else {
            res.status(400).json({ success: false, message: 'No email found in Clerk profile' });
            return;
        }

        const fullName = clerkUser.fullName || clerkUser.firstName || 'StudyMate User';
        const avatarUrl = clerkUser.imageUrl || clerkUser.hasImage ? clerkUser.imageUrl : undefined;

        // 3. Check if user exists by email (to support migrating from previous system)
        const existingUserByEmail = await User.findOne({ email }).select('-passwordHash');

        if (existingUserByEmail) {
            // Link existing user to Clerk
            existingUserByEmail.set('clerkId', clerkId);
            if (avatarUrl && !existingUserByEmail.profilePicture) existingUserByEmail.profilePicture = avatarUrl;
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
            clerkId,
            profilePicture: avatarUrl,
            isVerified: true, // Google login auto-verifies
        });

        res.status(201).json({ success: true, data: newUser, message: 'User created' });
    } catch (error) {
        console.error('Auth sync error:', error);
        res.status(500).json({ success: false, message: 'Failed to sync user' });
    }
});

// Since ONLY Google social auth is used, custom register/login/refresh are removed.

// Optional method to get the current loaded user from middleware
router.get('/me', authenticate, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
        res.json({ success: true, data: req.user });
    } catch (error) {
         res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/socket-token', authenticate, (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const token = generateAccessToken({
            userId: req.user.userId,
            email: req.user.email,
            username: req.user.username,
        });

        res.json({ success: true, data: { token } });
    } catch (e) {
        console.error('Socket token generation error:', e);
        res.status(500).json({ success: false, message: 'Failed to generate token' });
    }
});

router.get('/debug-user/:clerkId', async (req, res) => {
    try {
        const clerkId = req.params.clerkId;
        const userById = await User.findOne({ clerkId });
        const allUsers = await User.find({}).limit(5).select('email username clerkId');
        res.json({ 
            success: true, 
            queriedClerkId: clerkId, 
            foundExact: !!userById,
            userById,
            allUsers
        });
    } catch (e) {
        res.json({ success: false, error: (e as Error).message });
    }
});

export { router as authRouter };
