import { UserRepository } from '../repositories/UserRepository';
import { SubscriptionRepository } from '../repositories/SubscriptionRepository';
import { UserService } from '../services/UserService';
import { PingService } from '../services/PingService';
import { SlackService } from '../services/SlackService';

let userRepositoryInstance: UserRepository;
let subscriptionRepositoryInstance: SubscriptionRepository;
let userServiceInstance: UserService;
let pingServiceInstance: PingService;
let slackServiceInstance: SlackService;
export function getUserRepository(): UserRepository {
  if (!userRepositoryInstance) {
    userRepositoryInstance = new UserRepository();
  }
  return userRepositoryInstance;
}

export function getSubscriptionRepository(): SubscriptionRepository {
  if (!subscriptionRepositoryInstance) {
    subscriptionRepositoryInstance = new SubscriptionRepository();
  }
  return subscriptionRepositoryInstance;
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
    const subscriptionRepository = getSubscriptionRepository();
    slackServiceInstance = new SlackService(subscriptionRepository);
  }
  return slackServiceInstance;
}

export function resetContainer() {
  userRepositoryInstance = undefined as any;
  subscriptionRepositoryInstance = undefined as any;
  userServiceInstance = undefined as any;
  pingServiceInstance = undefined as any;
  slackServiceInstance = undefined as any;
}

