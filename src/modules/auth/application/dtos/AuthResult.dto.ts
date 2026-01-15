import type { UserDTO } from '../mappers/UserMapper';

export interface AuthResultDTO {
  success: boolean;
  sessionToken?: string;
  user?: UserDTO;
  error?: string;
  message?: string;
}

