import { NextResponse } from 'next/server';

// Simulate legal content (replace with DB or markdown in production)
export async function GET() {
  return NextResponse.json({
    terms: "These are the Terms of Service. Replace with real content.",
    privacy: "This is the Privacy Policy. Replace with real content."
  });
}
