export const isDevelopmentMode = 
  process.env.NODE_ENV === 'development' && 
  (process.env.SKIP_AUTH === 'true' || process.env.NEXT_PUBLIC_SKIP_AUTH === 'true');

export const mockDevUser = {
  id: 'U091BTTVCQ6',
  slackUserId: 'U091BTTVCQ6',
  slackWorkspaceId: 'T03FUJM8E',
  displayName: 'Dev User',
  realName: 'Dev User',
  email: 'dev@example.com',
  role: 'admin',
  avatarUrl: ''
};
