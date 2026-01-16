
import { SubscriptionRepository } from '@/src/modules/subscription/infrastructure/SubscriptionRepository';
import { UsageCheckRepository } from '@/src/modules/usage-tracking/infrastructure/UsageCheckRepository';
import { UsageResponseRepository } from '@/src/modules/usage-tracking/infrastructure/UsageResponseRepository';
import { SettingsRepository } from '@/src/shared/infrastructure/SettingsRepository';
import { SessionRepository } from '@/src/modules/auth/infrastructure/SessionRepository';


import { CreateSubscriptionService } from '@/src/modules/subscription/application/CreateSubscription.service';
import { RenewSubscriptionService } from '@/src/modules/subscription/application/RenewSubscription.service';
import { GetAllSubscriptionsService } from '@/src/modules/subscription/application/GetAllSubscriptions.service';
import { GetSubscriptionByIdService } from '@/src/modules/subscription/application/GetSubscriptionById.service';
import { UpdateSubscriptionService } from '@/src/modules/subscription/application/UpdateSubscription.service';
import { DeleteSubscriptionService } from '@/src/modules/subscription/application/DeleteSubscription.service';
import { ImportSubscriptionsService } from '@/src/modules/import/application/ImportSubscriptions.service';
import { DetectSubscriptionsService } from '@/src/modules/import/application/DetectSubscriptions.service';


import { SendUsageCheckService } from '@/src/modules/usage-tracking/application/SendUsageCheck.service';
import { RecordUsageResponseService } from '@/src/modules/usage-tracking/application/RecordUsageResponse.service';
import { ReSendUsageCheckService } from '@/src/modules/usage-tracking/application/ReSendUsageCheck.service';
import { SendRenewalNotificationService } from '@/src/modules/usage-tracking/application/SendRenewalNotification.service';
import { GetUsageCheckByIdService } from '@/src/modules/usage-tracking/application/GetUsageCheckById.service';
import { GetEnrichedUsageChecksService } from '@/src/modules/usage-tracking/application/GetEnrichedUsageChecks.service';
import { GetUsageResponsesByCheckService } from '@/src/modules/usage-tracking/application/GetUsageResponsesByCheck.service';


import { SlackClient } from '@/src/modules/slack/infrastructure/SlackClient';
import { SlackMessageBuilder } from '@/src/modules/slack/infrastructure/SlackMessageBuilder';
import { SlackUserRepository } from '@/src/modules/slack/infrastructure/SlackUserRepository';
import { SlackCommandHandler } from '@/src/modules/slack/application/SlackCommandHandler';
import { SyncSlackUsersService } from '@/src/modules/slack/application/SyncSlackUsers.service';
import { GetSlackUsersService } from '@/src/modules/slack/application/GetSlackUsers.service';

import { SlackOAuthClient } from '@/src/modules/auth/infrastructure/SlackOAuthClient';
import { CryptoTokenGenerator } from '@/src/modules/auth/infrastructure/CryptoTokenGenerator';
import { AuthenticateUserService } from '@/src/modules/auth/application/AuthenticateUser.service';
import { ValidateSessionService } from '@/src/modules/auth/application/ValidateSession.service';
import { ProcessRenewalNotificationsService } from '@/src/modules/subscription/application/ProcessRenewalNotifications.service';

import { GetDashboardStatsService } from '@/src/modules/analytics/application/GetDashboardStats.service';

type Factory<T = unknown> = () => T;

/**
 * Simple Dependency Injection Container
 * Manages singletons for the application
 */
class Container {
  private factories = new Map<string, Factory>();
  private instances = new Map<string, unknown>();

  /**
   * Register a factory function
   */
  register<T>(key: string, factory: Factory<T>): void {
    if (!this.factories.has(key)) {
      this.factories.set(key, factory as Factory);
    }
  }

  /**
   * Resolve and get instance (singleton)
   */
  resolve<T>(key: string): T {
    // Return existing instance if already created
    if (this.instances.has(key)) {
      return this.instances.get(key) as T;
    }

    // Get factory
    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`Service "${key}" not registered in container`);
    }

    // Create and cache instance
    const instance = factory();
    this.instances.set(key, instance);

    return instance as T;
  }

  /**
   * Clear all instances (useful for testing)
   */
  clear(): void {
    this.instances.clear();
  }
}


const container = new Container();


