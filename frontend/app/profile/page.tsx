'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useSession } from 'next-auth/react';
import { User, Wallet, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WalletIconStatic } from '@/components/WalletIcon';
import { useMetaMaskWallet, formatAddress } from '@/hooks/useMetaMaskWallet';

interface WalletProvider {
  id: string;
  name: string;
  status: 'disconnected' | 'connecting' | 'connected';
  address?: string;
  type: string;
  balance?: string;
  chainName?: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { connect, disconnect, wallet, isConnecting, isMetaMaskAvailable, error } = useMetaMaskWallet();
  
  const [profileName, setProfileName] = useState(session?.user?.name || '');
  const [profileEmail, setProfileEmail] = useState(session?.user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [connectedWallets, setConnectedWallets] = useState<Record<string, WalletProvider>>({});

  const [wallets, setWallets] = useState<WalletProvider[]>([
    { id: 'metamask', name: 'MetaMask', type: 'Browser Extension', status: 'disconnected' },
    { id: 'ethereum', name: 'Ethereum Wallet', type: 'Hardware / Mobile', status: 'disconnected' },
    { id: 'phantom', name: 'Phantom', type: 'Solana', status: 'disconnected' },
    { id: 'kraken', name: 'Kraken Wallet', type: 'Multi-chain Defi', status: 'disconnected' },
    { id: 'walletconnect', name: 'WalletConnect', type: 'Multi-chain Protocol', status: 'disconnected' },
    { id: 'trustwallet', name: 'Trust Wallet', type: 'Mobile Wallet', status: 'disconnected' },
    { id: 'coinbase', name: 'Coinbase Wallet', type: 'Exchange Wallet', status: 'disconnected' }
  ]);

  // Update MetaMask wallet in the list
  useEffect(() => {
    if (wallet) {
      setConnectedWallets(prev => ({
        ...prev,
        metamask: {
          id: 'metamask',
          name: 'MetaMask',
          type: 'Browser Extension',
          status: 'connected' as const,
          address: wallet.address,
          balance: wallet.balanceFormatted,
          chainName: wallet.chainName
        }
      }));
      
      setWallets(prev => prev.map(w => 
        w.id === 'metamask' 
          ? { 
              ...w, 
              status: 'connected' as const, 
              address: wallet.address,
              balance: wallet.balanceFormatted,
              chainName: wallet.chainName
            }
          : w
      ));
    }
  }, [wallet]);

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
  };

  const handleConnectWallet = async (id: string) => {
    if (id === 'metamask') {
      if (!isMetaMaskAvailable) {
        alert('MetaMask is not installed. Please install it first.');
        return;
      }
      await connect();
    } else {
      // For other wallets, show a placeholder message
      alert(`${wallets.find(w => w.id === id)?.name} wallet connection coming soon!`);
    }
  };

  const handleDisconnectWallet = (id: string) => {
    if (id === 'metamask') {
      disconnect();
      setWallets(prev => prev.map(w => 
        w.id === 'metamask' 
          ? { ...w, status: 'disconnected' as const, address: undefined, balance: undefined }
          : w
      ));
    }
  };

