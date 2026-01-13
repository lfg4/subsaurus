import { UserRepository } from '../repositories/UserRepository';
import { SubscriptionRepository } from '../repositories/SubscriptionRepository';
import { UsageCheckRepository } from '../repositories/UsageCheckRepository';
import { UsageResponseRepository } from '../repositories/UsageResponseRepository';
import { UserService } from '../services/UserService';
import { PingService } from '../services/PingService';
import { SlackService } from '../services/SlackService';
import { CreateSubscriptionService } from '../services/CreateSubscriptionService';
import { SendUsageCheckService } from '../services/SendUsageCheckService';
import { ReSendUsageCheckService } from '../services/ReSendUsageCheckService';
import { RenewalNotificationService } from '../services/RenewalNotificationService';

let userRepositoryInstance: UserRepository;
let subscriptionRepositoryInstance: SubscriptionRepository;
let usageCheckRepositoryInstance: UsageCheckRepository;
let usageResponseRepositoryInstance: UsageResponseRepository;
let userServiceInstance: UserService;
let pingServiceInstance: PingService;
let slackServiceInstance: SlackService;
let createSubscriptionServiceInstance: CreateSubscriptionService;
let sendUsageCheckServiceInstance: SendUsageCheckService;
let reSendUsageCheckServiceInstance: ReSendUsageCheckService;
let renewalNotificationServiceInstance: RenewalNotificationService;
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

export function getUsageCheckRepository(): UsageCheckRepository {
  if (!usageCheckRepositoryInstance) {
    usageCheckRepositoryInstance = new UsageCheckRepository();
  }
  return usageCheckRepositoryInstance;
}

export function getUsageResponseRepository(): UsageResponseRepository {
  if (!usageResponseRepositoryInstance) {
    usageResponseRepositoryInstance = new UsageResponseRepository();
  }
  return usageResponseRepositoryInstance;
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

export function getCreateSubscriptionService(): CreateSubscriptionService {
  if (!createSubscriptionServiceInstance) {
    const subscriptionRepository = getSubscriptionRepository();
    const usageCheckRepository = getUsageCheckRepository();
    createSubscriptionServiceInstance = new CreateSubscriptionService(
      subscriptionRepository,
      usageCheckRepository
    );
  }
  return createSubscriptionServiceInstance;
}

export function getSlackService(): SlackService {
  if (!slackServiceInstance) {
    const createSubscriptionService = getCreateSubscriptionService();
    const usageResponseRepository = getUsageResponseRepository();
    slackServiceInstance = new SlackService(
      createSubscriptionService,
      usageResponseRepository
    );
  }
  return slackServiceInstance;
}

export function getSendUsageCheckService(): SendUsageCheckService {
  if (!sendUsageCheckServiceInstance) {
    const usageCheckRepository = getUsageCheckRepository();
    const subscriptionRepository = getSubscriptionRepository();
    const usageResponseRepository = getUsageResponseRepository();
    const slackService = getSlackService();
    sendUsageCheckServiceInstance = new SendUsageCheckService(
      usageCheckRepository,
      subscriptionRepository,
      usageResponseRepository,
      slackService
    );
  }
  return sendUsageCheckServiceInstance;
}

export function getReSendUsageCheckService(): ReSendUsageCheckService {
  if (!reSendUsageCheckServiceInstance) {
    const usageCheckRepository = getUsageCheckRepository();
    const subscriptionRepository = getSubscriptionRepository();
    const usageResponseRepository = getUsageResponseRepository();
    const slackService = getSlackService();
    reSendUsageCheckServiceInstance = new ReSendUsageCheckService(
      usageCheckRepository,
      subscriptionRepository,
      usageResponseRepository,
      slackService
    );
  }
  return reSendUsageCheckServiceInstance;
}

export function getRenewalNotificationService(): RenewalNotificationService {
  if (!renewalNotificationServiceInstance) {
    const subscriptionRepository = getSubscriptionRepository();
    const usageCheckRepository = getUsageCheckRepository();
    const usageResponseRepository = getUsageResponseRepository();
    const slackService = getSlackService();
    renewalNotificationServiceInstance = new RenewalNotificationService(
      subscriptionRepository,
      usageCheckRepository,
      usageResponseRepository,
      slackService
    );
  }
  return renewalNotificationServiceInstance;
}

export function resetContainer() {
  userRepositoryInstance = undefined as any;
  subscriptionRepositoryInstance = undefined as any;
  usageCheckRepositoryInstance = undefined as any;
  usageResponseRepositoryInstance = undefined as any;
  userServiceInstance = undefined as any;
  pingServiceInstance = undefined as any;
  slackServiceInstance = undefined as any;
  createSubscriptionServiceInstance = undefined as any;
  sendUsageCheckServiceInstance = undefined as any;
  reSendUsageCheckServiceInstance = undefined as any;
  renewalNotificationServiceInstance = undefined as any;
}

