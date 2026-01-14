import { NextRequest, NextResponse } from 'next/server';
import { EmergencyContactsService } from '@/lib/services/emergency-contacts';
import { ethers } from 'ethers';

// GET /api/emergency-contacts
export async function GET() {
  try {
    const contacts = await EmergencyContactsService.getContacts();
    return NextResponse.json({ contacts });
  } catch (err) {
    return NextResponse.json({ contacts: [], error: err instanceof Error ? err.message : 'Failed to fetch contacts' }, { status: 500 });
  }
}

// POST /api/emergency-contacts
// Body: { contact: string }
export async function POST(req: NextRequest) {
  const { contact, privateKey } = await req.json();
  if (!contact || !privateKey) {
    return NextResponse.json({ success: false, message: 'Contact and privateKey required' }, { status: 400 });
  }
  try {
    const provider = EmergencyContactsService.getProvider();
    const signer = new ethers.Wallet(privateKey, provider);
    await EmergencyContactsService.addContact(contact, signer);
    return NextResponse.json({ success: true, message: 'Contact added' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err instanceof Error ? err.message : 'Failed to add contact' }, { status: 500 });
  }
}
