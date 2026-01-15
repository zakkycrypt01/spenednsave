import { NextRequest, NextResponse } from 'next/server';

// Simulate vault reset (replace with real logic in production)
export async function POST(req: NextRequest) {
  // In a real app, authenticate user and reset vault data
  // For now, just return success
  return NextResponse.json({ success: true });
}
