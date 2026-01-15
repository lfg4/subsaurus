import { prisma } from '@/src/lib/prisma';

export interface AppSettingsPrimitives {
  id: number;
  slackWorkspaceId: string;
  daysBeforeRenewal: number;
  isActive: boolean;
  updatedAt: Date;
}

export class SettingsRepository {
  async findByWorkspace(slackWorkspaceId: string): Promise<AppSettingsPrimitives | null> {
    const settings = await prisma.appSettings.findUnique({
      where: { slackWorkspaceId },
    });

    return settings;
  }

  async upsert(slackWorkspaceId: string, daysBeforeRenewal: number): Promise<AppSettingsPrimitives> {
    const settings = await prisma.appSettings.upsert({
      where: { slackWorkspaceId },
      update: { daysBeforeRenewal },
      create: {
        slackWorkspaceId,
        daysBeforeRenewal,
        isActive: true,
      },
    });

    return settings;
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

