import { NextRequest, NextResponse } from 'next/server';

// Simulate maintenance mode toggle (replace with DB/config in production)
let maintenance = false;

export async function GET() {
  return NextResponse.json({ maintenance });
}

export async function POST(req: NextRequest) {
  const { enabled } = await req.json();
  maintenance = !!enabled;
  return NextResponse.json({ maintenance });
}
