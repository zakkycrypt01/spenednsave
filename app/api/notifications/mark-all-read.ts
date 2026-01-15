import { NextResponse } from 'next/server';

// In-memory notifications for demo (replace with DB in production)
let notifications: any[] = [];

export async function POST() {
  // Mark all as read (for demo, just clear the unread flag)
  notifications = notifications.map(n => ({ ...n, read: true }));
  return NextResponse.json({ ok: true });
}
