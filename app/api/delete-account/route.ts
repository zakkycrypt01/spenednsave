import { NextRequest, NextResponse } from 'next/server';

// Simulate user deletion (replace with real DB logic in production)
export async function DELETE(req: NextRequest) {
  // In a real app, authenticate user and delete from DB
  // For now, just return success
  return NextResponse.json({ success: true });
}
