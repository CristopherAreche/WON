// Simple in-memory rate limiter
// In production, you should use Redis or a similar persistent store

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __wonRateLimitStore: Map<string, RateLimitEntry> | undefined;
  // eslint-disable-next-line no-var
  var __wonRateLimitCleanupTimer: ReturnType<typeof setInterval> | undefined;
}

const globalStore = globalThis as typeof globalThis & {
  __wonRateLimitStore?: Map<string, RateLimitEntry>;
  __wonRateLimitCleanupTimer?: ReturnType<typeof setInterval>;
};

const rateLimitStore =
  globalStore.__wonRateLimitStore ?? new Map<string, RateLimitEntry>();

if (!globalStore.__wonRateLimitStore) {
  globalStore.__wonRateLimitStore = rateLimitStore;
}

if (!globalStore.__wonRateLimitCleanupTimer) {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  // Do not keep Node alive only because of this interval.
  if ("unref" in cleanupTimer && typeof cleanupTimer.unref === "function") {
    cleanupTimer.unref();
  }
  globalStore.__wonRateLimitCleanupTimer = cleanupTimer;
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();

  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetTime <= now) {
    // No entry or expired entry - create new one
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

// Specific rate limiters for password reset
export function rateLimitByEmail(email: string): RateLimitResult {
  return rateLimit(`email:${email}`, {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: parseInt(
      process.env.RESET_RATE_LIMIT_PER_EMAIL_PER_HOUR || "5"
    ),
  });
}

export function rateLimitByIP(ip: string): RateLimitResult {
  return rateLimit(`ip:${ip}`, {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: parseInt(process.env.RESET_RATE_LIMIT_PER_IP_PER_HOUR || "20"),
  });
}

export function rateLimitVerification(identifier: string): RateLimitResult {
  return rateLimit(`verify:${identifier}`, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  });
}
