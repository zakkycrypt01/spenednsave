import { NextRequest, NextResponse } from 'next/server';

// GET /api/emergency-contacts
export async function GET() {
  // TODO: Replace with actual contract call to getEmergencyContacts
  // For now, return a mock list
  return NextResponse.json({ contacts: [
    '0x1234...abcd',
    '0x5678...efgh',
  ] });
}

// POST /api/emergency-contacts
// Body: { contact: string }
export async function POST(req: NextRequest) {
  const { contact } = await req.json();
  // TODO: Call contract addEmergencyContact(contact)
  // For now, just return success
  return NextResponse.json({ success: true, message: 'Contact added (mock)' });
}
