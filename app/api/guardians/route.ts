import { NextResponse } from 'next/server';
import { GuardianSignatureDB } from '@/lib/services/guardian-signature-db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tokenAddress = url.searchParams.get('tokenAddress');

    if (!tokenAddress) {
      return NextResponse.json({ error: 'tokenAddress query parameter is required' }, { status: 400 });
    }

    const guardians = await GuardianSignatureDB.getGuardiansByTokenAddress(tokenAddress);
    return NextResponse.json(guardians);
  } catch (err) {
    console.error('[/api/guardians] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.address || !body.tokenId || !body.tokenAddress) {
      return NextResponse.json({ error: 'Invalid body - missing required fields' }, { status: 400 });
    }

    await GuardianSignatureDB.saveGuardian(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[/api/guardians] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
