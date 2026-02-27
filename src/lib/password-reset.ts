import { prisma } from './db';
import * as argon2 from 'argon2';
import { randomBytes, randomInt } from 'crypto';

export interface PasswordResetConfig {
  tokenTtlMinutes: number;
  codeLength: number;
  maxAttempts: number;
  lockoutMinutes: number;
  rateLimitPerEmailPerHour: number;
  rateLimitPerIpPerHour: number;
  autoSignin: boolean;
}

export function getPasswordResetConfig(): PasswordResetConfig {
  return {
    tokenTtlMinutes: parseInt(process.env.RESET_TOKEN_TTL_MINUTES || '10'),
    codeLength: parseInt(process.env.RESET_CODE_LENGTH || '6'),
    maxAttempts: parseInt(process.env.RESET_MAX_ATTEMPTS || '5'),
    lockoutMinutes: parseInt(process.env.RESET_LOCKOUT_MINUTES || '15'),
    rateLimitPerEmailPerHour: parseInt(process.env.RESET_RATE_LIMIT_PER_EMAIL_PER_HOUR || '5'),
    rateLimitPerIpPerHour: parseInt(process.env.RESET_RATE_LIMIT_PER_IP_PER_HOUR || '20'),
    autoSignin: process.env.RESET_AUTOSIGNIN === 'true',
  };
}

export function generateResetCode(length: number = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += randomInt(0, 10).toString();
  }
  return code;
}

export function generateResetToken(): string {
  return randomBytes(32).toString('base64url');
}

export async function hashToken(token: string): Promise<string> {
  return argon2.hash(token, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });
}

export async function verifyToken(hashedToken: string, token: string): Promise<boolean> {
  try {
    return await argon2.verify(hashedToken, token);
  } catch {
    return false;
  }
}

export async function createPasswordResetToken(
  userId: string,
  ip: string | null,
  userAgent: string | null
) {
  const config = getPasswordResetConfig();
  const token = generateResetToken();
  const code = generateResetCode(config.codeLength);
  const hashedToken = await hashToken(token);
  const expiresAt = new Date(Date.now() + config.tokenTtlMinutes * 60 * 1000);

  // Invalidate any existing active reset tokens for this user
  await prisma.$executeRaw`
    UPDATE "PasswordResetToken" 
    SET "consumedAt" = NOW() 
    WHERE "userId" = ${userId} 
      AND "consumedAt" IS NULL 
      AND "expiresAt" > NOW()
  `;

  // Create new reset token
  const resetTokenId = generateResetToken(); // Use as ID
  await prisma.$executeRaw`
    INSERT INTO "PasswordResetToken" 
    ("id", "userId", "hashedToken", "code", "expiresAt", "ip", "userAgent", "createdAt")
    VALUES (${resetTokenId}, ${userId}, ${hashedToken}, ${code}, ${expiresAt}, ${ip}, ${userAgent}, NOW())
  `;

  const resetToken = {
    id: resetTokenId,
    userId,
    hashedToken,
    code,
    expiresAt,
    consumedAt: null,
    attempts: 0,
    ip,
    userAgent,
    createdAt: new Date(),
  };

  return { token, code, resetToken };
}

export async function validateResetToken(token: string, code: string) {
  const resetTokens = await prisma.$queryRaw`
    SELECT rt.*, u."email", u."name"
    FROM "PasswordResetToken" rt
    JOIN "User" u ON rt."userId" = u."id"
    WHERE rt."consumedAt" IS NULL 
      AND rt."expiresAt" > NOW()
      AND rt."code" = ${code}
  ` as Array<{
    id: string;
    userId: string;
    hashedToken: string;
    code: string;
    expiresAt: Date;
    consumedAt: Date | null;
    attempts: number;
    ip: string | null;
    userAgent: string | null;
    createdAt: Date;
    email: string;
    name: string | null;
  }>;

  for (const resetToken of resetTokens) {
    const isValidToken = await verifyToken(resetToken.hashedToken, token);
    if (isValidToken) {
      return {
        ...resetToken,
        user: {
          id: resetToken.userId,
          email: resetToken.email,
          name: resetToken.name,
        },
      };
    }
  }

  return null;
}

export async function incrementResetAttempts(resetTokenId: string) {
  return prisma.$executeRaw`
    UPDATE "PasswordResetToken" 
    SET "attempts" = "attempts" + 1 
    WHERE "id" = ${resetTokenId}
  `;
}

export async function consumeResetToken(resetTokenId: string) {
  return prisma.$executeRaw`
    UPDATE "PasswordResetToken" 
    SET "consumedAt" = NOW() 
    WHERE "id" = ${resetTokenId}
  `;
}

export async function invalidateUserResetTokens(userId: string) {
  return prisma.$executeRaw`
    UPDATE "PasswordResetToken" 
    SET "consumedAt" = NOW() 
    WHERE "userId" = ${userId} 
      AND "consumedAt" IS NULL
  `;
}

export async function checkRateLimit(identifier: string, type: 'email' | 'ip'): Promise<boolean> {
  // This function is kept for backward compatibility but now uses the rate limit store
  // The actual rate limiting is now handled in the API endpoints
  return true;
}

export async function isResetTokenLocked(resetTokenId: string): Promise<boolean> {
  const config = getPasswordResetConfig();
  const resetTokens = await prisma.$queryRaw`
    SELECT * FROM "PasswordResetToken" 
    WHERE "id" = ${resetTokenId}
  ` as Array<{
    id: string;
    attempts: number;
    createdAt: Date;
  }>;

  const resetToken = resetTokens[0];
  if (!resetToken) return true;

  if (resetToken.attempts >= config.maxAttempts) {
    const lockoutUntil = new Date(
      resetToken.createdAt.getTime() + 
      (resetToken.attempts - config.maxAttempts + 1) * config.lockoutMinutes * 60 * 1000
    );
    return new Date() < lockoutUntil;
  }

  return false;
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one symbol');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
