import { NextResponse } from 'next/server';
import { GuardianSignatureDB } from '@/lib/services/guardian-signature-db';

// Helper to convert BigInt values to strings for JSON serialization
function serializeResponse(obj: any): any {
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeResponse);
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = serializeResponse(obj[key]);
    }
    return result;
  }
  return obj;
}

export async function GET(request: Request, context: any) {
  try {
    const { id } = context?.params ?? {};
    const row = await GuardianSignatureDB.getPendingRequest(id);
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(serializeResponse(row));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(request: Request, context: any) {
  try {
    const { id } = context?.params ?? {};
    console.log('[PUT] Updating request:', id);
    
    const body = await request.json();
    console.log('[PUT] Request body keys:', Object.keys(body));
    
    const existing = await GuardianSignatureDB.getPendingRequest(id);
    if (!existing) {
      console.error('[PUT] Request not found:', id);
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = {
      ...existing,
      ...body,
      request: body.request ?? existing.request,
      signatures: body.signatures ?? existing.signatures,
    };
    
    console.log('[PUT] Saving updated request');
    await GuardianSignatureDB.savePendingRequest(updated);
    
    const saved = await GuardianSignatureDB.getPendingRequest(id);
    console.log('[PUT] Saved successfully');
    
    return NextResponse.json(serializeResponse(saved));
  } catch (err) {
    console.error('[PUT] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const { id } = context?.params ?? {};
    await GuardianSignatureDB.deletePendingRequest(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
