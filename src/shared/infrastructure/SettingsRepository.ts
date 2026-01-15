import { prisma } from '@/src/lib/prisma';
import { AppSettings } from '../domain/AppSettings';

export class SettingsRepository {
  async findByWorkspace(slackWorkspaceId: string): Promise<AppSettings | null> {
    const settings = await prisma.appSettings.findUnique({
      where: { slackWorkspaceId },
    });

    if (!settings) return null;

    return AppSettings.fromPrimitives(settings);
  }

  async upsert(slackWorkspaceId: string, daysBeforeRenewal: number): Promise<AppSettings> {
    const settings = await prisma.appSettings.upsert({
      where: { slackWorkspaceId },
      update: { daysBeforeRenewal },
      create: {
        slackWorkspaceId,
        daysBeforeRenewal,
        isActive: true,
      },
    });

    return AppSettings.fromPrimitives(settings);
  }

  async getDaysBeforeRenewal(slackWorkspaceId: string): Promise<number> {
    const settings = await this.findByWorkspace(slackWorkspaceId);
    return settings?.daysBeforeRenewal ?? 7; // Default to 7 days
  }

  async getAllWorkspaceIds(): Promise<string[]> {
    const settings = await prisma.appSettings.findMany({
      where: { isActive: true },
      select: { slackWorkspaceId: true },
    });
    return settings.map((s: { slackWorkspaceId: string }) => s.slackWorkspaceId);
  }
}

