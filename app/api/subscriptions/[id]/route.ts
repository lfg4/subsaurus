import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import { GetSubscriptionByIdService } from '@/src/modules/subscription/application/GetSubscriptionById.service';
import { UpdateSubscriptionService } from '@/src/modules/subscription/application/UpdateSubscription.service';
import { DeleteSubscriptionService } from '@/src/modules/subscription/application/DeleteSubscription.service';
import { RenewalCycle } from '@/src/types/enums';
import { handleApiError, createValidationError, createNotFoundError } from '@/app/lib/api-error-handler';

export async function GET(
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

    return NextResponse.json(subscription.toPrimitives());
  } catch (error) {
    return handleApiError(error, 'fetch subscription', 'Failed to fetch subscription');
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
      return createValidationError('Invalid ID');
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
      slackUserIds: body.slackUserIds,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: subscription.toPrimitives() });
  } catch (error) {
    return handleApiError(error, 'update subscription', error instanceof Error ? error.message : 'Failed to update subscription');
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
      return createValidationError('Invalid ID');
    }

    const deleteSubscriptionService = container.resolve<DeleteSubscriptionService>(
      'DeleteSubscriptionService'
    );

    await deleteSubscriptionService.execute(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, 'delete subscription', error instanceof Error ? error.message : 'Failed to delete subscription');
  }
}
