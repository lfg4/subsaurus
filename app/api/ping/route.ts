import { PingService } from '@/src/services/PingService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const service = new PingService();
    const response = service.handlePing();
    return NextResponse.json(response);
  } catch (_error) {
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

