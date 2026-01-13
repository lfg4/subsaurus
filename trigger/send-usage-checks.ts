import { schedules } from "@trigger.dev/sdk/v3";
import { getSendUsageCheckService } from "@/src/container";

export const sendUsageChecks = schedules.task({
  id: "send-usage-checks",
  // Se ejecuta todos los días a las 10:00 AM
  cron: "0 10 * * *",
  run: async (payload) => {
    console.log("🦖 Starting usage check job", {
      timestamp: new Date().toISOString(),
    });

    try {
      // Obtener el servicio
      const service = getSendUsageCheckService();
      
      // Ejecutar el servicio
      const result = await service.run();
      
      console.log("✅ Usage checks sent successfully", {
        sent: result.sent,
        failed: result.failed,
      });
      
      return {
        success: true,
        sent: result.sent,
        failed: result.failed,
        timestamp: new Date().toISOString(),
      };
      
    } catch (error) {
      console.error("❌ Failed to send usage checks", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      throw error;
    }
  },
});

