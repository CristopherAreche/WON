import { prisma } from './db';
import * as argon2 from 'argon2';

interface PasswordResetTokenWithUser {
  id: string;
  userId: string;
  hashedToken: string;
  code: string;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
  email: string;
  name: string | null;
}

interface PasswordResetTokenWithStatus extends PasswordResetTokenWithUser {
  status: 'CONSUMED' | 'EXPIRED' | 'ACTIVE';
}

export async function debugTokenValidation(token: string, code: string) {
  console.log('\n🔍 DEBUG TOKEN VALIDATION');
  console.log('='.repeat(50));
  console.log('Input token:', token);
  console.log('Input code:', code);
  console.log('Token length:', token.length);
  console.log('Code length:', code.length);
  
  // Step 1: Find tokens by code
  console.log('\n📋 Step 1: Finding tokens by code...');
  const resetTokens = await prisma.$queryRaw`
    SELECT rt.*, u."email", u."name"
    FROM "PasswordResetToken" rt
    JOIN "User" u ON rt."userId" = u."id"
    WHERE rt."consumedAt" IS NULL 
      AND rt."expiresAt" > NOW()
      AND rt."code" = ${code}
  ` as Array<PasswordResetTokenWithUser>;
  
  console.log('Found tokens:', resetTokens.length);
  
  if (resetTokens.length === 0) {
    console.log('❌ No tokens found with this code');
    
    // Check if token exists but is expired or consumed
    const allTokensWithCode = await prisma.$queryRaw`
      SELECT rt.*, u."email", 
        CASE 
          WHEN rt."consumedAt" IS NOT NULL THEN 'CONSUMED'
          WHEN rt."expiresAt" <= NOW() THEN 'EXPIRED'
          ELSE 'ACTIVE'
        END as status
      FROM "PasswordResetToken" rt
      JOIN "User" u ON rt."userId" = u."id"
      WHERE rt."code" = ${code}
      ORDER BY rt."createdAt" DESC
      LIMIT 3
    ` as Array<PasswordResetTokenWithStatus>;
    
    console.log('All tokens with this code (including expired/consumed):');
    allTokensWithCode.forEach((t, i) => {
      console.log(`  ${i + 1}. Status: ${t.status}, Email: ${t.email}, Created: ${t.createdAt}`);
    });
    
    return null;
  }
  
  // Step 2: Verify each token
  console.log('\n🔐 Step 2: Verifying tokens...');
  for (let i = 0; i < resetTokens.length; i++) {
    const resetToken = resetTokens[i];
    console.log(`\n  Token ${i + 1}:`);
    console.log('    Email:', resetToken.email);
    console.log('    Hashed token (first 50 chars):', resetToken.hashedToken.substring(0, 50) + '...');
    console.log('    Code:', resetToken.code);
    console.log('    Expires:', resetToken.expiresAt);
    
    try {
      console.log('    Verifying token...');
      const isValidToken = await argon2.verify(resetToken.hashedToken, token);
      console.log('    Token verification result:', isValidToken);
      
      if (isValidToken) {
        console.log('✅ TOKEN VALIDATION SUCCESSFUL');
        return {
          ...resetToken,
          user: {
            id: resetToken.userId,
            email: resetToken.email,
            name: resetToken.name,
          },
        };
      }
    } catch (error) {
      console.log('    Token verification error:', error instanceof Error ? error.message : String(error));
    }
  }
  
  console.log('❌ No tokens passed verification');
  return null;
}

export async function debugTokenCreation(email: string) {
  console.log('\n🔧 DEBUG TOKEN CREATION');
  console.log('='.repeat(50));
  console.log('Email:', email);
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });
  
  if (!user) {
    console.log('❌ User not found');
    return null;
  }
  
  console.log('✅ User found:', user.id);
  
  // Generate token and code
  const { randomBytes } = await import('crypto');
  const originalToken = randomBytes(32).toString('base64url');
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  console.log('Generated token:', originalToken);
  console.log('Generated code:', code);
  console.log('Token length:', originalToken.length);
  
  // Hash token
  const hashedToken = await argon2.hash(originalToken, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
  
  console.log('Hashed token (first 50 chars):', hashedToken.substring(0, 50) + '...');
  
  // Test verification immediately
  const verificationTest = await argon2.verify(hashedToken, originalToken);
  console.log('Immediate verification test:', verificationTest);
  
  return {
    originalToken,
    hashedToken,
    code,
    userId: user.id,
  };
}