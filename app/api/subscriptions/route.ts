import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { GetAllSubscriptionsService } from '@/src/modules/subscription/application/GetAllSubscriptions.service';
import type { CreateSubscriptionService } from '@/src/modules/subscription/application/CreateSubscription.service';
import type { RenewalCycle } from '@/src/types/enums';
import { handleApiError, createValidationError } from '@/app/lib/api-error-handler';
import { standardRateLimit } from '@/app/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    const getAllSubscriptionsService = container.resolve<GetAllSubscriptionsService>(
      'GetAllSubscriptionsService'
    );

    const subscriptions = await getAllSubscriptionsService.execute(workspaceId || undefined);
    const data = subscriptions.map(sub => sub.toPrimitives());

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, 'fetch subscriptions', 'Failed to load subscriptions');
  }
}

export async function POST(request: Request) {
  const rateLimited = await standardRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();

    if (!body.name || !body.renewalCycle || !body.renewalDate || !body.costAmount) {
      return createValidationError('Missing required fields: name, renewalCycle, renewalDate, costAmount');
    }

    if (!body.slackWorkspaceId) {
      return createValidationError('Missing required field: slackWorkspaceId');
    }

    if (!body.createdBySlackUserId) {
      return createValidationError('Missing required field: createdBySlackUserId');
    }

    const createSubscriptionService = container.resolve<CreateSubscriptionService>(
      'CreateSubscriptionService'
    );

    const subscription = await createSubscriptionService.execute({
      slackWorkspaceId: body.slackWorkspaceId,
      createdBySlackUserId: body.createdBySlackUserId,
      name: body.name,
      price: parseFloat(body.costAmount),
      currency: body.costCurrency || 'EUR',
      renewalCycle: body.renewalCycle as RenewalCycle,
      renewalDate: body.renewalDate,
      slackUserIds: body.slackUserIds || [],
      projects: body.project ? [body.project] : [],
      notes: body.notes,
    });

    return NextResponse.json(
      { success: true, data: subscription.toPrimitives() },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'create subscription', error instanceof Error ? error.message : 'Failed to create subscription');
  }
}
