import { Request, Response } from 'express';
import { Notification } from '@studymate/database';
import { createLogger } from '@studymate/logger';

const logger = createLogger('notification-controller');

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const notifications = await Notification.find({ recipientId: userId })
            .select('senderId type postId isRead createdAt')
            .populate('senderId', 'username fullName profilePicture')
            .sort({ createdAt: -1 })
            .limit(50); // Get recent 50 notifications

        res.json(notifications);
    } catch (error) {
        logger.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        // Mark all as read for this user
        await Notification.updateMany(
            { recipientId: userId, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        logger.error('Error marking notifications as read:', error);
        res.status(500).json({ message: 'Error marking notifications as read' });
    }
};
