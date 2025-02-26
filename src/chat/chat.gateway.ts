import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

interface User {
  socketId: string;
  username: string;
  room: string;
}

@WebSocketGateway({
    cors: { origin: '*', credentials: true },
    path: '/socket.io',
  })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private users: User[] = [];

  constructor(
    private chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }

  // **User connects**
  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.query.token as string;
      if (!token) {
        console.log('No token provided');
        socket.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      console.log('User connected:', payload.username);
    } catch (error) {
      console.log('Invalid token');
      socket.disconnect();
    }
  }

  // **User disconnects**
  async handleDisconnect(client: Socket) {
    const user = this.users.find((u) => u.socketId === client.id);
    if (user) {
      this.users = this.users.filter((u) => u.socketId !== client.id);
      this.server
        .to(user.room)
        .emit('message', {
          sender: 'System',
          text: `${user.username} left the room`,
        });
      this.server
        .to(user.room)
        .emit('activeUsers', await this.chatService.getActiveUsers(user.room));
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  // **User Joins a Room**
  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    client: Socket,
    { token, room }: { token: string; room: string },
  ) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.chatService.getUserById(decoded.userId);

      if (!user) {
        client.emit('error', { message: 'User not found' });
        return;
      }

      this.users.push({ socketId: client.id, username: user.username, room });
      client.join(room);

      // Notify others
      this.server
        .to(room)
        .emit('message', {
          sender: 'System',
          text: `${user.username} joined the room`,
        });
      this.server
        .to(room)
        .emit('activeUsers', await this.chatService.getActiveUsers(room));
    } catch (error) {
      client.emit('error', { message: 'Invalid token' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    { token, text, room }: { token: string; text: string; room: string },
  ) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.chatService.getUserById(decoded.userId);

      if (!user) {
        client.emit('error', { message: 'User not found' });
        return;
      }

      const message = {
        sender: user.username,
        text,
        timestamp: new Date(),
      };

      await this.chatService.sendMessage(user.id, text, room);

      this.server.to(room).emit('message', message);
    } catch (error) {
      client.emit('error', { message: 'Invalid token' });
    }
  }
}
