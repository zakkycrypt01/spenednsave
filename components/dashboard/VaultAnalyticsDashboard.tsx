"use client";

import { useVaultAnalytics } from '@/lib/hooks/useVaultAnalytics';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Line } from 'react-chartjs-2';
import React from 'react';

// You may need to install chart.js and react-chartjs-2
// npm install chart.js react-chartjs-2

export function VaultAnalyticsDashboard({ vaultAddress, guardianTokenAddress }: { vaultAddress?: string, guardianTokenAddress?: string }) {
  const analytics = useVaultAnalytics(vaultAddress, guardianTokenAddress);

  // Prepare chart data for savings growth
  const chartData = {
    labels: analytics.balanceSeries.map(point => point.date),
    datasets: [
      {
        label: 'Vault Balance (ETH)',
        data: analytics.balanceSeries.map(point => point.balance),
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>Total Deposited</CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{Number(analytics.totalDeposited) / 1e18} ETH</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Total Withdrawn</CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{Number(analytics.totalWithdrawn) / 1e18} ETH</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Withdrawals</CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{analytics.withdrawalFrequency}</span>
            <div className="text-xs text-slate-500">Avg: {analytics.avgWithdrawal.toFixed(4)} ETH</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Guardians</CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{analytics.totalGuardians}</span>
            {analytics.mostRecentGuardian && (
              <div className="text-xs text-slate-500">Last: {analytics.mostRecentGuardian.address}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Savings Growth Chart */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 shadow-md">
        <h2 className="text-xl font-bold mb-4">Vault Balance Over Time</h2>
        <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
      </div>
    </div>
  );
}
