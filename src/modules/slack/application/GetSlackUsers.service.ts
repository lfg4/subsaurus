import type { SlackUserRepository } from '../infrastructure/SlackUserRepository';
import type { SlackUser } from '../domain/SlackUser';

export class GetSlackUsersService {
  constructor(private slackUserRepository: SlackUserRepository) {}

  async execute(workspaceId: string): Promise<SlackUser[]> {
    return this.slackUserRepository.findByWorkspaceId(workspaceId);
  }
}