'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricsRow } from '@/components/MetricsRow';
import { FraudStatsChart } from '@/components/FraudStatsChart';
import { TransactionFeed } from '@/components/TransactionFeed';
import { Shield, Zap, Info } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { status, data: session } = useSession();
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchData = async () => {
      try {
        const res = await fetch('/api/fraud-stats', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          console.error(`API error! status: ${res.status}`);
          return;
        }

        const data = await res.json();
        if (data && data.subgraph) {
          setGraphData(data);
        }
      } catch (error) {
        console.error("Failed to fetch graph data:", error);
      }
    };

    fetchData();
  }, [status]);

  if (status === 'loading' || status === 'unauthenticated') {
    return <div className="login-root"><span className="spinner"></span></div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-[#00b4ff]" />
              <span className="text-xs font-bold text-[#00b4ff] uppercase tracking-widest font-['Orbitron',monospace]">Web3 Security Intelligence</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#e0fff8] font-['Orbitron',monospace]">
              Fraud Detection <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffb4] to-[#00b4ff]">Dashboard</span>
            </h1>
            <p className="text-zinc-400 mt-3 max-w-2xl font-medium text-sm leading-relaxed">
              Real-time Graph Neural Network (GNN) analysis for multi-hop money laundering and Sybil attack detection in decentralized protocols. Welcome back, {session?.user?.name}!
            </p>
          </div>
          
          <div className="card p-3 flex items-center gap-4 max-w-xs shadow-none border-[#00ffb4]/30 bg-[#00ffb4]/5">
            <div className="text-right pl-2">
              <p className="text-[10px] text-[#00ffb4]/70 uppercase font-bold tracking-widest">GNN Confidence</p>
              <p className="text-2xl font-['Orbitron',monospace] font-bold text-[#00ffb4] drop-shadow-[0_0_8px_rgba(0,255,180,0.5)]">98.4%</p>
            </div>
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-[#00ffb4]/30 to-transparent" />
            <Zap className="w-6 h-6 text-[#00b4ff]" />
          </div>
        </div>

        {/* Top Metrics */}
        <MetricsRow />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-[600px]">
          {/* Center Visualization */}
          <div className="xl:col-span-2 space-y-4 flex flex-col">
            {graphData ? <FraudStatsChart data={graphData} /> : (
              <div className="card h-[500px] flex items-center justify-center">
                <span className="spinner" style={{ width: '30px', height: '30px', borderTopColor: '#00ffb4' }}></span>
              </div>
            )}
            
            <div className="card p-6 flex items-center justify-between bg-[rgba(0,180,255,0.05)] border-[rgba(0,180,255,0.3)] shadow-[0_0_20px_rgba(0,180,255,0.1)]">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[rgba(0,180,255,0.1)] text-[#00b4ff] border border-[rgba(0,180,255,0.3)]">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#e0fff8] font-['Orbitron',monospace]">New Cluster Detected</h4>
                  <p className="text-xs text-zinc-400 mt-1">A high-density subgraph of 12 wallets was flagged as a potential Sybil attack ring on Uniswap V3.</p>
                </div>
              </div>
              <button onClick={() => alert('Cluster review feature coming soon!')} className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
                Review Cluster
              </button>
            </div>
          </div>

          {/* Right Feed */}
          <div className="xl:col-span-1 flex flex-col">
            <TransactionFeed />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
