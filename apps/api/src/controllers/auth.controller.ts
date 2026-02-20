import type { Request, Response, NextFunction } from 'express';
import { User } from '@studymate/database';
import { hashPassword, comparePassword, generateTokens, verifyRefreshToken } from '@studymate/auth';
import { CacheManager } from '@studymate/cache';
import { RedisKeys, RedisTTL } from '@studymate/config';
import { asyncHandler, success, error } from '@studymate/utils';
import { AppError } from '../middleware/error-handler';
import { createHash } from 'crypto';

export class AuthController {
    static register = asyncHandler(async (req: Request, res: Response) => {
        const { email, username, password, fullName, examCategory, subjects, targetYear, bio } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            throw new AppError('Email or username already taken', 409);
        }

        const passwordHash = await hashPassword(password);

        let user;
        try {
            user = await User.create({
                email,
                username,
                passwordHash,
                fullName,
                examCategory,
                subjects,
                targetYear,
                bio,
            });
        } catch (err: any) {
            if (err.code === 11000) {
                // Determine which field caused the duplicate error
                const field = Object.keys(err.keyPattern)[0];
                throw new AppError(`${field.charAt(0).toUpperCase() + field.slice(1)} already taken`, 409);
            }
            throw err;
        }

        const tokens = generateTokens({
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
        });

        const { passwordHash: _, ...userResponse } = user.toObject();

        // Store refresh token in Redis
        await CacheManager.set(
            RedisKeys.refreshToken(user._id.toString()),
            tokens.refreshToken,
            RedisTTL.REFRESH_TOKEN
        );

        res.status(201).json(success({
            user: userResponse,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        }, 'User registered successfully'));

        // Add to Bloom Filter ONLY after successful DB commit
        try {
            const { usernameBloomFilter } = await import('../lib/bloom');
            await usernameBloomFilter.add(username);
        } catch (bloomError) {
            console.error('Failed to add username to Bloom Filter:', bloomError);
        }


    });

    static login = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) throw new AppError('Invalid credentials', 401);
        if (!user.isActive) throw new AppError('Account is deactivated', 403);

        if (!user.passwordHash) throw new AppError('Invalid credentials', 401);
        const isValidPassword = await comparePassword(password, user.passwordHash);
        if (!isValidPassword) throw new AppError('Invalid credentials', 401);

        const tokens = generateTokens({
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
        });

        const { passwordHash: _, ...userResponse } = user.toObject();

        // Set cookies
        // Store refresh token in Redis
        await CacheManager.set(
            RedisKeys.refreshToken(user._id.toString()),
            tokens.refreshToken,
            RedisTTL.REFRESH_TOKEN
        );

        res.json(success({
            user: userResponse,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        }, 'Login successful'));

    });

    static refreshToken = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        if (!refreshToken) throw new AppError('Refresh token required', 400);

        const payload = verifyRefreshToken(refreshToken);
        const userId = payload.userId;

        // Verify token against Redis whitelist
        const storedToken = await CacheManager.get(RedisKeys.refreshToken(userId));
        if (!storedToken || storedToken !== refreshToken) {
            throw new AppError('Invalid or expired refresh token', 401);
        }

        const user = await User.findById(userId);
        if (!user || !user.isActive) throw new AppError('User not found or inactive', 401);

        const tokens = generateTokens({
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
        });

        // Rotate refresh token
        await CacheManager.set(
            RedisKeys.refreshToken(userId),
            tokens.refreshToken,
            RedisTTL.REFRESH_TOKEN
        );

        res.json(success({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        }, 'Token refreshed'));
    });



    static logout = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        const accessToken = req.headers.authorization?.split(' ')[1];

        if (accessToken) {
            const tokenHash = createHash('sha256').update(accessToken).digest('hex');
            await CacheManager.set(
                RedisKeys.blacklistedToken(tokenHash),
                true,
                RedisTTL.BLACKLISTED_TOKEN,
            );
        }

        if (refreshToken) {
            try {
                const payload = verifyRefreshToken(refreshToken);
                await CacheManager.del(RedisKeys.refreshToken(payload.userId));
            } catch (e) {
                // Ignore invalid refresh token during logout
            }
        } else if (req.user?.userId) {
            // Fallback if no refresh token provided but user is authenticated
            await CacheManager.del(RedisKeys.refreshToken(req.user.userId));
        }

        res.json(success(null, 'Logged out successfully'));
    });


    static me = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user?.userId) {
            throw new AppError('Not authenticated', 401);
        }
        const user = await User.findById(req.user.userId).select('-passwordHash');
        if (!user) {
            throw new AppError('User not found', 404);
        }
        res.json(success(user, 'Current user profile fetched'));
    });
    static socketToken = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user?.userId) {
            throw new AppError('Not authenticated', 401);
        }

        const tokens = generateTokens({
            userId: req.user.userId,
            email: req.user.email,
            username: req.user.username,
        });

        // We only need the access token for the socket
        res.json(success({ token: tokens.accessToken }, 'Socket token generated'));
    });
}
