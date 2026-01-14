import { schedules } from "@trigger.dev/sdk/v3";
import { getSlackUsersGetterService } from "@/src/container";

export const slackUsersGetter = schedules.task({
  id: "slack-users-getter",
  cron: "0 18 * * *",
  run: async () => {
    const workspaceId = "T03FUJM8E"
    console.log("🦖 Starting slack users getter job", {
      timestamp: new Date().toISOString(),
    });

    try {
      const service = getSlackUsersGetterService();
      
      const result = await service.run(workspaceId);
      
      console.log("✅ Slack users getter job completed successfully", {
        workspaceId: workspaceId,
        result: result,
      });
      
      return {
        success: true,
        workspaceId: workspaceId,
        result: result,
        timestamp: new Date().toISOString(),
      };
      
    } catch (error) {
      console.error("❌ Failed to get slack users", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      throw error;
    }
  },
});

