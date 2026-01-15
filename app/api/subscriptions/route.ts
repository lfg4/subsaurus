import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { GetAllSubscriptionsService } from '@/src/modules/subscription/application/GetAllSubscriptions.service';
import type { CreateSubscriptionService } from '@/src/modules/subscription/application/CreateSubscription.service';
import type { RenewalCycle } from '@/src/types/enums';

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
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to load subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.renewalCycle || !body.renewalDate || !body.costAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: name, renewalCycle, renewalDate, costAmount' },
        { status: 400 }
      );
    }

    const createSubscriptionService = container.resolve<CreateSubscriptionService>(
      'CreateSubscriptionService'
    );

    if (!body.slackWorkspaceId) {
      return NextResponse.json(
        { error: 'Missing required field: slackWorkspaceId' },
        { status: 400 }
      );
    }

    if (!body.createdBySlackUserId) {
      return NextResponse.json(
        { error: 'Missing required field: createdBySlackUserId' },
        { status: 400 }
      );
    }

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
    });

    return NextResponse.json(
      { success: true, data: subscription.toPrimitives() },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create subscription';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
