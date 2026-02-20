
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_CHAT_SERVICE_URL || 'http://localhost:3003';

class SocketClient {
    private socket: Socket | null = null;
    private token: string | null = null;

    connect(token: string) {
        if (this.socket && this.socket.connected && this.token === token) {
            return this.socket;
        }

        if (this.socket) {
            this.socket.disconnect();
        }

        this.token = token;
        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.token = null;
        }
    }

    getSocket() {
        return this.socket;
    }

    // Helper to emit events safely
    emit(event: string, data: any) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not connected, cannot emit:', event);
        }
    }
}

export const socketClient = new SocketClient();
