import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { SettingsRepository } from '@/src/shared/infrastructure/SettingsRepository';
import { handleApiError, createValidationError } from '@/app/lib/api-error-handler';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    const settingsRepository = container.resolve<SettingsRepository>('SettingsRepository');
    const settings = await settingsRepository.findByWorkspace(workspaceId);

    return NextResponse.json(settings || { daysBeforeRenewal: 7, preferredCurrency: 'EUR' });
  } catch (error) {
    return handleApiError(error, 'fetch settings', 'Failed to fetch settings');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, daysBeforeRenewal, preferredCurrency } = body;

    if (!workspaceId) {
      return createValidationError('Workspace ID is required');
    }

    if (!daysBeforeRenewal || daysBeforeRenewal < 1 || daysBeforeRenewal > 60) {
      return createValidationError('Days before renewal must be between 1 and 60');
    }

    if (preferredCurrency && !['EUR', 'USD', 'GBP'].includes(preferredCurrency)) {
      return createValidationError('Currency must be EUR, USD, or GBP');
    }

    const settingsRepository = container.resolve<SettingsRepository>('SettingsRepository');
    const settings = await settingsRepository.upsert(workspaceId, daysBeforeRenewal, preferredCurrency);

    return NextResponse.json(settings);
  } catch (error) {
    return handleApiError(error, 'save settings', 'Failed to save settings');
  }
}

