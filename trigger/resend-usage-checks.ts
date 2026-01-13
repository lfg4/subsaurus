import { schedules } from "@trigger.dev/sdk/v3";
import { getReSendUsageCheckService } from "@/src/container";

export const reSendUsageChecks = schedules.task({
  id: "resend-usage-checks",
  // Se ejecuta todos los días a las 10:00 AM
  cron: "0 10 * * *",
  run: async (payload) => {
    console.log("🦖 Starting resend usage check job", {
      timestamp: new Date().toISOString(),
    });

    try {
      // Obtener el servicio
      const service = getReSendUsageCheckService();
      
      // Ejecutar el servicio
      const result = await service.run();
      
      console.log("✅ Usage checks resend successfully", {
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
      console.error("❌ Failed to resend usage checks", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      throw error;
    }
  },
});