container.register('SubscriptionRepository', () => new SubscriptionRepository());
container.register('UsageCheckRepository', () => new UsageCheckRepository());
container.register('UsageResponseRepository', () => new UsageResponseRepository());
container.register('SettingsRepository', () => new SettingsRepository());
container.register('SessionRepository', () => new SessionRepository());


container.register('SlackClient', () => new SlackClient());
container.register('SlackMessageBuilder', () => new SlackMessageBuilder());
container.register('SlackUserRepository', () => new SlackUserRepository());
container.register('SlackOAuthClient', () => SlackOAuthClient.fromEnvironment());
container.register('TokenGenerator', () => new CryptoTokenGenerator());


container.register(
  'CreateSubscriptionService',
  () =>
    new CreateSubscriptionService(
      container.resolve('SubscriptionRepository'),
      container.resolve('UsageCheckRepository'),
      container.resolve('SettingsRepository')
    )
);

container.register(
  'RenewSubscriptionService',
  () =>
    new RenewSubscriptionService(
      container.resolve('SubscriptionRepository'),
      container.resolve('UsageCheckRepository'),
      container.resolve('SettingsRepository')
    )
);

container.register(
  'GetAllSubscriptionsService',
  () => new GetAllSubscriptionsService(container.resolve('SubscriptionRepository'))
);

container.register(
  'GetSubscriptionByIdService',
  () => new GetSubscriptionByIdService(container.resolve('SubscriptionRepository'))
);

container.register(
  'UpdateSubscriptionService',
  () => new UpdateSubscriptionService(container.resolve('SubscriptionRepository'))
);

container.register(
  'DeleteSubscriptionService',
  () => new DeleteSubscriptionService(container.resolve('SubscriptionRepository'))
);

container.register(
  'ImportSubscriptionsService',
  () => new ImportSubscriptionsService(container.resolve('SubscriptionRepository'))
);

container.register(
  'DetectSubscriptionsService',
  () => new DetectSubscriptionsService()
);


container.register(
  'GetUsageCheckByIdService',
  () => new GetUsageCheckByIdService(container.resolve('UsageCheckRepository'))
);

container.register(
  'GetEnrichedUsageChecksService',
  () => new GetEnrichedUsageChecksService(
    container.resolve('UsageCheckRepository'),
    container.resolve('SubscriptionRepository'),
    container.resolve('UsageResponseRepository')
  )
);

container.register(
  'GetUsageResponsesByCheckService',
  () => new GetUsageResponsesByCheckService(container.resolve('UsageResponseRepository'))
);

container.register(
  'SendUsageCheckService',
  () =>
    new SendUsageCheckService(
      container.resolve('UsageCheckRepository'),
      container.resolve('SubscriptionRepository'),
      container.resolve('UsageResponseRepository'),
      container.resolve('SlackClient'),
      container.resolve('SlackMessageBuilder')
    )
);

container.register(
  'RecordUsageResponseService',
  () =>
    new RecordUsageResponseService(container.resolve('UsageResponseRepository'))
);

container.register(
  'ReSendUsageCheckService',
  () =>
    new ReSendUsageCheckService(
      container.resolve('UsageCheckRepository'),
      container.resolve('SubscriptionRepository'),
      container.resolve('UsageResponseRepository'),
      container.resolve('SlackClient'),
      container.resolve('SlackMessageBuilder')
    )
);

container.register(
  'SendRenewalNotificationService',
  () =>
    new SendRenewalNotificationService(
      container.resolve('SubscriptionRepository'),
      container.resolve('UsageCheckRepository'),
      container.resolve('UsageResponseRepository'),
      container.resolve('RenewSubscriptionService'),
      container.resolve('SlackClient'),
      container.resolve('SlackMessageBuilder')
    )
);


container.register(
  'SlackCommandHandler',
  () =>
    new SlackCommandHandler(
      container.resolve('SlackClient'),
      container.resolve('SlackMessageBuilder'),
      container.resolve('CreateSubscriptionService'),
      container.resolve('UpdateSubscriptionService'),
      container.resolve('GetSubscriptionByIdService'),
      container.resolve('RecordUsageResponseService')
    )
);


container.register<GetSlackUsersService>('GetSlackUsersService', () => {
  const repository = container.resolve<SlackUserRepository>('SlackUserRepository');
  return new GetSlackUsersService(repository);
});

