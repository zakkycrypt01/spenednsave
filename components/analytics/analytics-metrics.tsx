"use client";

import { TrendingUp, TrendingDown, DollarSign, Users, Zap, Activity } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'cyan';
}

function MetricCard({ title, value, subtitle, icon, trend, trendLabel, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300',
    green: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-700 dark:text-green-300',
    purple: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300',
    orange: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900 text-orange-700 dark:text-orange-300',
    pink: 'bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-900 text-pink-700 dark:text-pink-300',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-900 text-cyan-700 dark:text-cyan-300',
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          <p className="text-xs opacity-60 mt-2">{subtitle}</p>
        </div>
        <div className="opacity-40 flex-shrink-0">{icon}</div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-2 text-sm">
          {trend >= 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="font-medium">
            {trend > 0 ? '+' : ''}{trend}% {trendLabel || 'vs last period'}
          </span>
        </div>
      )}
    </div>
  );
}

export function AnalyticsMetrics({ timeRange }: { timeRange: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <MetricCard
        title="Total Vault Value"
        value="$133,100"
        subtitle="All tokens combined"
        icon={<DollarSign className="w-8 h-8" />}
        trend={+12.5}
        color="blue"
      />
      <MetricCard
        title="Total Withdrawn"
        value="71.2 ETH"
        subtitle="Lifetime total"
        icon={<Activity className="w-8 h-8" />}
        trend={+8.3}
        color="green"
      />
      <MetricCard
        title="Guardian Count"
        value="4"
        subtitle="Active guardians"
        icon={<Users className="w-8 h-8" />}
        trend={0}
        color="purple"
      />
      <MetricCard
        title="Approval Rate"
        value="91%"
        subtitle="Average consensus"
        icon={<Zap className="w-8 h-8" />}
        trend={+3.2}
        color="orange"
      />
      <MetricCard
        title="Avg Response Time"
        value="2.4h"
        subtitle="Guardian median"
        icon={<span className="material-symbols-outlined">schedule</span>}
        trend={-15}
        trendLabel="faster"
        color="pink"
      />
      <MetricCard
        title="Risk Score"
        value="35"
        subtitle="Safe level"
        icon={<span className="material-symbols-outlined">verified</span>}
        trend={-8}
        trendLabel="safer"
        color="cyan"
      />
    </div>
  );
}
