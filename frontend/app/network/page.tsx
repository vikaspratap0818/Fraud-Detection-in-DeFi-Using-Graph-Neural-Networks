'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GraphVisualizer } from '@/components/GraphVisualizer';
import { Network } from 'lucide-react';

export default function NetworkPage() {
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: 'Central' }),
        });
        const data = await res.json();
        if (data?.subgraph) setGraphData(data.subgraph);
      } catch (err) {
        console.error("Fetch failed", err);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[rgba(0,180,255,0.1)] rounded-xl border border-[rgba(0,180,255,0.2)]">
            <Network className="w-6 h-6 text-[#00b4ff]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-['Orbitron',monospace] text-[#e0fff8]">Network Topology Explorer</h1>
            <p className="text-sm font-medium text-zinc-400 mt-1">Deep-dive into multi-hop transaction clusters and visualize Sybil structures.</p>
          </div>
        </div>

        <div className="flex-1 min-h-[70vh]">
          {graphData ? (
            <GraphVisualizer data={graphData} />
          ) : (
            <div className="card h-full flex items-center justify-center">
              <span className="spinner" style={{ width: '40px', height: '40px', borderTopColor: '#00b4ff' }}></span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
