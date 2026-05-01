import React from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink, ShieldAlert, ShieldCheck, ShieldIcon } from 'lucide-react';

const mockTransactions = [
  { hash: '0x4f2...3a8b', from: '0x1a2b...3c4d', to: '0x5e6f...7g8h', amount: '4.20 ETH', risk: 'High', status: 'Alert' },
  { hash: '0x7e1...9d2c', from: '0x9i0j...1k2l', to: '0x3m4n...5o6p', amount: '1,200 USDC', risk: 'Low', status: 'Safe' },
  { hash: '0x2b4...8c5d', from: '0x7q8r...9s0t', to: '0x1u2v...3w4x', amount: '0.85 ETH', risk: 'High', status: 'Alert' },
  { hash: '0x9a1...4f6e', from: '0x5y6z...7a8b', to: '0x9c0d...1e2f', amount: '45,000 USDC', risk: 'Safe', status: 'Safe' },
  { hash: '0x3c5...1d7g', from: '0x3g4h...5i6j', to: '0x7k8l...9m0n', amount: '12.5 ETH', risk: 'High', status: 'Alert' },
  { hash: '0x8h2...5j4k', from: '0x1o2p...3q4r', to: '0x5s6t...7u8v', amount: '250 ETH', risk: 'Low', status: 'Safe' },
];

const RiskBadge = ({ level }: { level: string }) => {
  const styles = {
    High: "bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
    Low: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    Safe: "bg-[#00ffb4]/10 text-[#00ffb4] border-[#00ffb4]/30 shadow-[0_0_10px_rgba(0,255,180,0.1)]",
  }[level] || "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";

  const Icon = {
    High: ShieldAlert,
    Low: ShieldIcon,
    Safe: ShieldCheck,
  }[level] || ShieldIcon;

  return (
    <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 w-max ml-auto", styles)}>
      <Icon className="w-3 h-3" />
      {level}
    </div>
  );
};

export const TransactionFeed = () => {
  return (
    <div className="card h-full flex flex-col pt-0 overflow-hidden">
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      
      <div className="p-5 border-b border-[rgba(0,255,180,0.15)] flex items-center justify-between bg-[#08121c]/40 backdrop-blur-md">
        <h3 className="text-sm font-bold text-[#e0fff8] font-['Orbitron',monospace] tracking-wider flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00ffb4] animate-pulse shadow-[0_0_8px_#00ffb4]" />
          Live Threat Feed
        </h3>
        <span className="text-[10px] font-medium text-[#00b4ff] bg-[#00b4ff]/10 px-2.5 py-1 rounded border border-[#00b4ff]/20 uppercase tracking-widest">
          Scanning...
        </span>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-2">
        <div className="flex flex-col gap-2">
          {mockTransactions.map((tx, i) => (
            <div 
              key={i} 
              className={cn(
                "p-3 rounded-lg border bg-[rgba(0,255,180,0.02)] hover:bg-[rgba(0,255,180,0.06)] transition-all group cursor-pointer flex flex-col gap-2 relative overflow-hidden",
                tx.risk === 'High' ? "border-red-500/20 hover:border-red-500/40 animate-pulse-red" : "border-[rgba(0,255,180,0.1)] hover:border-[rgba(0,255,180,0.25)]"
              )}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-300 group-hover:text-[#00ffb4] transition-colors text-xs font-bold">{tx.hash}</span>
                  <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-[#00ffb4] transition-colors" />
                </div>
                <RiskBadge level={tx.risk} />
              </div>
              
              <div className="flex justify-between items-end mt-1">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest w-8">From</span>
                    <span className="font-mono text-[11px] text-zinc-400 leading-none">{tx.from}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest w-8">To</span>
                    <span className="font-mono text-[11px] text-zinc-400 leading-none">{tx.to}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-0.5">Amount</p>
                  <p className="font-['Orbitron',monospace] font-bold text-sm text-[#e0fff8]">{tx.amount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-[rgba(0,255,180,0.15)] bg-[#08121c]/60">
        <button onClick={() => window.open('/transactions', '_blank')} className="w-full py-2.5 rounded text-[10px] font-bold text-[#00ffb4] bg-[rgba(0,255,180,0.05)] border border-[rgba(0,255,180,0.2)] uppercase tracking-widest hover:bg-[rgba(0,255,180,0.1)] hover:border-[rgba(0,255,180,0.4)] transition-all">
          View Full Ledger
        </button>
      </div>
    </div>
  );
};
