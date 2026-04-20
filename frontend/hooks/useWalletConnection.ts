'use client';

import { useCallback } from 'react';
import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export interface ConnectedWallet {
  id: string;
  name: string;
  address: string;
  balance: string;
  balanceFormatted?: string;
  chainId?: number;
  isConnected: boolean;
}

export function useWalletConnection() {
  const account = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({
    address: account.address,
  });

  const connectWallet = useCallback(
    (walletId: string) => {
      // Connect using the injected connector (MetaMask, etc)
      if (window?.ethereum) {
        connect({ connector: injected() });
      } else {
        console.error('No Web3 wallet detected');
        alert('Please install MetaMask or another Web3 wallet');
      }
    },
    [connect]
  );

  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const getConnectedWalletInfo = useCallback((): ConnectedWallet | null => {
    if (!account.address) {
      return null;
    }

    return {
      id: account.connector?.id || 'unknown',
      name: account.connector?.name || 'Unknown Wallet',
      address: account.address,
      balance: balanceData?.value?.toString() || '0',
      balanceFormatted: balanceData?.formatted || '0',
      chainId: account.chainId,
      isConnected: account.isConnected,
    };
  }, [account.address, account.connector, account.chainId, account.isConnected, balanceData]);

  return {
    connectWallet,
    disconnectWallet,
    walletInfo: getConnectedWalletInfo(),
    isConnected: account.isConnected,
    address: account.address,
    isConnecting: account.isConnecting,
    balance: balanceData,
  };
}

/**
 * Hook to detect if a specific wallet is available
 * Checks if MetaMask, Phantom, or other injected wallets are available
 */
export function useWalletAvailability() {
  const isMetaMaskAvailable = useCallback(() => {
    return typeof window !== 'undefined' && window?.ethereum?.isMetaMask;
  }, []);

  const isPhantomAvailable = useCallback(() => {
    return typeof window !== 'undefined' && window?.phantom?.solana?.isPhantom;
  }, []);

  const isWalletConnectSupported = useCallback(() => {
    return true; // WalletConnect is always available
  }, []);

  return {
    isMetaMaskAvailable: isMetaMaskAvailable(),
    isPhantomAvailable: isPhantomAvailable(),
    isWalletConnectSupported: isWalletConnectSupported(),
  };
}

/**
 * Hook to format wallet address for display
 */
export function useFormattedAddress(address?: string) {
  return {
    short: address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : null,
    full: address,
  };
}

/**
 * Hook to convert Wei to ETH or other token amounts
 */
export function useFormatBalance(weiAmount?: string | bigint, decimals: number = 18) {
  if (!weiAmount) return '0';
  
  const amount = BigInt(weiAmount);
  const divisor = BigInt(10 ** decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  const formatted = `${integerPart}.${fractionalPart.toString().padStart(decimals, '0')}`;
  return formatted;
}
