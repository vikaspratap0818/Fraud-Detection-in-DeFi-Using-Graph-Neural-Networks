# Web3 Wallet Integration Guide

## Overview
This guide explains how the real MetaMask and Web3 wallet integration works in your SGU 2.0 application.

## Features

### ✅ Implemented
1. **MetaMask Connection** - Real wallet connection with login popup
2. **Balance Display** - Shows actual ETH balance in your profile
3. **Address Display** - Shows your connected wallet address (formatted)
4. **Network Detection** - Detects which blockchain you're connected to
5. **Auto-Updates** - Real-time updates when you switch accounts or networks
6. **Error Handling** - Alerts if MetaMask is not installed

### 🔄 Coming Soon
- Phantom (Solana) integration
- WalletConnect support
- Transaction history
- Multi-chain transactions

## How It Works

### File Structure

```
frontend/
├── hooks/
│   └── useMetaMaskWallet.ts     # Main wallet connection hook
├── components/
│   ├── WalletIcon.tsx           # Logo display
│   └── Web3Provider.tsx         # RainbowKit provider (optional)
├── types/
│   └── web3.d.ts                # TypeScript definitions
├── public/wallet-logos/         # SVG wallet logos
└── app/
    └── profile/
        └── page.tsx             # Updated with real wallet connection
```

## Usage

### Basic Implementation in Profile Page

```tsx
import { useMetaMaskWallet, formatAddress } from '@/hooks/useMetaMaskWallet';

function MyComponent() {
  const { connect, disconnect, wallet, isConnecting, isMetaMaskAvailable } = useMetaMaskWallet();

  const handleConnect = async () => {
    const result = await connect();
    if (result) {
      console.log('Connected wallet:', result);
    }
  };

  if (!isMetaMaskAvailable) {
    return <p>Please install MetaMask</p>;
  }

  if (wallet) {
    return (
      <div>
        <p>Connected: {formatAddress(wallet.address)}</p>
        <p>Balance: {wallet.balanceFormatted} ETH</p>
        <p>Network: {wallet.chainName}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return <button onClick={handleConnect}>Connect MetaMask</button>;
}
```

## Hook: useMetaMaskWallet

### Return Values

```typescript
{
  connect: async () => Promise<WalletInfo | null>  // Connect to MetaMask
  disconnect: () => void                            // Disconnect wallet
  wallet: WalletInfo | null                         // Current wallet info
  isConnecting: boolean                             // Connection in progress
  isConnected: boolean                              // Is connected
  error: string | null                              // Error message
  isMetaMaskAvailable: boolean                      // MetaMask installed
}
```

### WalletInfo Structure

```typescript
{
  address: string;              // Wallet address
  balance: string;              // Balance in Wei (BigInt)
  balanceFormatted: string;     // Balance in ETH (formatted)
  chainId: number;              // Network chain ID
  chainName: string;            // Network name (e.g., "Ethereum Mainnet")
}
```

## Utility Functions

### formatAddress(address: string, chars?: number): string
Formats a wallet address for display.

```tsx
formatAddress('0x742d35Cc6634C0532925a3b844Bc4e5D5d2d5d3d', 4)
// Returns: "0x742d...5d3d"
```

### isValidAddress(address: string): boolean
Checks if address is valid Ethereum address.

```tsx
isValidAddress('0x742d35Cc6634C0532925a3b844Bc4e5D5d2d5d3d') // true
isValidAddress('invalid') // false
```

## Installation

### Prerequisites
- MetaMask browser extension installed
- Windows/Mac/Linux with a modern browser

### Setup Steps

1. **Install MetaMask Extension**
   - Visit: https://metamask.io/download/
   - Choose your browser and install

2. **Create or Import Wallet**
   - Open MetaMask
   - Create new wallet or import existing one
   - Secure your seed phrase

3. **Test Connection**
   - Go to profile page
   - Click "Connect" on MetaMask wallet
   - Approve the connection in popup
   - You'll see your balance and address

## Example Wallet Data

When connected, you'll see:

```
Wallet: MetaMask
Type: Browser Extension
Network: Ethereum Mainnet
Balance: 2.5432 ETH
Address: 0x742d...5d3d
```

## Network Support

The hook supports these networks:

```
1: Ethereum Mainnet
11155111: Sepolia Testnet
137: Polygon
56: Binance Smart Chain
43114: Avalanche
```

Additional networks can be added to the `chainNames` object in `useMetaMaskWallet.ts`.

## Error Handling

### MetaMask Not Installed
- Show alert: "Please install MetaMask or another Web3 wallet"
- Provide download link to MetaMask

### User Rejected Connection
- Catches error gracefully
- Shows error message
- Allows retry

### Network Mismatch
- Detects when user switches networks
- Updates chain info in real-time
- Shows current network name

## Events & Listeners

The hook automatically listens to:

1. **Account Changes** - When user switches accounts
2. **Chain Changes** - When user switches networks
3. **Disconnection** - When user disconnects wallet

These are cleaned up on unmount to prevent memory leaks.

## Advanced Usage

### Monitor Account Changes

```tsx
useEffect(() => {
  if (wallet?.address) {
    console.log('New account:', wallet.address);
    // Call API to update user
  }
}, [wallet?.address]);
```

### Save Connected Address

```tsx
const handleSaveWallet = async () => {
  if (wallet) {
    await saveToDatabase({
      walletAddress: wallet.address,
      balance: wallet.balanceFormatted,
      chainId: wallet.chainId
    });
  }
};
```

## Troubleshooting

### Issue: "MetaMask not detected"
**Solution:** 
- Ensure MetaMask extension is installed
- Check if extension is enabled
- Try refreshing the page

### Issue: "Failed to fetch wallet info"
**Solution:**
- Check your internet connection
- Ensure you're on a supported network
- Check Ethereum RPC endpoint status

### Issue: Balance shows as 0
**Solution:**
- Create a transaction to your wallet
- MetaMask testnet is often used for development
- Use network switcher to check different networks

## Adding Additional Wallets

To add Phantom (Solana) or other wallets:

1. Install wallet browser extension
2. Create hook similar to `useMetaMaskWallet.ts`
3. Add detection logic in profile page
4. Create logo SVG in `public/wallet-logos/`
5. Add wallet to wallet list

Example structure:
```tsx
export function useSolanaWallet() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  // ... similar implementation for Phantom
}
```

## Security Notes

⚠️ **Important:**
- Never share your seed phrase
- Never share your private key
- Only connect on HTTPS websites
- MetaMask will never ask for your password
- Verify addresses before approving transactions

## Testing

### Test on Testnet
1. Switch to Sepolia testnet in MetaMask
2. Get test ETH from faucet: https://sepoliafaucet.com/
3. Connect and verify balance displays correctly

### Test Connection Flow
1. Connect wallet → balance displays
2. Switch account → info updates
3. Switch network → chain name updates
4. Disconnect → info clears

## Performance

The hook is optimized for:
- Minimal re-renders
- Efficient event listeners
- Automatic cleanup
- Memory leak prevention

## API Reference

See `useMetaMaskWallet.ts` for complete implementation details and JSDoc comments.

## Support

For issues or questions:
1. Check browser console for errors
2. Review MetaMask documentation
3. Check ethers.js documentation
4. Look at example in `app/profile/page.tsx`
