'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Settings, BrainCircuit, Globe2, BellRing, Link2, Palette, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('model');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // App Toggles States
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [autoBlock, setAutoBlock] = useState(true);
  const [networkSync, setNetworkSync] = useState(true);
  const [themeMode, setThemeMode] = useState('dark');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  const tabs = [
    { id: 'model', icon: BrainCircuit, label: 'Model & Detection' },
    { id: 'blockchain', icon: Globe2, label: 'Blockchain Network' },
    { id: 'alerts', icon: BellRing, label: 'Alerting & Webhooks' },
    { id: 'api', icon: Link2, label: 'API Integrations' },
    { id: 'theme', icon: Palette, label: 'Appearance & Theme' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
            <Settings className="w-6 h-6 text-zinc-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-['Orbitron',monospace] text-[#e0fff8]">Application Settings</h1>
            <p className="text-sm font-medium text-zinc-400 mt-1">Configure global parameters, GNN inference levels, and deployment architectures.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Nav Sidebar */}
          <div className="col-span-1 space-y-2">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <div 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "p-3 rounded-lg border transition-colors flex items-center gap-3 cursor-pointer",
                    isActive 
                      ? "bg-[rgba(0,180,255,0.1)] border-[rgba(0,180,255,0.2)] text-[#00b4ff]"
                      : "border-transparent text-zinc-400 hover:text-[#e0fff8] hover:bg-zinc-800/30"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-bold text-sm tracking-wide">{tab.label}</span>
                </div>
              );
            })}
          </div>

          <div className="col-span-1 lg:col-span-3">
            <section className="card p-8 min-h-[500px] flex flex-col relative overflow-hidden">
              <div className="corner corner-tr" />
              <div className="corner corner-bl" />
              
              {/* Dynamic Settings Forms based on Active Tab */}
              <div className="flex-1 space-y-8">
                {activeTab === 'model' && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-lg font-bold font-['Orbitron',monospace] text-[#e0fff8] mb-6 flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-[#00b4ff]" /> Model & Detection Parameters
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="p-5 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h4 className="font-bold text-[#e0fff8]">GNN Confidence Threshold</h4>
                            <p className="text-xs text-zinc-500 mt-1">Minimum probability required to flag transactions as explicitly malicious.</p>
                          </div>
                          <span className="text-2xl font-['Orbitron',monospace] font-bold text-[#00ffb4]">{confidenceThreshold}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="50" max="99" 
                          value={confidenceThreshold} 
                          onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#00ffb4]"
                        />
                      </div>

                      <div className="p-5 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)] flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-[#e0fff8]">Automated Threat Mitigation</h4>
                          <p className="text-xs text-zinc-500 mt-1">Automatically blacklist identified Sybil addresses at the smart-contract layer.</p>
                        </div>
                        <button 
                          onClick={() => setAutoBlock(!autoBlock)}
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-colors duration-300",
                            autoBlock ? "bg-[#00ffb4]" : "bg-zinc-700"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300 shadow",
                            autoBlock ? "translate-x-7" : "translate-x-1"
                          )} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'blockchain' && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-lg font-bold font-['Orbitron',monospace] text-[#e0fff8] mb-6 flex items-center gap-2">
                      <Globe2 className="w-5 h-5 text-[#00b4ff]" /> Blockchain & Network Config
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="form-group" style={{ margin: 0, opacity: 1 }}>
                        <label>Primary RPC Endpoint (Ethereum Mainnet)</label>
                        <div className="input-wrap">
                          <input type="text" defaultValue="https://mainnet.infura.io/v3/YOUR-PROJECT-ID" className="font-mono text-sm leading-6 tracking-wide" />
                        </div>
                      </div>
                      
                      <div className="p-5 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)] flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-[#e0fff8]">Cross-chain Syncing</h4>
                          <p className="text-xs text-zinc-500 mt-1">Synchronize local datasets with Layer 2 graph updates (Arbitrum/Optimism).</p>
                        </div>
                        <button 
                          onClick={() => setNetworkSync(!networkSync)}
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-colors duration-300",
                            networkSync ? "bg-[#00ffb4]" : "bg-zinc-700"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300",
                            networkSync ? "translate-x-7" : "translate-x-1"
                          )} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'alerts' && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-lg font-bold font-['Orbitron',monospace] text-[#e0fff8] mb-6 flex items-center gap-2">
                      <BellRing className="w-5 h-5 text-[#00b4ff]" /> Alerting & Webhooks
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="form-group" style={{ margin: 0, opacity: 1 }}>
                        <label>Slack Webhook URL</label>
                        <div className="input-wrap">
                          <input type="text" placeholder="WEBHOOK_URL_PLACEHOLDER" className="font-mono text-sm tracking-wide" />
                        </div>
                      </div>
                      <div className="form-group" style={{ margin: 0, opacity: 1 }}>
                        <label>Discord Webhook URL</label>
                        <div className="input-wrap">
                          <input type="text" placeholder="https://discord.com/api/webhooks/..." className="font-mono text-sm tracking-wide" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'api' && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-lg font-bold font-['Orbitron',monospace] text-[#e0fff8] mb-6 flex items-center gap-2">
                      <Link2 className="w-5 h-5 text-[#00b4ff]" /> API & Integrations
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="form-group" style={{ margin: 0, opacity: 1 }}>
                        <label>REST API Bearer Token</label>
                        <div className="input-wrap">
                          <input type="password" defaultValue="gns-sk-9328409823094823904820984029" className="font-mono text-sm tracking-widest text-[#00ffb4]" disabled />
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">Use this token to interact with the backend modeling engine programmatically.</p>
                      </div>
                      
                      <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px', background: 'transparent', border: '1px solid rgba(0,255,180,0.5)', color: '#00ffb4', boxShadow: 'none' }}>
                        Regenerate Token
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'theme' && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-lg font-bold font-['Orbitron',monospace] text-[#e0fff8] mb-6 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-[#00b4ff]" /> Appearance
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        onClick={() => setThemeMode('dark')}
                        className={cn(
                          "p-6 rounded-xl border flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                          themeMode === 'dark' ? "bg-[rgba(0,255,180,0.05)] border-[#00ffb4] shadow-[0_0_20px_rgba(0,255,180,0.1)]" : "bg-black/20 border-zinc-800 hover:border-zinc-700"
                        )}
                      >
                        <div className="w-12 h-12 rounded-full bg-[#050b12] border border-[#00ffb4] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,180,0.2)]" />
                        <span className="font-bold text-[#e0fff8]">Neon Dark (Recommended)</span>
                      </div>
                      <div 
                        onClick={() => setThemeMode('light')}
                        className={cn(
                          "p-6 rounded-xl border flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                          themeMode === 'light' ? "bg-white border-[#00b4ff] shadow-[0_0_20px_rgba(0,180,255,0.1)]" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                        )}
                      >
                        <div className="w-12 h-12 rounded-full bg-white border border-zinc-300 flex items-center justify-center shadow" />
                        <span className="font-bold text-zinc-400">High Contrast Light</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Footer */}
              <div className="flex justify-end items-center gap-4 border-t border-[rgba(255,255,255,0.05)] pt-6 mt-8">
                {saveSuccess && (
                  <span className="text-xs font-bold text-[#00ffb4] uppercase tracking-widest flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" /> Global Settings Updated
                  </span>
                )}
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '12px 40px' }}
                >
                  {isSaving ? <span className="spinner border-t-[#050b12]" /> : 'Apply Configurations'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
