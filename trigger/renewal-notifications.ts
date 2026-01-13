import { schedules } from "@trigger.dev/sdk/v3";
import { getRenewalNotificationService } from "@/src/container";

export const renewalNotifications = schedules.task({
  id: "renewal-notifications",
  cron: "0 18 * * *",
  run: async (payload) => {
    console.log("🦖 Starting renewal notifications job", {
      timestamp: new Date().toISOString(),
    });

    const adminSlackUserId = process.env.ADMIN_SLACK_USER_ID;

    if (!adminSlackUserId) {
      console.error("❌ ADMIN_SLACK_USER_ID environment variable is not set");
      throw new Error("ADMIN_SLACK_USER_ID is required");
    }

    try {
      const service = getRenewalNotificationService();
      
      const result = await service.run(adminSlackUserId);
      
      console.log("✅ Renewal notifications sent successfully", {
        notified: result.notified,
        updated: result.updated,
        failed: result.failed,
      });
      
      return {
        success: true,
        notified: result.notified,
        updated: result.updated,
        failed: result.failed,
        timestamp: new Date().toISOString(),
      };
      
    } catch (error) {
      console.error("❌ Failed to send renewal notifications", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      throw error;
    }
  },
});

