import { NextResponse } from 'next/server';
import { debugTokenValidation, debugTokenCreation } from '@/lib/debug-token';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, token, code, email } = body;
    
    if (action === 'validate') {
      if (!token || !code) {
        return NextResponse.json({ error: 'Token and code required' }, { status: 400 });
      }
      
      const result = await debugTokenValidation(token, code);
      return NextResponse.json({ 
        success: result !== null,
        result,
        timestamp: new Date().toISOString(),
      });
    }
    
    if (action === 'create') {
      if (!email) {
        return NextResponse.json({ error: 'Email required' }, { status: 400 });
      }
      
      const result = await debugTokenCreation(email);
      return NextResponse.json({ 
        success: result !== null,
        result,
        timestamp: new Date().toISOString(),
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}