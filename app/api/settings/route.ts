import { NextResponse } from 'next/server';
import { container } from '@/src/shared/container';
import type { SettingsRepository } from '@/src/shared/infrastructure/SettingsRepository';

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

    return NextResponse.json(settings || { daysBeforeRenewal: 7 });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, daysBeforeRenewal } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    if (!daysBeforeRenewal || daysBeforeRenewal < 1 || daysBeforeRenewal > 60) {
      return NextResponse.json(
        { error: 'Days before renewal must be between 1 and 60' },
        { status: 400 }
      );
    }

    const settingsRepository = container.resolve<SettingsRepository>('SettingsRepository');
    const settings = await settingsRepository.upsert(workspaceId, daysBeforeRenewal);

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

