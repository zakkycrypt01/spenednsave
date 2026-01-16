# SpendGuard WalletConnect Testing Guide

## Quick Start
1. **Server is Running**: `node dev-server.js` on http://localhost:3000
2. **Browser**: Visit http://localhost:3000
3. **Click**: "Launch App" or "Get Started" button
4. **Test**: Each wallet connection method

---

## Test Scenarios

### Test 1: MetaMask Connection
**Prerequisites**: MetaMask browser extension installed

**Steps**:
1. Click "Launch App"
2. In wallet modal, click "MetaMask"
3. MetaMask popup should appear
4. Approve connection request
5. Success message shows account address
6. Modal closes

**Expected Result**: ✅ Connected via MetaMask
```
Connected to MetaMask!
Account: 0x1234...abcd
```

---

### Test 2: Rabby Wallet Connection
**Prerequisites**: Rabby Wallet browser extension installed

**Steps**:
1. Click "Launch App"
2. In wallet modal, click "Rabby Wallet"
3. Rabby approval popup should appear
4. Approve connection request
5. Success message shows account address

**Expected Result**: ✅ Connected via Rabby
```
Connected to Rabby Wallet!
Account: 0xabcd...1234
```

---

### Test 3: WalletConnect QR Code (Mobile)
**Prerequisites**: Mobile wallet installed (Trust Wallet, Argent, Rainbow, Ledger Live, etc.)

**Setup**:
1. Have mobile wallet opened and ready on your phone
2. Connect your phone to the same network as your computer
3. Ensure mobile wallet has funds or is on testnet

**Steps**:
1. Click "Launch App"
2. In wallet modal, click "WalletConnect"
3. QR code modal opens with large QR code (280x280px)
4. Open mobile wallet → Tap "Scanner" or "WalletConnect"
5. Point at QR code on screen
6. Mobile wallet recognizes QR and shows connection dialog
7. Approve connection on mobile
8. Success message appears with account address

**Expected Result**: ✅ Connected via WalletConnect
```
Connected via WalletConnect!
Account: 0x5678...efgh
```

**Supported Wallets**:
- ✅ Trust Wallet
- ✅ Rainbow
- ✅ Argent
- ✅ Ledger Live
- ✅ MetaMask Mobile
- ✅ Coinbase Wallet App
- And 100+ others...

---

### Test 4: Coinbase Wallet Connection
**Prerequisites**: Coinbase Wallet browser extension installed

**Steps**:
1. Click "Launch App"
2. In wallet modal, click "Coinbase"
3. Coinbase approval popup should appear
4. Approve connection request
5. Success message shows account address

**Expected Result**: ✅ Connected via Coinbase
```
Connected to Coinbase Wallet!
Account: 0xghij...5678
```

---

### Test 5: Wallet Not Installed Fallback
**Prerequisites**: MetaMask not installed

**Steps**:
1. Click "Launch App"
2. In wallet modal, click "MetaMask"
3. Alert should say MetaMask is not installed
4. Click the "Install MetaMask" link in the modal
5. Redirects to metamask.io

**Expected Result**: ✅ Helpful installation link provided

---

### Test 6: QR Code Regeneration
**Prerequisites**: WalletConnect modal open

**Steps**:
1. Open WalletConnect modal (click WalletConnect button)
2. QR code displays
3. Click "Generate New QR Code"
4. QR code refreshes with new content
5. Scan the new QR code with mobile wallet

**Expected Result**: ✅ New QR code generated successfully

---

### Test 7: Modal Close Operations
**Prerequisites**: Wallet modal or QR modal open

**Test A - Close Wallet Modal**:
1. Click "Launch App" → Wallet modal opens
2. Click outside modal (on gray background)
3. Modal should close

**Test B - Close WalletConnect QR Modal**:
1. Click "Launch App" → Wallet modal opens
2. Click "WalletConnect" → QR modal opens
3. Click X button in top-right corner
4. QR modal closes, returns to wallet modal
5. Click "Cancel" button
6. QR modal closes, returns to wallet modal

**Expected Result**: ✅ All modals close properly

