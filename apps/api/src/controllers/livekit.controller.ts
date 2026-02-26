import { Request, Response } from 'express';
import { AccessToken } from 'livekit-server-sdk';
import { asyncHandler, success, error } from '@studymate/utils';

export class LiveKitController {
    static getToken = asyncHandler(async (req: Request, res: Response) => {
        const { roomId } = req.params;
        const userId = req.user?.userId;
        const username = req.user?.username;

        if (!userId || !username) {
            return res.status(401).json(error('Unauthorized', 401));
        }

        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;

        // Make it easier for local dev by providing dev credentials if env vars are missing
        if (!apiKey || !apiSecret) {
            console.warn('LiveKit API Key or Secret not found in env. Falling back to dev credentials.');
        }

        const at = new AccessToken(
            apiKey || 'devkey',
            apiSecret || 'secret',
            {
                identity: userId,
                name: username,
                ttl: 3600, // 1 hour token validity
            }
        );

        at.addGrant({
            room: roomId as string,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
            canPublishData: false, // Using socket.io for data/chat
        });

        const token = await at.toJwt();
        res.json(success({ token }, 'LiveKit token generated'));
    });
}
