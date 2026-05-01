import { io, Socket } from 'socket.io-client';
import type { Message } from '@/types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

class SocketService {
  private socket: Socket | null = null;
  private messageCallbacks: ((message: Message) => void)[] = [];
  private typingCallbacks: ((data: { userId: string; userName: string }) => void)[] = [];
  private stopTypingCallbacks: ((data: { userId: string }) => void)[] = [];
  private readCallbacks: ((data: { chatId: string; userId: string }) => void)[] = [];

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('receive_message', (message: Message) => {
      this.messageCallbacks.forEach((cb) => cb(message));
    });

    this.socket.on('user_typing', (data: { userId: string; userName: string }) => {
      this.typingCallbacks.forEach((cb) => cb(data));
    });

    this.socket.on('user_stop_typing', (data: { userId: string }) => {
      this.stopTypingCallbacks.forEach((cb) => cb(data));
    });

    this.socket.on('messages_read', (data: { chatId: string; userId: string }) => {
      this.readCallbacks.forEach((cb) => cb(data));
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinChat(chatId: string): void {
    this.socket?.emit('join_chat', chatId);
  }

  leaveChat(chatId: string): void {
    this.socket?.emit('leave_chat', chatId);
  }

  sendMessage(data: {
    chatId: string;
    senderId: string;
    content: string;
    attachments?: string[];
  }): void {
    this.socket?.emit('send_message', data);
  }

  startTyping(chatId: string, userId: string, userName: string): void {
    this.socket?.emit('typing', { chatId, userId, userName });
  }

  stopTyping(chatId: string, userId: string): void {
    this.socket?.emit('stop_typing', { chatId, userId });
  }

  markAsRead(chatId: string, userId: string): void {
    this.socket?.emit('mark_read', { chatId, userId });
  }

  onMessage(callback: (message: Message) => void): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== callback);
    };
  }

  onTyping(callback: (data: { userId: string; userName: string }) => void): () => void {
    this.typingCallbacks.push(callback);
    return () => {
      this.typingCallbacks = this.typingCallbacks.filter((cb) => cb !== callback);
    };
  }

  onStopTyping(callback: (data: { userId: string }) => void): () => void {
    this.stopTypingCallbacks.push(callback);
    return () => {
      this.stopTypingCallbacks = this.stopTypingCallbacks.filter((cb) => cb !== callback);
    };
  }

  onMessagesRead(callback: (data: { chatId: string; userId: string }) => void): () => void {
    this.readCallbacks.push(callback);
    return () => {
      this.readCallbacks = this.readCallbacks.filter((cb) => cb !== callback);
    };
  }
}

export const socketService = new SocketService();
export default socketService;
