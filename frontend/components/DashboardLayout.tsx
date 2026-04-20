'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Network, 
  Settings, 
  Search, 
  ShieldCheck, 
  Activity,
  LogOut,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';
import ParticleCanvas from '@/components/ParticleCanvas';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SidebarItem = ({ icon: Icon, label, active = false, href, onClick }: { icon: any, label: string, active?: boolean, href?: string, onClick?: () => void }) => {
  const content = (
    <div 
      className={cn(
        "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-200 rounded-lg group",
        active 
          ? "bg-[rgba(0,255,180,0.1)] text-[#00ffb4] border border-[rgba(0,255,180,0.2)]" 
          : "text-zinc-400 hover:text-[#00ffb4] hover:bg-[rgba(0,255,180,0.05)] border border-transparent"
      )}
      onClick={onClick}
    >
      <Icon className={cn("w-5 h-5", active ? "text-[#00ffb4]" : "group-hover:text-[#00ffb4]")} />
      <span className="font-medium font-['DM_Sans',sans-serif]">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00ffb4] shadow-[0_0_8px_#00ffb4]" />}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
};

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <>
      <ParticleCanvas />

      {/* Reusing login-root to get the radial glows */}
      <div className="login-root" style={{ padding: 0, alignItems: 'stretch' }}>
        <div className="flex w-full h-screen z-10 relative">
          {/* Sidebar */}
          <aside className="w-64 border-r border-[#00ffb4]/20 flex flex-col bg-[#08121c]/80 backdrop-blur-2xl">
            <div className="p-6 flex items-center gap-3">
              <div className="logo-hex w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ffb4] to-[#00b4ff] flex items-center justify-center flex-shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                <ShieldCheck className="w-4 h-4 text-[#030d14]" strokeWidth={2.5} />
              </div>
              <span className="font-['Orbitron',monospace] text-base font-bold text-[#e0fff8] leading-tight">
                GNN <span className="text-[#00ffb4] block text-[9px] uppercase tracking-widest font-normal">Guard</span>
              </span>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
              <SidebarItem href="/" icon={LayoutDashboard} label="Dashboard" active={pathname === '/'} />
              <SidebarItem href="/alerts" icon={AlertTriangle} label="Live Alerts" active={pathname === '/alerts'} />
              <SidebarItem href="/network" icon={Network} label="Network Explorer" active={pathname === '/network'} />
              <SidebarItem href="/settings" icon={Settings} label="Settings" active={pathname === '/settings'} />
            </nav>

            <div className="p-4 border-t border-[#00ffb4]/20">
              <SidebarItem icon={LogOut} label="Logout" onClick={() => signOut({ callbackUrl: '/login' })} />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            {/* Top Navbar */}
            <header className="h-16 border-b border-[#00ffb4]/20 flex items-center justify-between px-8 bg-[#08121c]/60 backdrop-blur-md z-10">
              <div className="flex-1 max-w-xl">
                <div className="input-wrap w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,255,180,0.6)] z-10" />
                  <input 
                    type="text" 
                    placeholder="Search wallet address, tx hash, or entity..."
                    style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(0,255,180,0.05)] border border-[rgba(0,255,180,0.2)] rounded-full">
                  <Activity className="w-4 h-4 text-[#00ffb4]" />
                  <span className="text-xs font-mono text-[#00ffb4] font-medium">Nodes: 14.2k</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="relative cursor-pointer transition-transform hover:scale-110">
                    <Bell className="w-5 h-5 text-zinc-400 hover:text-[#00ffb4] transition-colors" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#050b12] animate-pulse" />
                  </div>
                  
                  <Link href="/profile" className="flex items-center gap-3 pl-6 border-l border-[rgba(255,255,255,0.05)] cursor-pointer group transition-transform hover:translate-x-1">
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-bold transition-colors",
                        pathname === '/profile' ? "text-[#00ffb4]" : "text-[#e0fff8] group-hover:text-[#00ffb4]"
                      )}>
                        {session?.user?.name || 'Administrator'}
                      </p>
                      <p className="text-xs text-zinc-500 font-medium">{session?.user?.email || 'System Ops'}</p>
                    </div>
                    <div className={cn(
                      "w-10 h-10 rounded-xl bg-zinc-800 border transition-all flex items-center justify-center font-['Orbitron',monospace] font-bold shadow-lg",
                      pathname === '/profile' 
                        ? "border-[#00ffb4] text-[#00ffb4] shadow-[0_0_15px_rgba(0,255,180,0.2)]" 
                        : "border-[rgba(255,255,255,0.1)] text-[#00ffb4] group-hover:border-[#00ffb4] group-hover:shadow-[0_0_15px_rgba(0,255,180,0.2)]"
                    )}>
                      {session?.user?.name ? session.user.name[0].toUpperCase() : 'A'}
                    </div>
                  </Link>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {children}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};
