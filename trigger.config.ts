import type { TriggerConfig } from "@trigger.dev/sdk/v3";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";

export const config: TriggerConfig = {
  project: "proj_dajfencunzgvxfywqhrq",
  runtime: "node",
  logLevel: "info",
  maxDuration: 300, // 5 minutos (en segundos)
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  build: {
    extensions: [
      prismaExtension({
        schema: "prisma/schema.prisma",
        mode: "legacy",
      }),
    ],
  },
};

