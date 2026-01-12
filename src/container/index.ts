import { UserRepository } from '../repositories/UserRepository';
import { UserService } from '../services/UserService';
import { PingService } from '../services/PingService';
import { SlackService } from '../services/SlackService';

let userRepositoryInstance: UserRepository;
let userServiceInstance: UserService;
let pingServiceInstance: PingService;
let slackServiceInstance: SlackService;
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

export function getSlackService(): SlackService {
  if (!slackServiceInstance) {
    slackServiceInstance = new SlackService();
  }
  return slackServiceInstance;
}

export function resetContainer() {
  userRepositoryInstance = undefined as any;
  userServiceInstance = undefined as any;
  pingServiceInstance = undefined as any;
  slackServiceInstance = undefined as any;
}

