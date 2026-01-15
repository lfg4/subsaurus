
import { SubscriptionRepository } from '@/src/modules/subscription/infrastructure/SubscriptionRepository';
import { UsageCheckRepository } from '@/src/modules/usage-tracking/infrastructure/UsageCheckRepository';
import { UsageResponseRepository } from '@/src/modules/usage-tracking/infrastructure/UsageResponseRepository';


import { CreateSubscriptionService } from '@/src/modules/subscription/application/CreateSubscription.service';
import { RenewSubscriptionService } from '@/src/modules/subscription/application/RenewSubscription.service';
import { GetAllSubscriptionsService } from '@/src/modules/subscription/application/GetAllSubscriptions.service';
import { GetSubscriptionByIdService } from '@/src/modules/subscription/application/GetSubscriptionById.service';
import { UpdateSubscriptionService } from '@/src/modules/subscription/application/UpdateSubscription.service';
import { DeleteSubscriptionService } from '@/src/modules/subscription/application/DeleteSubscription.service';
import { ImportSubscriptionsService } from '@/src/modules/import/application/ImportSubscriptions.service';


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

/**
 * Simple Dependency Injection Container
 * Manages singletons for the application
 */
class Container {
  private instances = new Map<string, any>();

  /**
   * Register a factory function
   */
  register<T>(key: string, factory: () => T): void {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory);
    }
  }

  /**
   * Resolve and get instance (singleton)
   */
  resolve<T>(key: string): T {
    const factory = this.instances.get(key);
    if (!factory) {
      throw new Error(`Service "${key}" not registered in container`);
    }

    
    const instanceKey = `_instance_${key}`;
    if (!this.instances.has(instanceKey)) {
      
      this.instances.set(instanceKey, factory());
    }

    return this.instances.get(instanceKey);
  }

  /**
   * Clear all instances (useful for testing)
   */
  clear(): void {
    
    const keysToDelete: string[] = [];
    for (const key of this.instances.keys()) {
      if (key.startsWith('_instance_')) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      this.instances.delete(key);
    }
  }
}


const container = new Container();


container.register('SubscriptionRepository', () => new SubscriptionRepository());
container.register('UsageCheckRepository', () => new UsageCheckRepository());
container.register('UsageResponseRepository', () => new UsageResponseRepository());


container.register('SlackClient', () => new SlackClient());
container.register('SlackMessageBuilder', () => new SlackMessageBuilder());
container.register('SlackUserRepository', () => new SlackUserRepository());


container.register(
  'CreateSubscriptionService',
  () =>
    new CreateSubscriptionService(
      container.resolve('SubscriptionRepository'),
      container.resolve('UsageCheckRepository')
    )
);

container.register(
  'RenewSubscriptionService',
  () =>
    new RenewSubscriptionService(
      container.resolve('SubscriptionRepository'),
      container.resolve('UsageCheckRepository')
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
    container.resolve('SlackClient'),
    container.resolve('SlackUserRepository')
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

