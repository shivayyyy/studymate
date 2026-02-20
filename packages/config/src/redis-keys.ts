/**
 * Redis key patterns for consistent key naming across the application.
 * Use these helper functions to generate Redis keys.
 *
 * Naming convention: entity:id:attribute
 */

export const RedisKeys = {
    // Room state
    roomState: (roomId: string) => `room:${roomId}:state`,
    roomOccupancy: (roomId: string) => `room:${roomId}:occupancy`,
    roomUsers: (roomId: string) => `room:${roomId}:users`,
    roomTimer: (roomId: string) => `room:${roomId}:timer`,

    // User data
    userProfile: (userId: string) => `user:${userId}:profile`,
    userSession: (userId: string) => `user:${userId}:session`,
    userPresence: (userId: string) => `user:${userId}:presence`,
    userSocketMap: (userId: string) => `user:${userId}:socket`,

    // Feed caching
    userFeed: (userId: string) => `feed:user:${userId}`,
    trendingFeed: (exam: string) => `feed:trending:${exam}`,
    followingFeed: (userId: string) => `feed:following:${userId}`,

    // New Scalable Feed System
    feedLatest: (examCategory: string) => `feed:exam:${examCategory}:latest`,
    feedTrending: (examCategory: string) => `feed:exam:${examCategory}:trending`,
    feedSubject: (examCategory: string, subject: string) => `feed:exam:${examCategory}:subject:${subject}`,
    feedTag: (examCategory: string, tag: string) => `feed:exam:${examCategory}:tag:${tag}`,

    // Entities
    post: (postId: string) => `post:${postId}`,

    // Leaderboard (sorted sets)
    leaderboardWeekly: (exam: string) => `leaderboard:${exam}:weekly`,
    leaderboardAllTime: (exam: string) => `leaderboard:${exam}:alltime`,

    // Session tracking
    activeSession: (userId: string) => `session:active:${userId}`,

    postLikes: (postId: string) => `post:${postId}:likes`,

    // Rate limiting
    rateLimit: (ip: string) => `ratelimit:${ip}`,

    // Auth tokens
    refreshToken: (userId: string) => `auth:refresh:${userId}`,
    blacklistedToken: (tokenId: string) => `auth:blacklist:${tokenId}`,
} as const;

// TTL constants (in seconds)
export const RedisTTL = {
    ROOM_STATE: 3600,        // 1 hour
    USER_PROFILE: 1800,      // 30 minutes
    USER_FEED: 1800,         // 30 minutes
    TRENDING_FEED: 600,      // 10 minutes
    LEADERBOARD_WEEKLY: 604800, // 7 days
    SESSION_ACTIVE: 86400,   // 24 hours
    RATE_LIMIT: 900,         // 15 minutes
    REFRESH_TOKEN: 604800,   // 7 days
    BLACKLISTED_TOKEN: 900,  // 15 minutes
    USER_PRESENCE: 300,      // 5 minutes
} as const;
