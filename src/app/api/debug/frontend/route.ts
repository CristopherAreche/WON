import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const headers = Object.fromEntries(request.headers.entries());
    
    console.log('🔍 FRONTEND DEBUG REQUEST');
    console.log('='.repeat(50));
    console.log('📨 Request body:', JSON.stringify(body, null, 2));
    console.log('📋 Request headers:', JSON.stringify(headers, null, 2));
    console.log('🌐 Request URL:', request.url);
    console.log('🔗 Request method:', request.method);
    console.log('='.repeat(50));
    
    return NextResponse.json({
      success: true,
      receivedBody: body,
      receivedHeaders: headers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Frontend debug error:', error);
    return NextResponse.json({ error: 'Debug error' }, { status: 500 });
  }
}