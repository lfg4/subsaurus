import { getSlackCommandHandler } from '@/src/shared/container';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { handleApiError } from '@/app/lib/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    let data: Record<string, unknown>;

    if (contentType?.includes('application/json')) {
      data = (await request.json()) as Record<string, unknown>;
    } else {
      const text = await request.text();
      const parsed = Object.fromEntries(new URLSearchParams(text));
      data = parsed as Record<string, unknown>;

      if (typeof data.payload === 'string') {
        data.payload = JSON.parse(data.payload) as Record<string, unknown>;
      }
    }

    if (data.type === 'url_verification' && data.challenge) {
      return NextResponse.json({ challenge: data.challenge });
    }

    const slackCommandHandler = getSlackCommandHandler();
    const response = await slackCommandHandler.handle(data);

    return response;
  } catch (error) {
    return handleApiError(error, 'Slack webhook', 'Error processing Slack webhook');
  }
}