container.register(
  'SyncSlackUsersService',
  () => new SyncSlackUsersService(
    container.resolve('SlackUserRepository')
  )
);


container.register(
  'AuthenticateUserService',
  () =>
    new AuthenticateUserService(
      container.resolve('SessionRepository'),
      container.resolve('SlackUserRepository'),
      container.resolve('SettingsRepository'),
      container.resolve('SlackOAuthClient'),
      container.resolve('TokenGenerator')
    )
);

container.register(
  'ValidateSessionService',
  () =>
    new ValidateSessionService(
      container.resolve('SessionRepository'),
      container.resolve('SlackUserRepository')
    )
);

container.register(
  'ProcessRenewalNotificationsService',
  () =>
    new ProcessRenewalNotificationsService(
      container.resolve('SettingsRepository'),
      container.resolve('SlackUserRepository'),
      container.resolve('SendRenewalNotificationService')
    )
);

container.register(
  'GetDashboardStatsService',
  () =>
    new GetDashboardStatsService(
      container.resolve('SubscriptionRepository'),
      container.resolve('UsageCheckRepository'),
      container.resolve('UsageResponseRepository')
    )
);

export { container };


export const getSubscriptionRepository = () =>
  container.resolve<SubscriptionRepository>('SubscriptionRepository');
export const getUsageCheckRepository = () =>
  container.resolve<UsageCheckRepository>('UsageCheckRepository');
export const getUsageResponseRepository = () =>
  container.resolve<UsageResponseRepository>('UsageResponseRepository');

export const getCreateSubscriptionService = () =>
  container.resolve<CreateSubscriptionService>('CreateSubscriptionService');
export const getRenewSubscriptionService = () =>
  container.resolve<RenewSubscriptionService>('RenewSubscriptionService');
export const getGetAllSubscriptionsService = () =>
  container.resolve<GetAllSubscriptionsService>('GetAllSubscriptionsService');
export const getGetSubscriptionByIdService = () =>
  container.resolve<GetSubscriptionByIdService>('GetSubscriptionByIdService');
export const getUpdateSubscriptionService = () =>
  container.resolve<UpdateSubscriptionService>('UpdateSubscriptionService');
export const getDeleteSubscriptionService = () =>
  container.resolve<DeleteSubscriptionService>('DeleteSubscriptionService');

export const getImportSubscriptionsService = () =>
  container.resolve<ImportSubscriptionsService>('ImportSubscriptionsService');
export const getDetectSubscriptionsService = () =>
  container.resolve<DetectSubscriptionsService>('DetectSubscriptionsService');

export const getGetUsageCheckByIdService = () =>
  container.resolve<GetUsageCheckByIdService>('GetUsageCheckByIdService');
export const getGetEnrichedUsageChecksService = () =>
  container.resolve<GetEnrichedUsageChecksService>('GetEnrichedUsageChecksService');
export const getGetUsageResponsesByCheckService = () =>
  container.resolve<GetUsageResponsesByCheckService>('GetUsageResponsesByCheckService');
export const getSendUsageCheckService = () =>
  container.resolve<SendUsageCheckService>('SendUsageCheckService');
export const getRecordUsageResponseService = () =>
  container.resolve<RecordUsageResponseService>('RecordUsageResponseService');
export const getReSendUsageCheckService = () =>
  container.resolve<ReSendUsageCheckService>('ReSendUsageCheckService');
export const getSendRenewalNotificationService = () =>
  container.resolve<SendRenewalNotificationService>('SendRenewalNotificationService');

export const getSlackClient = () => container.resolve<SlackClient>('SlackClient');
export const getSlackMessageBuilder = () =>
  container.resolve<SlackMessageBuilder>('SlackMessageBuilder');
export const getSlackCommandHandler = () =>
  container.resolve<SlackCommandHandler>('SlackCommandHandler');
export const getSyncSlackUsersService = () =>
  container.resolve<SyncSlackUsersService>('SyncSlackUsersService');

export const getSettingsRepository = () =>
  container.resolve<SettingsRepository>('SettingsRepository');
export const getSlackUserRepository = () =>
  container.resolve<SlackUserRepository>('SlackUserRepository');
export const getProcessRenewalNotificationsService = () =>
  container.resolve<ProcessRenewalNotificationsService>('ProcessRenewalNotificationsService');

