import { UserRepository } from '../repositories/UserRepository';
import { UserService } from '../services/UserService';
import { PingService } from '../services/PingService';

let userRepositoryInstance: UserRepository;
let userServiceInstance: UserService;
let pingServiceInstance: PingService;

export function getUserRepository(): UserRepository {
  if (!userRepositoryInstance) {
    userRepositoryInstance = new UserRepository();
  }
  return userRepositoryInstance;
}

export function getUserService(): UserService {
  if (!userServiceInstance) {
    const userRepository = getUserRepository();
    userServiceInstance = new UserService(userRepository);
  }
  return userServiceInstance;
}

export function getPingService(): PingService {
  if (!pingServiceInstance) {
    pingServiceInstance = new PingService();
  }
  return pingServiceInstance;
}

export function resetContainer() {
  userRepositoryInstance = undefined as any;
  userServiceInstance = undefined as any;
  pingServiceInstance = undefined as any;
}

