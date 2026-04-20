# ⚡ MetaMask Integration - Quick Reference Card

## What You Get

```
When user clicks "Connect MetaMask":
✅ MetaMask popup appears
✅ User clicks "Approve"
✅ Wallet address captured
✅ Balance fetched from blockchain
✅ Profile displays:
   • Wallet address (0x742d...5d3d)
   • ETH balance (1.5000 ETH)
   • Network (Ethereum Mainnet)
```

## 5-Minute Setup

### 1. Install MetaMask
Visit: https://metamask.io/download/

### 2. Start Dev Server
```bash
cd frontend
npm run dev
```

### 3. Go to Profile
- Login to app
- Navigate to `/profile`

### 4. Click Connect
- Click "Connect" next to MetaMask
- Approve in popup
- ✅ Done!

## Files & Locations

```
🔗 Wallet Connection:
   frontend/hooks/useMetaMaskWallet.ts

🎨 Wallet Logos:
   frontend/public/wallet-logos/*.svg

📄 Profile Page:
   frontend/app/profile/page.tsx

📖 Documentation:
   WEB3_INTEGRATION_README.md
   QUICK_START_WEB3.md
   IMPLEMENTATION_SUMMARY.md
```

## How to Use in Code

```tsx
import { useMetaMaskWallet, formatAddress } from '@/hooks/useMetaMaskWallet';

function MyComponent() {
  const { connect, wallet, isConnecting } = useMetaMaskWallet();
  
  if (wallet) {
    return (
      <div>
        <p>Address: {formatAddress(wallet.address)}</p>
        <p>Balance: {wallet.balanceFormatted} ETH</p>
      </div>
    );
  }
  
  return <button onClick={connect}>Connect</button>;
}
```

## Key Functions

| Function | Purpose |
|----------|---------|
| `connect()` | Connect to MetaMask |
| `disconnect()` | Disconnect wallet |
| `formatAddress(addr)` | Format address (0x742d...5d3d) |
| `isValidAddress(addr)` | Validate Ethereum address |

## Data You Get

```javascript
wallet = {
  address: "0x742d35Cc...",
  balanceFormatted: "1.5000",      // ETH
  balance: "1500000...",           // Wei
  chainId: 1,                       // Network ID
  chainName: "Ethereum Mainnet"    // Network name
}
```

## Networks Supported

| Network | Chain ID |
|---------|----------|
| Ethereum Mainnet | 1 |
| Sepolia Testnet | 11155111 |
| Polygon | 137 |
| BSC | 56 |
| Avalanche | 43114 |

## Common Commands

```bash
# Start dev server
npm run dev

# Build (increase memory if needed)
set NODE_OPTIONS=--max-old-space-size=8192
npm run build

# Run tests
npm test

# Check types
npm run type-check
```

## Wallet Logos Available

MetaMask • Phantom • Ethereum • Kraken
WalletConnect • Ledger • Trust Wallet
Coinbase • Argent • Rainbow • Solana

## Testing Checklist

- [ ] MetaMask installed
- [ ] Dev server running (`npm run dev`)
- [ ] Logged into profile
- [ ] Clicked "Connect"
- [ ] Approved in MetaMask popup
- [ ] See wallet address displayed
- [ ] See ETH balance displayed
- [ ] Switched accounts → updates auto
- [ ] Switched networks → Updates auto
- [ ] Clicked "Disconnect" → resets

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MetaMask not detected | Refresh page, enable extension |
| Balance shows 0 | Switch to Sepolia faucet: https://sepoliafaucet.com/ |
| Connection fails | Check internet, make sure MetaMask unlocked |
| Update to large build | `set NODE_OPTIONS=--max-old-space-size=8192` |

## Real-Time Features

✅ When user switches MetaMask account:
- Address automatically updates
- Balance automatically updates
- No page refresh needed

✅ When user switches MetaMask network:
- Chain name updates
- All info refreshes
- No page refresh needed

## Wallet Hook Props

```typescript
{
  connect: () => Promise<WalletInfo>  // Connect
  disconnect: () => void               // Disconnect
  wallet: WalletInfo | null            // Current wallet
  isConnecting: boolean                // Connecting state
  isConnected: boolean                 // Connected state
  error: string | null                 // Error message
  isMetaMaskAvailable: boolean         // MetaMask installed
}
```

## Example: Display Connected Wallet

```tsx
import { useMetaMaskWallet, formatAddress } from '@/hooks/useMetaMaskWallet';

export function WalletDisplay() {
  const { wallet, connect, disconnect } = useMetaMaskWallet();
  
  return (
    <div className="wallet-card">
      {wallet ? (
        <>
          <h3>Connected Wallet</h3>
          <p>Address: {formatAddress(wallet.address)}</p>
          <p>Balance: {wallet.balanceFormatted} ETH</p>
          <p>Network: {wallet.chainName}</p>
          <button onClick={disconnect}>Disconnect</button>
        </>
      ) : (
        <button onClick={connect}>Connect MetaMask</button>
      )}
    </div>
  );
}
```

## Full Documentation

📚 For complete details, see:
- `WEB3_INTEGRATION_README.md` - Full API reference
- `QUICK_START_WEB3.md` - Getting started guide
- `IMPLEMENTATION_SUMMARY.md` - Technical overview

## Test Networks

Get test ETH for Sepolia:
https://sepoliafaucet.com/

Or on Ethereum Mainnet:
Need actual ETH from exchange

## Performance Tips

🚀 Optimize build:
```bash
set NODE_OPTIONS=--max-old-space-size=8192
npm run build
```

🎯 Lean bundle by removing unused wagmi parts if needed

## Security ⚠️

✅ Safe:
- MetaMask-approved library patterns
- Industry-standard ethers.js
- No seed phrase handling
- Proper error catching

❌ Never:
- Share seed phrase
- Share private keys
- Store passwords
- Accept suspicious popups

## Next Steps

1. ✅ Install MetaMask
2. ✅ Start dev server
3. ✅ Test wallet connection
4. ✅ Verify balance displays
5. ⏭️ Add backend API integration
6. ⏭️ Add transaction history
7. ⏭️ Add Phantom (Solana) support

---

**That's it! Your MetaMask integration is ready to use! 🚀**
