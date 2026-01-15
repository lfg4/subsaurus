import { NextResponse } from 'next/server';
import { logger } from '@/src/shared/infrastructure/Logger';

export function handleApiError(
  error: unknown,
  context: string,
  defaultMessage: string = 'An error occurred'
): NextResponse {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  logger.error(`API error in ${context}`, {
    error: errorMessage,
    context,
  });

  return NextResponse.json(
    { error: defaultMessage },
    { status: 500 }
  );
}

export function createValidationError(message: string): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  );
}

export function createNotFoundError(resource: string): NextResponse {
  return NextResponse.json(
    { error: `${resource} not found` },
    { status: 404 }
  );
}

export function createUnauthorizedError(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

