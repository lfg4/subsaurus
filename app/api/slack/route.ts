import { getSlackCommandHandler } from '@/src/shared/container';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { handleApiError } from '@/app/lib/api-error-handler';
import { verifySlackSignature } from '@/app/lib/slack-signature';
import { logger } from '@/src/shared/infrastructure/Logger';

export async function POST(request: NextRequest) {
  try {
    const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
    
    if (!slackSigningSecret) {
      logger.error('SLACK_SIGNING_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const timestamp = request.headers.get('x-slack-request-timestamp');
    const signature = request.headers.get('x-slack-signature');
    const body = await request.text();

    if (!timestamp || !signature) {
      logger.warn('Slack webhook missing signature headers');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isValid = verifySlackSignature(body, timestamp, signature, slackSigningSecret);
    
    if (!isValid) {
      logger.warn('Invalid Slack signature detected', {
        timestamp,
        hasSignature: !!signature,
      });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const contentType = request.headers.get('content-type');
    let data: Record<string, unknown>;

    if (contentType?.includes('application/json')) {
      data = JSON.parse(body) as Record<string, unknown>;
    } else {
      const parsed = Object.fromEntries(new URLSearchParams(body));
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
