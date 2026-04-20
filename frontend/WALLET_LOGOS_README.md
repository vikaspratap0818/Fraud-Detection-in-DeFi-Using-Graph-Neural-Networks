# Wallet Logos Implementation Guide

## Overview
This guide explains how the wallet logo system works in the SGU 2.0 application and how to add new wallets or modify existing ones.

## File Structure

### Logo Assets
All wallet logo SVG files are located in:
```
frontend/public/wallet-logos/
```

Current wallets:
- `metamask.svg` - MetaMask browser extension
- `ethereum.svg` - Ethereum mainnet wallet
- `phantom.svg` - Phantom Solana wallet
- `kraken.svg` - Kraken exchange wallet
- `walletconnect.svg` - WalletConnect protocol
- `ledger.svg` - Ledger hardware wallet
- `trustwallet.svg` - Trust Wallet mobile
- `coinbase.svg` - Coinbase Wallet
- `argent.svg` - Argent StarkNet wallet
- `rainbow.svg` - Rainbow multi-chain wallet
- `solana.svg` - Solana blockchain wallet

### Component
The wallet icon component is located at:
```
frontend/components/WalletIcon.tsx
```

## How It Works

### WalletIcon Component
Two variants are available:

1. **WalletIcon** (with Next.js Image optimization)
```tsx
import { WalletIcon } from '@/components/WalletIcon';

<WalletIcon 
  walletId="metamask"
  walletName="MetaMask"
  size={48}
  className="custom-class"
/>
```

2. **WalletIconStatic** (simpler, uses img tag)
```tsx
import { WalletIconStatic } from '@/components/WalletIcon';

<WalletIconStatic 
  walletId="phantom"
  size={48}
  className="bg-zinc-800 rounded-lg"
/>
```

## Adding a New Wallet

### Step 1: Create Logo SVG
1. Create a new SVG file in `frontend/public/wallet-logos/`
2. Name it: `{walletid}.svg` (lowercase)
3. Ensure the SVG is square (viewBox="0 0 200 200" recommended)
4. Use appropriate colors and styling

Example:
```svg
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Your SVG content here -->
</svg>
```

### Step 2: Update Wallet List
In `frontend/app/profile/page.tsx`, add the wallet to the state:

```tsx
const [wallets, setWallets] = useState<WalletProvider[]>([
  // ... existing wallets
  { 
    id: 'mynewwallet',           // Must match SVG filename
    name: 'My New Wallet',        // Display name
    type: 'Wallet Category',      // Type/category
    status: 'disconnected'        // Initial status
  }
]);
```

### Step 3: Update WalletProvider Interface (if needed)
The interface is already configured to work with new wallets:
```tsx
interface WalletProvider {
  id: string;                    // Maps to logo filename
  name: string;                  // Display name
  status: 'disconnected' | 'connecting' | 'connected';
  address?: string;              // Optional connected address
  type: string;                  // Wallet type/category
}
```

## Integration Points

### Profile Page
Currently integrated in:
- `frontend/app/profile/page.tsx` - Web3 Linked Wallets section

### Future Integration Points
You can also use `WalletIconStatic` in:
- Transaction feeds
- Network visualization
- Dashboard components
- Settings pages

Example usage:
```tsx
<WalletIconStatic 
  walletId={transaction.walletId}
  size={32}
  className="rounded-full"
/>
```

## Logo Design Guidelines

- **Format**: SVG (scalable)
- **Dimensions**: Square (1:1 aspect ratio)
- **ViewBox**: Recommended 200x200 or 300x300
- **Colors**: Use official wallet brand colors
- **Simplicity**: Ensure logo is recognizable at small sizes (32x32px)
- **Padding**: Include internal padding for better appearance when padded

## Best Practices

1. **Use SVG files** - They scale perfectly at any size
2. **Keep logos simple** - Avoid overly complex designs
3. **Maintain brand consistency** - Use official wallet logos
4. **Test at multiple sizes** - Verify logos look good at 32, 48, and 64px
5. **Use meaningful IDs** - Keep wallet IDs lowercase and memorable

## Styling

### Default Styling
Wallets are displayed with:
- 48px square container (adjustable)
- Rounded corners (8px border-radius)
- Subtle border with transparency
- Internal padding for logo breathing room

### Customization
```tsx
<WalletIconStatic 
  walletId="metamask"
  size={64}
  className="border-2 border-blue-500 rounded-full"
/>
```

## Troubleshooting

### Logo Not Displaying
1. Verify SVG file exists in `frontend/public/wallet-logos/`
2. Check filename matches walletId (lowercase)
3. Ensure SVG has valid viewBox attribute
4. Check browser console for 404 errors

### Logo Looks Blurry
- Use SVG format instead of PNG/JPG
- Verify the SVG has proper viewBox and scaling

### Logo Not Centered
- Adjust SVG internal padding
- Check ViewBox alignment
- Use transform attributes if needed

## Resources

- [SVG Best Practices](https://developer.mozilla.org/en-US/docs/Web/SVG)
- [Official Wallet Logos](https://icons.llamanode.com/)
- [Next.js Image Optimization](https://nextjs.org/docs/api-reference/next/image)
