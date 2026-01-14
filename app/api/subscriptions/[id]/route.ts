import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import { GetSubscriptionsService } from '@/src/modules/subscription/application/GetSubscriptions.service';
import { UpdateSubscriptionService } from '@/src/modules/subscription/application/UpdateSubscription.service';
import { DeleteSubscriptionService } from '@/src/modules/subscription/application/DeleteSubscription.service';
import { RenewalCycle } from '@/src/types/enums';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const getSubscriptionsService = container.resolve<GetSubscriptionsService>(
      'GetSubscriptionsService'
    );

    const subscription = await getSubscriptionsService.findById(id);

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subscription.toPrimitives());
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updateSubscriptionService = container.resolve<UpdateSubscriptionService>(
      'UpdateSubscriptionService'
    );

    const subscription = await updateSubscriptionService.execute(id, {
      name: body.name,
      renewalCycle: body.renewalCycle as RenewalCycle,
      renewalDate: body.renewalDate ? new Date(body.renewalDate) : undefined,
      price: body.costAmount ? parseFloat(body.costAmount) : undefined,
      currency: body.costCurrency,
      projects: body.project ? [body.project] : undefined,
    });

    return NextResponse.json({ success: true, data: subscription.toPrimitives() });
  } catch (error) {
    console.error('Error updating subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update subscription';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const deleteSubscriptionService = container.resolve<DeleteSubscriptionService>(
      'DeleteSubscriptionService'
    );

    await deleteSubscriptionService.execute(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete subscription';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
