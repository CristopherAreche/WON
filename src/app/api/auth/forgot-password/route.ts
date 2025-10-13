import { NextResponse } from 'next/server';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Password reset functionality is temporarily disabled
    return NextResponse.json(
      { 
        ok: true,
        message: "Password reset functionality is currently disabled. Please contact support for assistance.",
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 }
    );
  }
}