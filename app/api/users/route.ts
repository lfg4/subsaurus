import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { GetSlackUsersService } from '@/src/modules/slack/application/GetSlackUsers.service';

export async function GET() {
  try {
    const getSlackUsersService = container.resolve<GetSlackUsersService>('GetSlackUsersService');
    const users = await getSlackUsersService.execute();
    const data = users.map(u => u.toPrimitives());
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching slack users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slack users' },
      { status: 500 }
    );
  }
}