import { NextRequest, NextResponse } from 'next/server';

// Simulate demo mode toggle (replace with DB/config in production)
let demoMode = false;

export async function GET() {
  return NextResponse.json({ demoMode });
}

export async function POST(req: NextRequest) {
  const { enabled } = await req.json();
  demoMode = !!enabled;
  return NextResponse.json({ demoMode });
}
