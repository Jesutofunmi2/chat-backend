import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) 
    private readonly userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async findUser(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }

  async login(username: string, password: string) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) {
        throw new UnauthorizedException('User not found');
      }

    const isPasswordValid = await bcrypt.compare(password, user?.password);

    if (isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.jwtService.sign({ userId: user.id, username: user.username }) ;
  }
}
