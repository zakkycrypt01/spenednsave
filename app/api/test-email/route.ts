import { NextRequest, NextResponse } from 'next/server';
// import { sendNotification } from '@/lib/services/email-notifications';

export async function POST(req: NextRequest) {
  try {
    const { to } = await req.json();
    if (!to) return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    // await sendNotification({ to, subject: 'Test Email', html: '<p>This is a test email.</p>' });
    // Simulate success
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
  }
}
