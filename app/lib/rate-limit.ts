import { NextResponse } from 'next/server';


interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}


export async function rateLimit(
  request: Request,
  config: RateLimitConfig = { maxRequests: 10, windowSeconds: 60 }
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const key = `ratelimit:${ip}`;
  
  const now = Date.now();
  const entry = store.get(key);
  
  if (!entry || entry.resetAt < now) {
    store.set(key, {
      count: 1,
      resetAt: now + config.windowSeconds * 1000,
    });
    return null;
  }
  
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    
    return NextResponse.json(
      { 
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(entry.resetAt).toISOString(),
        },
      }
    );
  }
  
  entry.count++;
  store.set(key, entry);
  
  return null;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

export async function strictRateLimit(request: Request): Promise<NextResponse | null> {
  return rateLimit(request, { maxRequests: 5, windowSeconds: 60 });
}

export async function standardRateLimit(request: Request): Promise<NextResponse | null> {
  return rateLimit(request, { maxRequests: 30, windowSeconds: 60 });
}

