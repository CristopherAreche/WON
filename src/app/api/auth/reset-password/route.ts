import { NextResponse } from 'next/server';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be numeric'),
  newPassword: z.string().min(12, 'Password must be at least 12 characters'),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    // Password reset functionality is temporarily disabled
    return NextResponse.json(
      { error: 'Password reset functionality is currently disabled.' },
      { status: 503 }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    
    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}