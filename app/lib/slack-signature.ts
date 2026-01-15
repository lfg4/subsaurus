import { createHmac } from 'crypto';

export function verifySlackSignature(
  body: string,
  timestamp: string,
  signature: string,
  signingSecret: string
): boolean {
  const now = Math.floor(Date.now() / 1000);
  const requestTimestamp = parseInt(timestamp, 10);
  
  if (Math.abs(now - requestTimestamp) > 60 * 5) {
    return false;
  }

  const sigBasestring = `v0:${timestamp}:${body}`;
  
  const hmac = createHmac('sha256', signingSecret);
  hmac.update(sigBasestring);
  const calculatedSignature = `v0=${hmac.digest('hex')}`;

  return timingSafeEqual(
    Buffer.from(calculatedSignature),
    Buffer.from(signature)
  );
}

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}

