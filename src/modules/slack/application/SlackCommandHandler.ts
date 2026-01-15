import { NextResponse } from 'next/server';
import type { SlackClient } from '../infrastructure/SlackClient';
import type { SlackMessageBuilder } from '../infrastructure/SlackMessageBuilder';
import type { CreateSubscriptionService } from '@/src/modules/subscription/application/CreateSubscription.service';
import type { RecordUsageResponseService } from '@/src/modules/usage-tracking/application/RecordUsageResponse.service';
import { UsageResponseType, RenewalCycle } from '@/src/types/enums';
import type { SlackSubscriptionData } from '@/src/types/slack';
import { logger } from '@/src/shared/infrastructure/Logger';

enum SlackCommands {
  HELP = 'help',
  CREATE = 'create',
}


export class SlackCommandHandler {
  constructor(
    private readonly slackClient: SlackClient,
    private readonly slackMessageBuilder: SlackMessageBuilder,
    private readonly createSubscriptionService: CreateSubscriptionService,
    private readonly recordUsageResponseService: RecordUsageResponseService
  ) {}

  
  async handle(data: Record<string, unknown>): Promise<NextResponse> {
    if (data.payload && typeof data.payload === 'object') {
      return this.handleInteraction(data.payload as Record<string, unknown>);
    }

    return this.handleCommand(data);
  }

  private async handleCommand(data: Record<string, unknown>): Promise<NextResponse> {
    const text = (data.text as string) || '';
    const command = text.split(' ')[0];

    switch (command) {
      case SlackCommands.HELP:
        return this.respondWithBlocks(this.slackMessageBuilder.buildHelpMessage());

      case SlackCommands.CREATE:
        await this.slackClient.openModal(
          data.trigger_id as string,
          this.slackMessageBuilder.buildCreateSubscriptionModal()
        );
        return new NextResponse('', { status: 200 });

      default:
        return this.respondWithBlocks(
          this.slackMessageBuilder.buildErrorMessage('Command not found')
        );
    }
  }

  private async handleInteraction(
    payload: Record<string, unknown>
  ): Promise<NextResponse> {
    const type = payload.type as string;

    if (type === 'view_submission') {
      return this.handleModalSubmission(payload);
    }

    if (type === 'block_actions') {
      return this.handleBlockActions(payload);
    }

    return NextResponse.json({ response_action: 'clear' });
  }

  private async handleBlockActions(
    payload: Record<string, unknown>
  ): Promise<NextResponse> {
    try {
      const actions = (payload.actions as any[])?.[0];
      if (!actions) {
        return NextResponse.json({ ok: true });
      }

      const actionId = actions.action_id as string;
      const value = actions.value as string;
      const userId = (payload.user as any)?.id;

      if (actionId?.startsWith('usage_response_')) {
        return this.handleUsageResponse(value, userId);
      }

      return NextResponse.json({ ok: true });
    } catch (error) {
      logger.error('Error handling block actions', {
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json({ ok: true });
    }
  }

 
  private async handleUsageResponse(
    value: string,
    userId: string
  ): Promise<NextResponse> {
    try {
      const [usageCheckIdStr, response] = value.split('|');
      const usageCheckId = parseInt(usageCheckIdStr, 10);

      if (!usageCheckId || !response) {
        throw new Error('Invalid button value format');
      }

      await this.recordUsageResponseService.execute(
        usageCheckId,
        userId,
        response as UsageResponseType
      );

      const confirmationMessage = this.slackMessageBuilder.buildResponseConfirmation(
        response as UsageResponseType
      );
      await this.slackClient.sendMessage(userId, confirmationMessage);

      return NextResponse.json({ response_action: 'clear' });
    } catch (error) {
      logger.error('Error handling usage response', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json({
        replace_original: true,
        text: '❌ There was an error processing your response.',
      });
    }
  }

  private async handleModalSubmission(
    payload: Record<string, unknown>
  ): Promise<NextResponse> {
    try {
      const view = payload.view as any;
      const values = view?.state?.values;

      if (!values) {
        return NextResponse.json({
          response_action: 'errors',
          errors: { name_block: 'Invalid form submission' },
        });
      }

      const validationResult = this.validateAndExtractFormData(values);

      if ('errors' in validationResult) {
        return NextResponse.json({
          response_action: 'errors',
          errors: validationResult.errors,
        });
      }

      const subscription = validationResult.data;
      const workspaceId = (payload.team as any)?.id || 'unknown';
      const userId = (payload.user as any)?.id || 'unknown';

      await this.createSubscriptionService.execute({
        slackWorkspaceId: workspaceId,
        createdBySlackUserId: userId,
        name: subscription.name,
        price: subscription.price,
        currency: subscription.currency,
        renewalCycle: subscription.renewalCycle,
        renewalDate: subscription.renewalDate,
        slackUserIds: subscription.users,
        projects: subscription.projects,
      });

      return NextResponse.json({
        response_action: 'update',
        view: this.slackMessageBuilder.buildSuccessModal(subscription),
      });
    } catch (error) {
      logger.error('Error in handleModalSubmission', {
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json({
        response_action: 'errors',
        errors: {
          name_block: 'An error occurred. Please try again.',
        },
      });
    }
  }

  private validateAndExtractFormData(values: Record<string, any>) {
    const nameValue = values.name_block?.name_input;
    const priceValue = values.price_block?.price_input;
    const currencyValue = values.currency_block?.currency_select;
    const renewalCycleValue = values.renewal_cycle_block?.renewal_cycle_select;
    const dateValue = values.date_block?.date_input;
    const usersValue = values.users_block?.users_select;
    const projectsValue = values.projects_block?.projects_select;

    if (!nameValue?.value) {
      return { errors: { name_block: 'Name is required' } };
    }

    if (!priceValue?.value) {
      return { errors: { price_block: 'Price is required' } };
    }

    const price = parseFloat(priceValue.value);
    if (Number.isNaN(price) || price <= 0) {
      return {
        errors: { price_block: 'Price must be a valid number greater than 0' },
      };
    }

    if (!currencyValue?.selected_option?.value) {
      return { errors: { currency_block: 'Currency is required' } };
    }

    if (!renewalCycleValue?.selected_option?.value) {
      return { errors: { renewal_cycle_block: 'Renewal period is required' } };
    }

    if (!dateValue?.selected_date) {
      return { errors: { date_block: 'Date is required' } };
    }

    const users = usersValue?.selected_users || [];
    const projects = projectsValue?.selected_options?.map((o: any) => o.value) || [];

    return {
      data: {
        name: nameValue.value,
        price: price,
        currency: currencyValue.selected_option.value,
        renewalCycle: renewalCycleValue.selected_option.value as RenewalCycle,
        renewalDate: dateValue.selected_date,
        users: users,
        projects: projects,
      } as SlackSubscriptionData,
    };
  }

  private respondWithBlocks(blocks: any): NextResponse {
    return NextResponse.json({
      response_type: 'ephemeral',
      ...blocks,
    });
  }
}

