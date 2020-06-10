import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, ERole, Role } from './entities';
import { Auth } from '../auth/entities';
import { CryptoService } from '../crypto/crypto.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
    private cryptoService: CryptoService,
  ) {}

  async create(user: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      email: user.email,
    });

    if (existingUser) {
      throw new ConflictException('User email already exists');
    }

    const { password, ...userData } = user;
    const createdUser = await this.userRepository.save(userData);
    const hashedPassword = await this.cryptoService.hashPassword(password);

    await this.authRepository.save({
      userId: createdUser.id,
      password: hashedPassword,
    });

    return createdUser;
  }

  findAll(role?: Role): Promise<User[]> {
    const query = role ? { role } : undefined;
    return this.userRepository.find(query);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(
    email: string,
    options?: { withAuth: boolean },
  ): Promise<User> {
    const relations = options && options.withAuth ? ['auth'] : undefined;
    const user = await this.userRepository.findOne({ email }, { relations });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, userData: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    await this.userRepository.update(id, userData);
    return Object.assign({}, user, userData);
  }

  async delete(id: number): Promise<User> {
    const user = await this.findOne(id);
    await this.userRepository.delete(id);
    return user;
  }
}
