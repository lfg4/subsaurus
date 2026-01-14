import { getPingService } from '@/src/container';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const service = getPingService();
    const response = await service.handlePing();
    return NextResponse.json(response);
  } catch (_error) {
    console.log(_error)
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

