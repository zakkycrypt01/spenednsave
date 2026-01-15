import { NextRequest, NextResponse } from 'next/server';

// Simulate CSV export (replace with real data in production)
export async function GET(req: NextRequest) {
  // In a real app, authenticate user and fetch activity data
  // For now, return a static CSV string
  const csv = `Date,Type,Amount,Status\n2026-01-01,Deposit,1.0 ETH,Completed\n2026-01-10,Withdrawal,0.5 ETH,Pending`;
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="activity.csv"',
    },
  });
}
