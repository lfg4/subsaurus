
import { UserRepository } from '../repositories/UserRepository';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async getAllUsers() {
    return await this.userRepository.getAllUsers();
  }

  async getUserById(id: number) {
    return await this.userRepository.getUserById(id);
  }

  async createUser(email: string, name?: string) {
    return await this.userRepository.createUser(email, name);
  }

  async deleteUser(id: number) {
    return await this.userRepository.deleteUser(id);
  }
}

