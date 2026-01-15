import { NextResponse } from 'next/server';

// Simulate FAQ content (replace with DB or markdown in production)
export async function GET() {
  return NextResponse.json({
    faq: [
      { q: "How do I reset my vault?", a: "Go to Settings and click 'Reset Vault'." },
      { q: "How do I contact support?", a: "Use the Contact Support form in the Help section." },
      { q: "What is demo mode?", a: "Demo mode lets you explore the app with fake data." }
    ]
  });
}
