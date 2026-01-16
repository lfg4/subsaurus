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

  async upsert(slackWorkspaceId: string, daysBeforeRenewal: number, preferredCurrency?: string): Promise<AppSettings> {
  const updateData: { daysBeforeRenewal: number; preferredCurrency?: string } = {
    daysBeforeRenewal
  };

  if (preferredCurrency) {
    updateData.preferredCurrency = preferredCurrency; // 👈 AÑADIR
  }

  const settings = await prisma.appSettings.upsert({
    where: { slackWorkspaceId },
    update: updateData, // 👈 CAMBIAR de { daysBeforeRenewal } a updateData
    create: {
      slackWorkspaceId,
      daysBeforeRenewal,
      preferredCurrency: preferredCurrency || 'EUR', // 👈 AÑADIR
      isActive: true,
    },
  });

  return AppSettings.fromPrimitives(settings);
}

  async getDaysBeforeRenewal(slackWorkspaceId: string): Promise<number> {
    const settings = await this.findByWorkspace(slackWorkspaceId);
    return settings?.daysBeforeRenewal ?? 7; // Default to 7 days
  }

  async getPreferredCurrency(slackWorkspaceId: string): Promise<string> {
    const settings = await this.findByWorkspace(slackWorkspaceId);
    return settings?.preferredCurrency ?? 'EUR';
  }

  async getAllWorkspaceIds(): Promise<string[]> {
    const settings = await prisma.appSettings.findMany({
      where: { isActive: true },
      select: { slackWorkspaceId: true },
    });
    return settings.map((s: { slackWorkspaceId: string }) => s.slackWorkspaceId);
  }
}

