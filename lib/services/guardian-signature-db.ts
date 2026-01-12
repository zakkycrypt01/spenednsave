import Database from 'better-sqlite3';
import path from 'path';
import { type PendingWithdrawalRequest, type SignedWithdrawal } from '@/lib/types/guardian-signatures';
import { type Address, type Hex } from 'viem';

const dbPath = path.resolve(process.cwd(), 'guardian_signatures.sqlite');
const db = new Database(dbPath);

// Initialize tables if not exist
const init = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS pending_requests (
      id TEXT PRIMARY KEY,
      vaultAddress TEXT,
      request TEXT,
      signatures TEXT,
      requiredQuorum INTEGER,
      status TEXT,
      createdAt INTEGER,
      executedAt INTEGER,
      executionTxHash TEXT
    );
  `);
};

init();

export class GuardianSignatureDB {
  static savePendingRequest(request: PendingWithdrawalRequest) {
    db.prepare(`REPLACE INTO pending_requests (id, vaultAddress, request, signatures, requiredQuorum, status, createdAt, executedAt, executionTxHash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        request.id,
        request.vaultAddress,
        JSON.stringify(request.request),
        JSON.stringify(request.signatures),
        request.requiredQuorum,
        request.status,
        request.createdAt,
        request.executedAt ?? null,
        request.executionTxHash ?? null
      );
  }

  static getPendingRequests(): PendingWithdrawalRequest[] {
    const rows = db.prepare('SELECT * FROM pending_requests').all();
    return rows.map(row => ({
      ...row,
      request: JSON.parse(row.request),
      signatures: JSON.parse(row.signatures),
      requiredQuorum: row.requiredQuorum,
      status: row.status,
      createdAt: row.createdAt,
      executedAt: row.executedAt,
      executionTxHash: row.executionTxHash,
    }));
  }

  static getPendingRequest(id: string): PendingWithdrawalRequest | null {
    const row = db.prepare('SELECT * FROM pending_requests WHERE id = ?').get(id);
    if (!row) return null;
    return {
      ...row,
      request: JSON.parse(row.request),
      signatures: JSON.parse(row.signatures),
      requiredQuorum: row.requiredQuorum,
      status: row.status,
      createdAt: row.createdAt,
      executedAt: row.executedAt,
      executionTxHash: row.executionTxHash,
    };
  }

  static deletePendingRequest(id: string) {
    db.prepare('DELETE FROM pending_requests WHERE id = ?').run(id);
  }

  // Add more methods as needed (addSignature, markAsExecuted, etc)
}
