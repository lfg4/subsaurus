import { logger } from '@/src/shared/infrastructure/Logger';

export class SlackClient {
  private slackToken: string;

  constructor() {
    this.slackToken = process.env.SLACK_BOT_TOKEN || '';
    if (!this.slackToken) {
      logger.error('SLACK_BOT_TOKEN not configured');
      throw new Error('Slack bot token not configured');
    }
  }
  
  async sendMessage(
    userId: string,
    message: string | { blocks: unknown[]; text?: string }
  ): Promise<void> {
    const body =
      typeof message === 'string'
        ? { channel: userId, text: message }
        : { channel: userId, blocks: message.blocks, text: message.text || 'Notification' };

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.slackToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!result.ok) {
      throw new Error(`Slack API error: ${result.error}`);
    }

    logger.debug('Message sent to user', { userId });
  }

  async openModal(triggerId: string, modalView: any): Promise<void> {
    const response = await fetch('https://slack.com/api/views.open', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.slackToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trigger_id: triggerId,
        view: modalView,
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      logger.error('Error opening modal', { error: result.error });
      throw new Error(`Failed to open modal: ${result.error}`);
    }
  }
}

