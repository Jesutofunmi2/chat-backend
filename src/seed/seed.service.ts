import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seedUsers() {
    const existingUsers = await this.userRepository.count();
    if (existingUsers > 0) {
      console.log('Users already seeded. Skipping...');
      return;
    }

    const users = [
      { username: 'testuser', password: 'password123' },
      { username: 'admin', password: 'admin123' },
    ];

    await this.userRepository.save(users);
    console.log('Default users seeded successfully.');
  }
}