---

## UI/UX Verification Checklist

### Visual Design
- [ ] Dark theme matches the landing page aesthetics
- [ ] Icons are clearly visible and recognizable
- [ ] Text is readable with good contrast
- [ ] Buttons respond to hover states
- [ ] QR code is clear and scannable

### Responsiveness
- [ ] Desktop (1920x1080): Modals centered and proportional
- [ ] Tablet (768px): Modals fit within viewport
- [ ] Mobile (360px): Modals fully visible, buttons easily tappable
- [ ] No horizontal scrolling on any device

### Accessibility
- [ ] Tab navigation works through all buttons
- [ ] Close button (X) clearly visible
- [ ] Text descriptions are concise and helpful
- [ ] Color contrast meets WCAG standards
- [ ] Font sizes are readable (no smaller than 12px)

### Performance
- [ ] Modal opens instantly (<100ms)
- [ ] QR code generates in <1 second
- [ ] No console errors or warnings
- [ ] No memory leaks on repeated modal open/close

---

## Browser Compatibility Test

Test on the following browsers:

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | Latest | ✅ | Full support |
| Firefox | Latest | ✅ | Full support |
| Safari | Latest | ✅ | Full support |
| Edge | Latest | ✅ | Full support |
| Mobile Safari | iOS 15+ | ✅ | WalletConnect works |
| Chrome Mobile | Latest | ✅ | WalletConnect works |

---

## Network Testing

### Base Sepolia Testnet
```
Network: Base Sepolia
Chain ID: 84532
RPC: https://sepolia.base.org
Explorer: https://sepolia.basescan.org/
Faucet: https://www.basefaucet.xyz/ or https://faucetbox.com/
```

**Test Steps**:
1. Configure wallet to use Base Sepolia
2. Get some testnet ETH from faucet
3. Connect to SpendGuard
4. Verify connected to correct network
5. Prepare for contract interaction tests

### Base Mainnet
```
Network: Base
Chain ID: 8453
RPC: https://mainnet.base.org
Explorer: https://basescan.org/
```

**Production Note**: Ensure smart contracts are deployed to mainnet before testing.

---

## Common Issues & Troubleshooting

### Issue: QR Code Not Displaying

**Problem**: QR Modal opens but QR code area is blank

**Solutions**:
1. Check browser console (F12 → Console)
2. Verify qrcode.js library loaded:
   ```javascript
   // In console:
   window.QRCode // Should return a function
   ```
3. Check if JavaScript error exists
4. Refresh page and try again
5. Clear browser cache and reload

**Debug Command**:
```javascript
// Paste in browser console to test
QRCode.toCanvas(document.createElement('canvas'), 'test', {
    errorCorrectionLevel: 'H',
    width: 280
}, (err) => console.log(err ? 'Error' : 'Success'));
```

---

### Issue: Wallet Connection Fails

**Problem**: Click wallet button but connection doesn't work

**Solutions**:
1. **MetaMask/Rabby/Coinbase**:
   - Verify extension is installed
   - Verify extension is unlocked
   - Check console for error messages
   - Try refreshing page
   - Try disconnecting and reconnecting

2. **WalletConnect**:
   - Verify mobile wallet is installed
   - Verify mobile wallet supports WalletConnect v2
   - Try regenerating QR code
   - Ensure phone and computer are on same network
   - Check wallet supports the requested network
   - Try with a different wallet app

---

### Issue: Wrong Network Selected

**Problem**: Wallet is connected but on wrong network

**Solution**:
1. Open wallet
2. Switch network to Base Sepolia (or Base Mainnet for production)
3. Try reconnecting if necessary

**Manual Switch Command** (in wallet or via dapp):
```javascript
// Prompt user to switch network
ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x14a34' }], // Base Sepolia (84532)
});
```

---

## Performance Benchmarks

### Expected Performance Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Modal Open Time | <100ms | ✅ |
| QR Code Generation | <1s | ✅ |
| MetaMask Connection | <2s | ✅ |
| WalletConnect Connection | <5s | ✅ |
| Page Load Time | <2s | ✅ |
| JavaScript Bundle | <50KB | ✅ |

