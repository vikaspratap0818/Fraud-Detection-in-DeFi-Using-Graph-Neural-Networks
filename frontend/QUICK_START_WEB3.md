# Quick Start Guide - MetaMask Integration

## What Was Just Implemented ✨

Your application now has full **real MetaMask wallet integration**! Users can now:
- ✅ Connect their real MetaMask wallet
- ✅ See their ETH balance
- ✅ View their wallet address
- ✅ See which blockchain network they're connected to
- ✅ Disconnect their wallet
- ✅ Get real-time updates when switching accounts

## Prerequisites

### 1. Install MetaMask
- Visit: https://metamask.io/download/
- Install for your browser (Chrome, Firefox, Edge, Brave)
- Complete the setup (create wallet or import existing)

### 2. Test Network Setup (Optional but Recommended)
For development, use **Sepolia Testnet**:
1. Open MetaMask
2. Click network dropdown (top of extension)
3. Select "Sepolia"
4. Get test ETH from: https://sepoliafaucet.com/

## How to Test It

### Step 1: Start the Development Server
```bash
cd "c:\Users\lenovo\OneDrive\Desktop\SGU 2.0\frontend"
npm run dev
```

The app will run at: `http://localhost:3000`

### Step 2: Navigate to Profile
1. Log in to your account
2. Go to the Profile page (usually `/profile`)

### Step 3: Connect Your Wallet
1. Scroll to "Web3 Linked Wallets" section
2. Click the "Connect" button next to MetaMask
3. **MetaMask popup will appear** - approve the connection
4. ✅ Your wallet is now connected!
5. You'll see:
   - Your wallet address (shortened)
   - Your ETH balance
   - Your current network

## Features You Can Test

### Test 1: View Connected Wallet
- Click Connect → See your balance and address in the profile

### Test 2: Switch Accounts
- In MetaMask, switch to a different account
- **The profile updates automatically** to show new account's balance

### Test 3: Switch Networks
- In MetaMask, switch to different network (Polygon, BSC, etc.)
- The profile shows the new network name
- Balance updates for that network

### Test 4: Disconnect
- Click "Disconnect" to disconnect your wallet
- Button changes back to "Connect"

## File Structure

### New Files Created:
```
frontend/
├── hooks/
│   └── useMetaMaskWallet.ts          # ← Main wallet connection logic
│
├── components/
│   ├── WalletIcon.tsx                # ← Display wallet logos
│   └── Web3Provider.tsx              # ← Optional RainbowKit setup
│
├── types/
│   └── web3.d.ts                     # ← Web3 type definitions
│
├── public/wallet-logos/              # ← SVG logos
│   ├── metamask.svg
│   ├── phantom.svg
│   ├── ethereum.svg
│   └── ... (others)
│
└── WEB3_INTEGRATION_README.md        # ← Full documentation
```

### Modified Files:
- `app/profile/page.tsx` - Now uses real MetaMask integration

## Code Example: How It Works

```tsx
// In your profile page:
import { useMetaMaskWallet } from '@/hooks/useMetaMaskWallet';

function Profile() {
  const { connect, disconnect, wallet, isConnecting } = useMetaMaskWallet();
  
  return (
    <div>
      {wallet ? (
        <div>
          <p>Connected: {wallet.address}</p>
          <p>Balance: {wallet.balanceFormatted} ETH</p>
          <p>Network: {wallet.chainName}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connect} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </button>
      )}
    </div>
  );
}
```

## Supported Networks

The integration automatically detects:
- ✅ Ethereum Mainnet
- ✅ Sepolia Testnet (for testing)
- ✅ Polygon
- ✅ Binance Smart Chain
- ✅ Avalanche

New networks can be added easily in `useMetaMaskWallet.ts`.

## Common Issues & Solutions

### Issue: "MetaMask not detected"
**Solution:** 
- Refresh the page
- Make sure MetaMask extension is installed and enabled
- Try a different browser if needed

### Issue: Balance shows 0
**Solution:**
- You're on testnet with no test ETH
- Get test ETH from: https://sepoliafaucet.com/
- Or switch to mainnet (if you have real ETH there)

### Issue: Connection fails
**Solution:**
- Check your internet connection
- Make sure MetaMask is not locked
- Try refreshing the page
- Check browser console for error messages

### Issue: Build runs out of memory
**Solution:**
```bash
# Windows - Increase Node memory
set NODE_OPTIONS=--max-old-space-size=8192
npm run build
```

## Next Steps - Future Integrations

To add more wallet support:

1. **Phantom (Solana)**
   - Create `usePhantomWallet.ts` hook
   - Add Phantom logo SVG
   - Update profile page

2. **WalletConnect**
   - Already have partial setup in `components/Web3Provider.tsx`
   - Requires WalletConnect project ID
   - Add connection logic

3. **Transaction History**
   - Use Etherscan API
   - Display transaction logs
   - Add transaction search

## Security Reminders ⚠️

- **Never share your seed phrase** with anyone
- **Never share your private key**
- MetaMask extensions use industry-standard encryption
- Only connect on HTTPS websites
- Always double-check addresses before approving transactions

## Backend Integration

To connect this with your backend:

```tsx
// After wallet connection
if (wallet) {
  // Send to your API
  await fetch('/api/wallets/save', {
    method: 'POST',
    body: JSON.stringify({
      address: wallet.address,
      chainId: wallet.chainId,
      balance: wallet.balanceFormatted
    })
  });
}
```

## Testing Checklist

- [ ] MetaMask installed and set up
- [ ] Navigated to profile page
- [ ] Clicked "Connect" on MetaMask wallet
- [ ] Approved connection in popup
- [ ] See wallet address displayed
- [ ] See ETH balance displayed
- [ ] Switched accounts in MetaMask - profile updated
- [ ] Switched networks in MetaMask - profile updated
- [ ] Clicked "Disconnect" - wallet disconnected
- [ ] Connection persists on page reload

## Performance Tips

🚀 For faster builds:
```bash
# Use more memory
set NODE_OPTIONS=--max-old-space-size=8192

# Or increase incrementally
set NODE_OPTIONS=--max-old-space-size=6144
```

## Documentation

Full documentation available in:
- `WEB3_INTEGRATION_README.md` - Complete API reference
- `WALLET_LOGOS_README.md` - Logo system guide
- `useMetaMaskWallet.ts` - JSDoc comments with detailed explanations

## Support Resources

- MetaMask Docs: https://docs.metamask.io/
- Ethers.js Docs: https://docs.ethers.org/
- Ethereum Dev Docs: https://ethereum.org/en/developers/
- Sepolia Faucet: https://sepoliafaucet.com/

## Key Implementation Details

✅ **Real-time Updates**: Listeners for account/network changes
✅ **Automatic Cleanup**: Event listeners removed on unmount
✅ **Error Handling**: Graceful error messages
✅ **Type Safe**: Full TypeScript support
✅ **Performance**: Optimized to prevent memory leaks
✅ **Responsive**: Works on mobile and desktop

Enjoy your new Web3 integration! 🚀
