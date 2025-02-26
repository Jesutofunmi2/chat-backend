import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { Chat } from './chat.entity';

@Resolver()
export class ChatResolver {
  constructor(private chatService: ChatService) {}

  @Query(() => [String])
  async getActiveUsers(@Args('room') room: string): Promise<string[]> {
    return this.chatService.getActiveUsers(room);
  }

  @Mutation(() => Chat)
  async sendMessage(
    @Args('userId', { type: () => Number }) userId: number,
    @Args('text') text: string,
    @Args('room') room: string,
  ): Promise<Chat> {
    return this.chatService.sendMessage(userId, text, room);
  }

  @Mutation(() => String)
  async joinRoom(
    @Args('username') username: string,
    @Args('room') room: string,
  ): Promise<string> {
    const result = await this.chatService.joinRoom('graphql', username, room);
    return result.message;
  }
}
