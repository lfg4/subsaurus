import type { UserDTO } from '../mappers/UserMapper';

export interface ValidateSessionResultDTO {
  valid: boolean;
  user?: UserDTO;
  error?: string;
}

