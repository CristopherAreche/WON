import { NextResponse } from 'next/server';
import { z } from 'zod';

const verifyCodeSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be numeric'),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = verifyCodeSchema.safeParse(body);

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
    console.error('Verify reset code error:', error);
    
    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}