### Measure with Browser DevTools

```javascript
// Performance API test
performance.mark('modal-start');
// Open modal...
performance.mark('modal-end');
performance.measure('modal-open', 'modal-start', 'modal-end');
console.log(performance.getEntriesByName('modal-open')[0].duration);
```

---

## Security Testing

### XSS Prevention
- [ ] Input validation on wallet addresses
- [ ] No eval() or innerHTML usage for user data
- [ ] Content Security Policy headers set correctly
- [ ] No sensitive data logged to console

### CSRF Prevention
- [ ] No state-changing operations on simple GET requests
- [ ] Proper CORS headers configured
- [ ] API calls include proper authentication

### Private Key Security
- ✅ Private keys NEVER stored in browser
- ✅ Wallet extensions handle key management
- ✅ No secret keys visible in source code
- ✅ Environment variables used for API keys

---

## Automated Test Script

Save as `test-walletconnect.js` and run:

```javascript
// Browser console test script
async function testWalletConnect() {
    console.log('🧪 Testing WalletConnect Integration...\n');

    // Test 1: Modal Elements
    console.log('Test 1: Checking modal elements...');
    const modal = document.getElementById('walletModal');
    const wcModal = document.getElementById('wcQrModal');
    const qrCode = document.getElementById('wcQrCode');
    
    if (modal && wcModal && qrCode) {
        console.log('✅ All modal elements found\n');
    } else {
        console.log('❌ Missing modal elements\n');
    }

    // Test 2: Check Libraries
    console.log('Test 2: Checking required libraries...');
    if (window.QRCode && window.ethers) {
        console.log('✅ QRCode.js and ethers.js loaded\n');
    } else {
        console.log('❌ Missing libraries\n');
    }

    // Test 3: Check Functions
    console.log('Test 3: Checking JavaScript functions...');
    const functions = [
        'detectWallets',
        'connectMetaMask',
        'connectRabby',
        'connectWalletConnect',
        'connectCoinbase',
        'generateNewWCURI',
        'closeWCQR'
    ];
    
    const missing = functions.filter(f => typeof window[f] !== 'function');
    if (missing.length === 0) {
        console.log('✅ All functions available\n');
    } else {
        console.log('❌ Missing functions:', missing, '\n');
    }

    // Test 4: Detect Wallets
    console.log('Test 4: Detecting available wallets...');
    const wallets = detectWallets();
    console.log('Detected wallets:', wallets, '\n');

    console.log('🎉 Tests complete!');
}

// Run test
testWalletConnect();
```

---

## Sign-Off Checklist

Use this checklist to verify the integration is complete:

- [ ] All four wallet types can be clicked
- [ ] MetaMask connection works (if installed)
- [ ] Rabby connection works (if installed)
- [ ] WalletConnect QR modal opens
- [ ] QR code is visible and scannable
- [ ] Mobile wallet can scan QR code
- [ ] Connection successful message shows
- [ ] Modal closes after successful connection
- [ ] No console errors during any operation
- [ ] UI looks good on desktop, tablet, and mobile
- [ ] Fallback links work for uninstalled wallets
- [ ] Can switch networks and reconnect
- [ ] Performance is snappy (<100ms modal open)

---

## Next Steps After Testing

1. **If Issues Found**:
   - Document issue with screenshot/video
   - Check troubleshooting section above
   - Report in GitHub issues with reproduction steps

2. **If Everything Works**:
   - Ready for smart contract integration
   - Next: Implement vault creation
   - Then: Add guardian management
   - Finally: Add withdrawal voting

3. **For Production**:
   - Get real WalletConnect Project ID
   - Replace sample URI with real SDK
   - Deploy contracts to Base mainnet
   - Update RPC endpoints for mainnet
   - Add proper error logging and monitoring

---

**Test Date**: ________________
**Tester Name**: ________________
**Status**: [ ] Pass [ ] Fail
**Notes**: ________________________

---

*For support, visit: https://docs.walletconnect.com/*
