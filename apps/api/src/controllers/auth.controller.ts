import type { Request, Response, NextFunction } from 'express';
import { User } from '@studymate/database';
import { hashPassword, comparePassword, generateTokens, verifyRefreshToken } from '@studymate/auth';
import { asyncHandler, success, error } from '@studymate/utils';
import { AppError } from '../middleware/error-handler';

export class AuthController {
    static register = asyncHandler(async (req: Request, res: Response) => {
        const { email, username, password, fullName, examCategory, subjects, targetYear, bio } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            throw new AppError('Email or username already taken', 409);
        }

        const passwordHash = await hashPassword(password);

        const user = await User.create({
            email,
            username,
            passwordHash,
            fullName,
            examCategory,
            subjects,
            targetYear,
            bio,
        });

        const tokens = generateTokens({
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
        });

        const { passwordHash: _, ...userResponse } = user.toObject();

        res.status(201).json(success({ user: userResponse, tokens }, 'User registered successfully'));
    });

    static login = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) throw new AppError('Invalid credentials', 401);
        if (!user.isActive) throw new AppError('Account is deactivated', 403);

        const isValidPassword = await comparePassword(password, user.passwordHash);
        if (!isValidPassword) throw new AppError('Invalid credentials', 401);

        const tokens = generateTokens({
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
        });

        const { passwordHash: _, ...userResponse } = user.toObject();

        res.json(success({ user: userResponse, tokens }, 'Login successful'));
    });

    static refreshToken = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;

        const payload = verifyRefreshToken(refreshToken);

        const user = await User.findById(payload.userId);
        if (!user || !user.isActive) throw new AppError('Invalid refresh token', 401);

        const tokens = generateTokens({
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
        });

        res.json(success({ tokens }, 'Token refreshed'));
    });

    static logout = asyncHandler(async (req: Request, res: Response) => {
        // In a full implementation, blacklist the token in Redis
        res.json(success(null, 'Logged out successfully'));
    });
}
