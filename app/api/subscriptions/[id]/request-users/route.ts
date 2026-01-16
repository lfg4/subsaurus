import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import { GetSubscriptionByIdService } from '@/src/modules/subscription/application/GetSubscriptionById.service';
import { GetSlackUsersService } from '@/src/modules/slack/application/GetSlackUsers.service';
import { SlackClient } from '@/src/modules/slack/infrastructure/SlackClient';
import { SlackMessageBuilder } from '@/src/modules/slack/infrastructure/SlackMessageBuilder';
import { handleApiError, createValidationError, createNotFoundError } from '@/app/lib/api-error-handler';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (Number.isNaN(id)) {
      return createValidationError('Invalid ID');
    }

    const getSubscriptionByIdService = container.resolve<GetSubscriptionByIdService>(
      'GetSubscriptionByIdService'
    );

    const subscription = await getSubscriptionByIdService.execute(id);

    if (!subscription) {
      return createNotFoundError('Subscription');
    }

    const getSlackUsersService = container.resolve<GetSlackUsersService>(
      'GetSlackUsersService'
    );
    const allUsers = await getSlackUsersService.execute(subscription.slackWorkspaceId);

    const slackClient = container.resolve<SlackClient>('SlackClient');
    const slackMessageBuilder = container.resolve<SlackMessageBuilder>('SlackMessageBuilder');

    const message = slackMessageBuilder.buildUserAssignmentRequestMessage(
      subscription.id,
      subscription.name
    );

    const sendPromises = allUsers.map(user => {
      if (user.isActive) {
        return slackClient.sendMessage(user.slackUserId, message);
      }
      return Promise.resolve();
    });

    await Promise.all(sendPromises);

    const sentCount = allUsers.filter(u => u.isActive).length;

    return NextResponse.json({ 
      success: true, 
      message: `Message sent to ${sentCount} users`,
      sentCount
    });
  } catch (error) {
    return handleApiError(error, 'request users for subscription', 'Failed to send user assignment request');
  }
}

