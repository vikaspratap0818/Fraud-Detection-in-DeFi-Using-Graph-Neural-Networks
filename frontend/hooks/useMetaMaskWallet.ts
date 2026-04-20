'use client';

import { useCallback, useEffect, useState } from 'react';
import { BrowserProvider, ethers } from 'ethers';

export interface WalletInfo {
  address: string;
  balance: string;
  balanceFormatted: string;
  chainId: number;
  chainName: string;
}

export function useMetaMaskWallet() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const newProvider = new BrowserProvider(window.ethereum);
      setProvider(newProvider);
    }
  }, []);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (!provider) return;
      try {
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setIsConnected(true);
          await fetchWalletInfo(provider, accounts[0].address);
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    };

    checkConnection();
  }, [provider]);

  // Fetch wallet info (balance, chain, etc)
  const fetchWalletInfo = async (prov: BrowserProvider, address: string) => {
    try {
      const balance = await prov.getBalance(address);
      const network = await prov.getNetwork();
      
      const formattedBalance = ethers.formatEther(balance);
      
      const chainNames: Record<number, string> = {
        1: 'Ethereum Mainnet',
        11155111: 'Sepolia Testnet',
        137: 'Polygon',
        56: 'Binance Smart Chain',
        43114: 'Avalanche',
      };

      const walletData: WalletInfo = {
        address,
        balance: balance.toString(),
        balanceFormatted: Number(formattedBalance).toFixed(4),
        chainId: Number(network.chainId),
        chainName: chainNames[Number(network.chainId)] || `Chain ${network.chainId}`,
      };

      setWallet(walletData);
      setError(null);
      return walletData;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch wallet info';
      setError(errorMsg);
      console.error('Error fetching wallet info:', err);
    }
  };

  // Connect wallet
  const connect = useCallback(async () => {
    if (!provider) {
      setError('MetaMask not installed');
      return null;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        setIsConnected(true);
        const walletInfo = await fetchWalletInfo(provider, accounts[0]);
        setIsConnecting(false);
        return walletInfo;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMsg);
      setIsConnecting(false);
      console.error('Error connecting wallet:', err);
      return null;
    }
  }, [provider]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setWallet(null);
    setIsConnected(false);
    setError(null);
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!provider) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        setWallet(null);
        setIsConnected(false);
      } else {
        await fetchWalletInfo(provider, accounts[0]);
      }
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum?.off('accountsChanged', handleAccountsChanged);
    };
  }, [provider]);

  // Listen for chain changes
  useEffect(() => {
    if (!provider) return;

    const handleChainChanged = async () => {
      if (wallet) {
        await fetchWalletInfo(provider, wallet.address);
      }
    };

    window.ethereum?.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.off('chainChanged', handleChainChanged);
    };
  }, [provider, wallet]);

  return {
    connect,
    disconnect,
    wallet,
    isConnecting,
    isConnected,
    error,
    isMetaMaskAvailable: typeof window !== 'undefined' && window.ethereum?.isMetaMask,
  };
}

/**
 * Format wallet address for display
 */
export function formatAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Check if address is valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}
