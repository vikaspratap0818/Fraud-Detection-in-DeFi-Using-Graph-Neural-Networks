'use client';

import Image from 'next/image';
import { CSSProperties } from 'react';

interface WalletIconProps {
  walletId: string;
  walletName: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export const WalletIcon = ({ 
  walletId, 
  walletName,
  size = 48,
  className = '',
  style = {}
}: WalletIconProps) => {
  const logoPath = `/wallet-logos/${walletId.toLowerCase()}.svg`;
  
  return (
    <div 
      className={`relative flex items-center justify-center rounded-lg border border-[rgba(255,255,255,0.1)] flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        ...style
      }}
    >
      <div className="relative w-full h-full">
        <Image
          src={logoPath}
          alt={walletName}
          fill
          className="object-contain p-1"
          priority
          onError={(e) => {
            // Fallback: display wallet name first letter if image fails
            const container = e.currentTarget.parentElement?.parentElement;
            if (container) {
              container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; font-weight: bold; font-size: 1.25rem; color: #00ffb4;">
                  ${walletName.charAt(0).toUpperCase()}
                </div>
              `;
            }
          }}
        />
      </div>
    </div>
  );
};

export const getWalletLogoPath = (walletId: string): string => {
  return `/wallet-logos/${walletId.toLowerCase()}.svg`;
};

export const WalletIconStatic = ({ 
  walletId, 
  size = 48,
  className = ''
}: Omit<WalletIconProps, 'walletName' | 'style'>) => {
  const logoPath = getWalletLogoPath(walletId);
  
  return (
    <div 
      className={`relative inline-flex items-center justify-center rounded-lg border border-[rgba(255,255,255,0.1)] flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <img
        src={logoPath}
        alt={walletId}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          padding: '4px'
        }}
      />
    </div>
  );
};
