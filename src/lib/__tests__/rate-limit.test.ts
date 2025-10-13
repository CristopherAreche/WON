import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateLimit, rateLimitByEmail, rateLimitByIP } from '../rate-limit';

// Mock environment variables
vi.mock('process', () => ({
  env: {
    RESET_RATE_LIMIT_PER_EMAIL_PER_HOUR: '5',
    RESET_RATE_LIMIT_PER_IP_PER_HOUR: '20',
  },
}));

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear the rate limit store before each test
    // This is a bit hacky since we can't directly access the private Map
    // In a real implementation, you might want to expose a clear method for testing
  });

  describe('rateLimit', () => {
    it('should allow requests within the limit', () => {
      const identifier = 'test-user-1';
      const config = { windowMs: 60000, maxRequests: 5 };

      // First request should be allowed
      const result1 = rateLimit(identifier, config);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(4);

      // Second request should be allowed
      const result2 = rateLimit(identifier, config);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should block requests when limit is exceeded', () => {
      const identifier = 'test-user-2';
      const config = { windowMs: 60000, maxRequests: 2 };

      // First two requests should be allowed
      rateLimit(identifier, config);
      rateLimit(identifier, config);

      // Third request should be blocked
      const result = rateLimit(identifier, config);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after the time window', async () => {
      const identifier = 'test-user-3';
      const config = { windowMs: 100, maxRequests: 1 }; // Very short window for testing

      // First request should be allowed
      const result1 = rateLimit(identifier, config);
      expect(result1.allowed).toBe(true);

      // Second request should be blocked
      const result2 = rateLimit(identifier, config);
      expect(result2.allowed).toBe(false);

      // Wait for the window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Next request should be allowed again
      const result3 = rateLimit(identifier, config);
      expect(result3.allowed).toBe(true);
    });

    it('should handle different identifiers independently', () => {
      const config = { windowMs: 60000, maxRequests: 1 };

      // First identifier should be allowed
      const result1 = rateLimit('user-1', config);
      expect(result1.allowed).toBe(true);

      // Second identifier should also be allowed
      const result2 = rateLimit('user-2', config);
      expect(result2.allowed).toBe(true);

      // First identifier should now be blocked
      const result3 = rateLimit('user-1', config);
      expect(result3.allowed).toBe(false);

      // Second identifier should still be allowed (first request)
      const result4 = rateLimit('user-2', config);
      expect(result4.allowed).toBe(false); // Actually blocked on second request
    });
  });

  describe('rateLimitByEmail', () => {
    it('should apply email-specific rate limits', () => {
      const email = 'test@example.com';
      
      // Should be allowed initially
      const result = rateLimitByEmail(email);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // 5 - 1 = 4
    });

    it('should block after exceeding email limit', () => {
      const email = 'heavy-user@example.com';
      
      // Make 5 requests (the limit)
      for (let i = 0; i < 5; i++) {
        const result = rateLimitByEmail(email);
        expect(result.allowed).toBe(true);
      }
      
      // 6th request should be blocked
      const result = rateLimitByEmail(email);
      expect(result.allowed).toBe(false);
    });
  });

  describe('rateLimitByIP', () => {
    it('should apply IP-specific rate limits', () => {
      const ip = '192.168.1.1';
      
      // Should be allowed initially
      const result = rateLimitByIP(ip);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(19); // 20 - 1 = 19
    });

    it('should have higher limits for IPs than emails', () => {
      const ip = '192.168.1.2';
      
      // Make 20 requests (the IP limit)
      let lastResult;
      for (let i = 0; i < 20; i++) {
        lastResult = rateLimitByIP(ip);
        expect(lastResult.allowed).toBe(true);
      }
      
      // 21st request should be blocked
      const result = rateLimitByIP(ip);
      expect(result.allowed).toBe(false);
    });
  });
});