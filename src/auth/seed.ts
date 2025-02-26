import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

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
      { username: 'balogun', password: 'balo5544' },
      { username: 'ayo', password: 'ayo123' },
    ];

    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = this.userRepository.create({
        username: userData.username,
        password: hashedPassword,
      });

      await this.userRepository.save(user);
    }

    console.log('Test users seeded successfully');
  }
}
