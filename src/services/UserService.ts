
import type { UserRepository } from '../repositories/UserRepository';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  
  async getAllUsers() {
    return await this.userRepository.getAllUsers();
  }

  async createUser(email: string, name?: string) {
    return await this.userRepository.createUser(email, name);
  }
}

