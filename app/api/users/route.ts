import { container } from '@/src/shared/container';
import type { GetSlackUsersService } from '@/src/modules/slack/application/GetSlackUsers.service';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { handleApiError, createValidationError } from '@/app/lib/api-error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return createValidationError('workspaceId is required');
    }

    const getSlackUsersService = container.resolve<GetSlackUsersService>('GetSlackUsersService');
    const users = await getSlackUsersService.execute(workspaceId);
    const data = users.map(u => u.toPrimitives());
    
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, 'fetch users', 'Failed to fetch slack users');
  }
}


export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return createValidationError('Email is required');
    }

    const user = await prisma.user.create({
      data: { email, name }
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'create user', 'Failed to create user');
  }
}
