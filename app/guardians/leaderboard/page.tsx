"use client";

import { useEffect, useState } from "react";
import { Award, Clock, Zap, User } from "lucide-react";

export default function GuardianLeaderboardPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/guardian-leaderboard")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <Award className="text-amber-500" size={32} /> Guardian Badge Leaderboard
      </h1>
      <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
        Top guardians ranked by approvals, response speed, and longevity. Data updates automatically.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-slate-200 dark:border-slate-700 rounded-xl">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              <th className="px-4 py-2 text-left">Rank</th>
              <th className="px-4 py-2 text-left">Guardian</th>
              <th className="px-4 py-2 text-left">Approvals</th>
              <th className="px-4 py-2 text-left">Avg. Response</th>
              <th className="px-4 py-2 text-left">Longevity</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8">No guardian activity yet.</td></tr>
            ) : data.map((g, i) => (
              <tr key={g.account} className="border-t border-slate-100 dark:border-slate-700">
                <td className="px-4 py-2 font-bold text-lg">{i + 1}</td>
                <td className="px-4 py-2 flex items-center gap-2">
                  <User className="text-indigo-500" size={20} />
                  <span className="font-mono">{g.account.slice(0, 6)}...{g.account.slice(-4)}</span>
                </td>
                <td className="px-4 py-2">{g.approvals}</td>
                <td className="px-4 py-2 flex items-center gap-1">
                  <Zap className="text-emerald-500" size={16} />
                  {g.avgResponseSeconds != null ? `${Math.round(g.avgResponseSeconds / 60)} min` : '-'}
                </td>
                <td className="px-4 py-2 flex items-center gap-1">
                  <Clock className="text-blue-500" size={16} />
                  {g.longevityDays} days
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
