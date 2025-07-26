import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      message: 'Earnings API is working',
      timestamp: new Date().toISOString(),
      status: 'ok'
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test route error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 