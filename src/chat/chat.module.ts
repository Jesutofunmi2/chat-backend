import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { Chat } from './chat.entity';
import { ChatGateway } from './chat.gateway';
import { User } from '../auth/user.entity';
import { AuthModule } from '../auth/auth.module';
import { ChatResolver } from './chat.resolver';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, User]),
    AuthModule, 
    JwtModule.register({})
  ],
  providers: [ChatResolver, ChatService, ChatGateway, JwtService],
  exports: [ChatService],
})
export class ChatModule {}

