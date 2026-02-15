import jwt from 'jsonwebtoken';

export interface TokenPayload {
    userId: string;
    email: string;
    username: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not defined');
    return jwt.sign(payload, secret, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined');
    return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const generateTokens = (payload: TokenPayload) => {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};

export const verifyAccessToken = (token: string): TokenPayload => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not defined');
    return jwt.verify(token, secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined');
    return jwt.verify(token, secret) as TokenPayload;
};
