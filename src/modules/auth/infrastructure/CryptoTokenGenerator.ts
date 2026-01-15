import { randomBytes } from 'crypto';
import type { TokenGenerator } from '../domain/services/TokenGenerator';
import { AUTH_CONSTANTS } from '../domain/constants/AuthConstants';


export class CryptoTokenGenerator implements TokenGenerator {
  generate(): string {
    return randomBytes(AUTH_CONSTANTS.SESSION_TOKEN_LENGTH_BYTES).toString('hex');
  }
}

