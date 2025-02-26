import { DataSource } from 'typeorm';
import { User } from './auth/user.entity';
import { Chat } from './chat/chat.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Chat],
  synchronize: false,
  migrations: ['src/migrations/*.ts'],
});
