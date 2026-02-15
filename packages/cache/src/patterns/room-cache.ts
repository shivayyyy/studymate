import { CacheManager } from '../cache-manager';
import { RedisKeys, RedisTTL } from '@studymate/config';

export class RoomCache {
    static async setRoomState(roomId: string, state: any): Promise<void> {
        await CacheManager.set(RedisKeys.roomState(roomId), state, RedisTTL.ROOM_STATE);
    }

    static async getRoomState(roomId: string): Promise<any | null> {
        return CacheManager.get(RedisKeys.roomState(roomId));
    }

    static async incrementOccupancy(roomId: string): Promise<number> {
        return CacheManager.incr(RedisKeys.roomOccupancy(roomId));
    }

    static async decrementOccupancy(roomId: string): Promise<number> {
        return CacheManager.decr(RedisKeys.roomOccupancy(roomId));
    }

    static async addUserToRoom(roomId: string, userId: string): Promise<void> {
        await CacheManager.sAdd(RedisKeys.roomUsers(roomId), userId);
    }

    static async removeUserFromRoom(roomId: string, userId: string): Promise<void> {
        await CacheManager.sRem(RedisKeys.roomUsers(roomId), userId);
    }

    static async getRoomUsers(roomId: string): Promise<string[]> {
        return CacheManager.sMembers(RedisKeys.roomUsers(roomId));
    }
}
