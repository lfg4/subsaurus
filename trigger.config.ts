import type { TriggerConfig } from "@trigger.dev/sdk/v3";

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
      {
        name: "prisma",
        onBuildComplete: async (context) => {
          // Generar el cliente de Prisma después del build
          await context.exec("npx", ["prisma", "generate"]);
        },
      },
    ],
  },
};

