'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Maximize2, RefreshCw, ZoomIn, ZoomOut, Info, Network } from 'lucide-react';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export const GraphVisualizer = ({ data }: { data: any }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [mounted, setMounted] = useState(false);

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const handleZoomIn = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() * 1.2, 500);
  };

  const handleZoomOut = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() * 0.8, 500);
  };

  const handleResetView = () => {
    if (fgRef.current) fgRef.current.zoomToFit(500, 100);
  };

  if (!mounted) return <div className="card h-[600px]" />;

  return (
    <div className="card h-[600px] flex flex-col overflow-hidden relative group pt-0">
      <div className="p-4 border-b border-[rgba(0,255,180,0.15)] flex items-center justify-between bg-[#08121c]/60 backdrop-blur-md z-1">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgba(0,180,255,0.1)] rounded-lg border border-[rgba(0,180,255,0.2)]">
            <RefreshCw className="w-4 h-4 text-[#00b4ff] cursor-pointer hover:rotate-180 transition-transform duration-500" onClick={handleResetView} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#e0fff8] font-['Orbitron',monospace] tracking-wider">GNN Topology Explorer</h3>
            <p className="text-[9px] text-[#00ffb4]/70 font-bold uppercase tracking-widest mt-0.5">Multi-hop Analysis • Layer-3</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleZoomIn} className="p-2 bg-[rgba(0,255,180,0.05)] border border-[rgba(0,255,180,0.1)] hover:bg-[rgba(0,255,180,0.1)] rounded text-[#00ffb4] transition-all"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={handleZoomOut} className="p-2 bg-[rgba(0,255,180,0.05)] border border-[rgba(0,255,180,0.1)] hover:bg-[rgba(0,255,180,0.1)] rounded text-[#00ffb4] transition-all"><ZoomOut className="w-4 h-4" /></button>
          <button className="p-2 bg-[rgba(0,255,180,0.05)] border border-[rgba(0,255,180,0.1)] hover:bg-[rgba(0,255,180,0.1)] rounded text-[#00ffb4] transition-all ml-2"><Maximize2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 bg-transparent relative mix-blend-screen">
        <ForceGraph2D
          ref={fgRef}
          graphData={data}
          width={dimensions.width}
          height={dimensions.height}
          nodeLabel="id"
          nodeColor={(node: any) => node.risk === 1 ? '#ef4444' : '#00ffb4'}
          nodeRelSize={1}
          nodeVal={5}
          linkColor={() => 'rgba(0,255,180,0.15)'}
          linkWidth={1}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleWidth={1}
          linkDirectionalParticleColor={() => 'rgba(0,180,255,0.5)'}
          backgroundColor="rgba(5, 11, 18, 0.4)"
          cooldownTicks={100}
        />

        <div className="absolute bottom-6 left-6 p-4 bg-[#08121c]/80 backdrop-blur-xl border border-[rgba(0,255,180,0.2)] rounded-xl z-10 space-y-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <h4 className="text-[10px] font-bold text-[#00ffb4] uppercase tracking-widest mb-3 flex items-center gap-2 font-['Orbitron',monospace]">
            <Network className="w-3 h-3" /> Graph Legend
          </h4>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="text-xs text-zinc-300 font-medium font-['DM_Sans',sans-serif]">Fraud Ring (Sybil)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00ffb4] shadow-[0_0_8px_rgba(0,255,180,0.5)]" />
            <span className="text-xs text-zinc-300 font-medium font-['DM_Sans',sans-serif]">Verified Entity</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
            <span className="text-xs text-zinc-300 font-medium font-['DM_Sans',sans-serif]">Standard Wallet</span>
          </div>
        </div>
      </div>
    </div>
  );
};
