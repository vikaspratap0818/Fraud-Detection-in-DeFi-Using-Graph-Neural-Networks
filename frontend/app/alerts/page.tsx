'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { TransactionFeed } from '@/components/TransactionFeed';
import { ShieldAlert } from 'lucide-react';

export default function AlertsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-['Orbitron',monospace] text-[#e0fff8]">Live Alerts Monitor</h1>
            <p className="text-sm font-medium text-zinc-400 mt-1">Real-time feed of flagged malicious activity and high-risk transactions across monitored chains.</p>
          </div>
        </div>

        <div className="h-[75vh]">
          <TransactionFeed />
        </div>
      </div>
    </DashboardLayout>
  );
}
