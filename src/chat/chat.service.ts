import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../auth/user.entity';

interface UserInterface {
  socketId: string;
  username: string;
  room: string;
}

@Injectable()
export class ChatService {
  private users: UserInterface[] = [];
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async sendMessage(userId: number, text: string, room: string): Promise<Chat> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const message = this.chatRepository.create({ sender: user, text, room });
    return await this.chatRepository.save(message);
  }

  async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getMessagesByRoom(room: string) {
    return await this.chatRepository.find({
      where: { room },
      order: { timestamp: 'ASC' },
    });
  }

  async getActiveUsers(room: string): Promise<string[]> {
    const users = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.sender', 'user')
      .select('DISTINCT user.username', 'username')
      .where('chat.room = :room', { room })
      .getRawMany();

    return users.map((user) => user.username);
  }

  async joinRoom(socketId: string, username: string, room: string) {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new Error('User not found');
    }

    this.users.push({ socketId, username, room });

    return {
      message: `${username} joined the room`,
      activeUsers: this.getActiveUsers(room),
    };
  }
}
