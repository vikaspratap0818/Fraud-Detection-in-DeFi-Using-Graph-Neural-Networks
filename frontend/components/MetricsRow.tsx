import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const metrics = [
  {
    title: 'Total Monitored Wallets',
    value: '14,284',
    change: '+12.5%',
    trend: 'up',
    icon: Activity,
    color: 'text-[#00ffb4]',
    bg: 'bg-[rgba(0,255,180,0.1)]',
    border: 'border-[rgba(0,255,180,0.3)]'
  },
  {
    title: 'High Risk Entities',
    value: '342',
    change: '+5.2%',
    trend: 'up',
    icon: ShieldAlert,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30'
  },
  {
    title: 'Potential Sybil Rings',
    value: '18',
    change: '-2',
    trend: 'down',
    icon: Network,
    color: 'text-[#00b4ff]',
    bg: 'bg-[rgba(0,180,255,0.1)]',
    border: 'border-[rgba(0,180,255,0.3)]'
  },
  {
    title: 'False Positive Rate',
    value: '0.4%',
    change: '-0.1%',
    trend: 'down',
    icon: ShieldCheck,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30'
  }
];

import { Network } from 'lucide-react';

export const MetricsRow = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, i) => (
        <div key={i} className="card p-5 group hover:-translate-y-1 transition-transform duration-300">
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          
          <div className="flex justify-between items-start mb-4">
            <div className={cn("p-2.5 rounded-xl border flex items-center justify-center", metric.bg, metric.border)}>
              <metric.icon className={cn("w-5 h-5", metric.color)} strokeWidth={2.5} />
            </div>
            <div className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider",
              metric.trend === 'up' ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-500/10 text-emerald-400"
            )}>
              {metric.change}
            </div>
          </div>
          
          <div>
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{metric.title}</h3>
            <p className="text-2xl font-['Orbitron',monospace] font-bold text-[#e0fff8] group-hover:text-shadow-glow transition-all">{metric.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
