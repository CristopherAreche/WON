import { describe, it, expect, beforeEach } from 'vitest';
import {
  validatePassword,
  generateResetCode,
  generateResetToken,
  hashToken,
  verifyToken,
  getPasswordResetConfig,
} from '../password-reset';

describe('Password Reset Utilities', () => {
  describe('validatePassword', () => {
    it('should accept a strong password', () => {
      const result = validatePassword('StrongPassword123!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject a password that is too short', () => {
      const result = validatePassword('Short1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters long');
    });

    it('should reject a password without uppercase', () => {
      const result = validatePassword('weakpassword123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject a password without lowercase', () => {
      const result = validatePassword('WEAKPASSWORD123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject a password without numbers', () => {
      const result = validatePassword('WeakPassword!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject a password without symbols', () => {
      const result = validatePassword('WeakPassword123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one symbol');
    });

    it('should provide multiple error messages for weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('generateResetCode', () => {
    it('should generate a code of the specified length', () => {
      const code = generateResetCode(6);
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^\d{6}$/);
    });

    it('should generate different codes on subsequent calls', () => {
      const code1 = generateResetCode(6);
      const code2 = generateResetCode(6);
      expect(code1).not.toBe(code2);
    });

    it('should generate codes with custom length', () => {
      const code = generateResetCode(8);
      expect(code).toHaveLength(8);
      expect(code).toMatch(/^\d{8}$/);
    });
  });

  describe('generateResetToken', () => {
    it('should generate a URL-safe base64 token', () => {
      const token = generateResetToken();
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(token.length).toBeGreaterThan(40); // 32 bytes = ~43 chars in base64url
    });

    it('should generate different tokens on subsequent calls', () => {
      const token1 = generateResetToken();
      const token2 = generateResetToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('hashToken and verifyToken', () => {
    it('should hash and verify tokens correctly', async () => {
      const originalToken = 'test-token-12345';
      const hashedToken = await hashToken(originalToken);
      
      expect(hashedToken).not.toBe(originalToken);
      expect(hashedToken).toMatch(/^\$argon2id\$/);
      
      const isValid = await verifyToken(hashedToken, originalToken);
      expect(isValid).toBe(true);
    });

    it('should reject invalid tokens', async () => {
      const originalToken = 'test-token-12345';
      const hashedToken = await hashToken(originalToken);
      
      const isValid = await verifyToken(hashedToken, 'wrong-token');
      expect(isValid).toBe(false);
    });

    it('should handle verification errors gracefully', async () => {
      const isValid = await verifyToken('invalid-hash', 'any-token');
      expect(isValid).toBe(false);
    });
  });

  describe('getPasswordResetConfig', () => {
    beforeEach(() => {
      // Reset environment variables
      delete process.env.RESET_TOKEN_TTL_MINUTES;
      delete process.env.RESET_CODE_LENGTH;
      delete process.env.RESET_MAX_ATTEMPTS;
      delete process.env.RESET_LOCKOUT_MINUTES;
      delete process.env.RESET_RATE_LIMIT_PER_EMAIL_PER_HOUR;
      delete process.env.RESET_RATE_LIMIT_PER_IP_PER_HOUR;
      delete process.env.RESET_AUTOSIGNIN;
    });

    it('should return default configuration', () => {
      const config = getPasswordResetConfig();
      
      expect(config).toEqual({
        tokenTtlMinutes: 10,
        codeLength: 6,
        maxAttempts: 5,
        lockoutMinutes: 15,
        rateLimitPerEmailPerHour: 5,
        rateLimitPerIpPerHour: 20,
        autoSignin: false,
      });
    });

    it('should use environment variables when provided', () => {
      process.env.RESET_TOKEN_TTL_MINUTES = '15';
      process.env.RESET_CODE_LENGTH = '8';
      process.env.RESET_MAX_ATTEMPTS = '3';
      process.env.RESET_LOCKOUT_MINUTES = '30';
      process.env.RESET_RATE_LIMIT_PER_EMAIL_PER_HOUR = '3';
      process.env.RESET_RATE_LIMIT_PER_IP_PER_HOUR = '10';
      process.env.RESET_AUTOSIGNIN = 'true';

      const config = getPasswordResetConfig();
      
      expect(config).toEqual({
        tokenTtlMinutes: 15,
        codeLength: 8,
        maxAttempts: 3,
        lockoutMinutes: 30,
        rateLimitPerEmailPerHour: 3,
        rateLimitPerIpPerHour: 10,
        autoSignin: true,
      });
    });
  });
});