  const activeLetter = profileName ? profileName.charAt(0).toUpperCase() : (session?.user?.name?.charAt(0).toUpperCase() || '?');

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-[rgba(0,255,180,0.1)] rounded-xl border border-[rgba(0,255,180,0.2)]">
            <User className="w-6 h-6 text-[#00ffb4]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-['Orbitron',monospace] text-[#e0fff8]">Developer Profile</h1>
            <p className="text-sm font-medium text-zinc-400 mt-1">Manage your identity and bind decentralized wallets to your monitoring layer.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Nav Sidebar (visual only) */}
          <div className="col-span-1 space-y-2">
            <div className="p-3 rounded-lg bg-[rgba(0,255,180,0.1)] border border-[rgba(0,255,180,0.2)] flex items-center gap-3 text-[#00ffb4]">
              <User className="w-4 h-4" />
              <span className="font-bold text-sm tracking-wide">Developer Profile</span>
            </div>
            <div className="p-3 rounded-lg hover:bg-zinc-800/30 border border-transparent transition-colors flex items-center gap-3 text-zinc-400 cursor-pointer">
              <Wallet className="w-4 h-4" />
              <span className="font-bold text-sm tracking-wide">Web3 Connections</span>
            </div>
            <div className="p-3 rounded-lg hover:bg-zinc-800/30 border border-transparent transition-colors flex items-center gap-3 text-zinc-400 cursor-pointer">
              <Shield className="w-4 h-4" />
              <span className="font-bold text-sm tracking-wide">Security & 2FA</span>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2 space-y-8">
            {/* Profile Edit Card */}
            <section className="card p-8">
              <div className="corner corner-tr" />
              <div className="corner corner-bl" />
              
              <h2 className="text-lg font-bold font-['Orbitron',monospace] text-[#e0fff8] mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#00ffb4]" /> Profile Information
              </h2>

              <div className="flex flex-col sm:flex-row gap-8 items-start mb-8">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-2xl bg-[#08121c] border-2 border-[rgba(0,255,180,0.2)] group-hover:border-[#00ffb4] flex items-center justify-center font-['Orbitron',monospace] text-4xl text-[#00ffb4] shadow-[0_0_20px_rgba(0,255,180,0.1)] transition-all">
                    {activeLetter}
                  </div>
                  <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Change</span>
                  </div>
                </div>

                <div className="flex-1 space-y-5 w-full">
                  <div className="form-group" style={{ margin: 0, opacity: 1, animation: 'none' }}>
                    <label>Display Name</label>
                    <div className="input-wrap">
                      <input 
                        type="text" 
                        value={profileName} 
                        onChange={(e) => setProfileName(e.target.value)}
                        className="bg-[rgba(0,255,180,0.02)] border-[rgba(0,255,180,0.2)] focus:border-[#00ffb4]"
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0, opacity: 1, animation: 'none' }}>
                    <label>Email Address</label>
                    <div className="input-wrap">
                      <input 
                        type="email" 
                        value={profileEmail} 
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="bg-[rgba(0,255,180,0.02)] border-[rgba(0,255,180,0.2)] focus:border-[#00ffb4]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-4 border-t border-[rgba(0,255,180,0.1)] pt-6">
                {saveSuccess && (
                  <span className="text-xs font-bold text-[#00ffb4] uppercase tracking-widest flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" /> Saved Successfully
                  </span>
                )}
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '12px 32px' }}
                >
                  {isSaving ? <span className="spinner border-t-[#050b12]" /> : 'Save Changes'}
                </button>
              </div>
            </section>

            {/* Wallets Connection Card */}
            <section className="card p-8 bg-[rgba(0,180,255,0.02)] border-[rgba(0,180,255,0.2)]">
              <h2 className="text-lg font-bold font-['Orbitron',monospace] text-[#e0fff8] mb-2 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#00b4ff]" /> Web3 Linked Wallets
              </h2>
              <p className="text-sm text-zinc-400 font-medium mb-6">Connect your decentralized wallets to enable automated GNN active-monitoring and threat mitigation protocols for your assets.</p>

              {!isMetaMaskAvailable && (
                <div className="p-4 mb-6 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-yellow-500">MetaMask Not Detected</p>
                    <p className="text-xs text-yellow-400 mt-1">Install MetaMask browser extension to connect your wallet.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 mb-6 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm font-bold text-red-500">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {wallets.map((w) => (
                  <div key={w.id} className="p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)] flex items-center justify-between hover:border-[rgba(0,180,255,0.3)] transition-colors group">
                    <div className="flex items-center gap-4">
                      <WalletIconStatic 
                        walletId={w.id}
                        size={48}
                        className="bg-[rgba(255,255,255,0.05)]"
                      />
                      <div>
                        <h4 className="font-bold text-[#e0fff8]">{w.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{w.type}</p>
                        {w.chainName && <p className="text-[10px] text-[#00b4ff] mt-1">{w.chainName}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {w.status === 'connected' && w.address && (
                        <div className="text-right hidden sm:block">
                          <p className="text-[9px] text-[#00ffb4] uppercase tracking-widest font-bold">Balance</p>
                          <p className="text-xs font-bold text-[#00ffb4] mt-1">{w.balance || '0'} ETH</p>
                          <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold mt-2">Address</p>
                          <p className="text-xs font-mono text-zinc-300">{formatAddress(w.address)}</p>
                        </div>
                      )}

                      {w.status === 'connected' ? (
                        <button 
                          onClick={() => handleDisconnectWallet(w.id)}
                          className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleConnectWallet(w.id)}
                          disabled={isConnecting}
                          className={cn(
                            "px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                            isConnecting
                              ? "bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-wait"
                              : "bg-[rgba(0,180,255,0.1)] text-[#00b4ff] border border-[rgba(0,180,255,0.3)] hover:bg-[rgba(0,180,255,0.2)] hover:shadow-[0_0_15px_rgba(0,180,255,0.2)]"
                          )}
                        >
                          {isConnecting 
                            ? <span className="flex items-center gap-2"><div className="spinner w-3 h-3 border-zinc-500 border-t-zinc-200" /> Connecting...</span>
                            : 'Connect'
                          }
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
