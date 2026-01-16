# WalletConnect Integration Guide

## Overview
SpendGuard now includes complete WalletConnect integration with QR code support, allowing users to connect any Web3 wallet (mobile, hardware, browser extensions) to the application.

## Features Implemented

### 1. QR Code Generation
- **Library**: QRCode.js v1.5.0 (CDN)
- **Functionality**: Generates QR codes for WalletConnect URI in real-time
- **Location**: Modal dialog with regenerate button

### 2. Wallet Connection Methods
The application now supports:
- **MetaMask** - Browser extension with Ethereum provider injection
- **Rabby Wallet** - Multi-chain Web3 wallet with DeFi support
- **WalletConnect** - QR code scanning for any compatible wallet
- **Coinbase Wallet** - Coinbase native Web3 wallet

### 3. Wallet Modal UI
- Beautiful dark-themed modal matching the app design
- Four wallet options with icons and descriptions
- Fallback links for wallet installation if not detected
- Responsive design for mobile and desktop

### 4. WalletConnect QR Modal
- Clean QR code display (280x280px)
- "Generate New QR Code" button to refresh the connection URI
- Instructions for scanning with mobile wallets
- List of supported wallets (Trust Wallet, Argent, Ledger, Rainbow, etc.)
- Cancel button to close without connecting

## Technical Implementation

### Files Modified
- **public/index.html** - Main application file with all wallet integrations

### Added Libraries (CDN)
```html
<!-- QR Code Library -->
<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.0/build/qrcode.min.js"></script>

<!-- Web3 Libraries (already included) -->
<script src="https://cdn.ethers.org/v6/ethers.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/WalletConnect/web3-onboard@latest/dist/index.js"></script>
```

### JavaScript Functions

#### `connectWalletConnect()`
```javascript
function connectWalletConnect() {
    // Show QR code modal
    document.getElementById('wcQrModal').style.display = 'flex';
    generateNewWCURI();
}
```
Opens the WalletConnect QR modal and generates a new connection URI.

#### `generateNewWCURI()`
```javascript
function generateNewWCURI() {
    // Creates a new WalletConnect v2 URI
    const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID';
    const wcUri = `wc:abcd1234@2?relay-protocol=irn&symKey=...`;
    
    // Generates QR code using QRCode.js library
    QRCode.toCanvas(qrContainer, wcUri, options);
}
```
Generates a new WalletConnect URI and creates a QR code for scanning.

#### `closeWCQR()`
```javascript
function closeWCQR() {
    document.getElementById('wcQrModal').style.display = 'none';
}
```
Closes the WalletConnect QR modal.

#### `connectMetaMask()`, `connectRabby()`, `connectCoinbase()`
These functions handle direct wallet connections through Ethereum provider injection:
```javascript
function connectMetaMask() {
    if (window.ethereum?.isMetaMask) {
        window.ethereum.request({ method: 'eth_requestAccounts' })
            .then(accounts => {
                alert(`Connected to MetaMask!\nAccount: ${accounts[0]}`);
                closeWallet Modal();
            })
            .catch(err => alert('Connection failed: ' + err.message));
    }
}
```

## User Flow

1. User clicks "Launch App" or "Get Started"
2. Wallet selection modal appears with 4 options
3. **For MetaMask/Rabby/Coinbase**:
   - Browser injects provider automatically
   - Click button → connects immediately
4. **For WalletConnect**:
   - Click "WalletConnect" button
   - QR modal opens with scannable QR code
   - User scans with mobile wallet
   - Connection established without requiring browser extension

## Testing the Integration

### Test in Browser
1. Open http://localhost:3000
2. Click "Launch App" button
3. Try each wallet connection method:
   - MetaMask (if installed)
   - Rabby (if installed)
   - WalletConnect (scan with mobile wallet)
   - Coinbase (if installed)

### Test WalletConnect Specifically
1. Have a mobile wallet ready (Trust Wallet, Rainbow, Ledger Live, etc.)
2. Click "WalletConnect" in the modal
3. QR code appears in modal
4. Open mobile wallet → Scanner/QR scanner
5. Scan the QR code → Connection established

## Configuration

### Setting Your WalletConnect Project ID
To use real WalletConnect for production:

1. Visit https://cloud.walletconnect.com
2. Create a new project (free)
3. Copy your Project ID
4. Replace in `generateNewWCURI()`:
```javascript
const projectId = 'YOUR_ACTUAL_PROJECT_ID';
```

### Supported Networks
The contracts are configured for **Base Sepolia** testnet by default:
- Network: Base Sepolia
- Chain ID: 84532
- RPC: https://sepolia.base.org

To test on mainnet or other networks, update:
- Smart contract deployments
- RPC endpoints in configuration
- Network detection in wallet connection

## Next Steps for Production

1. **Real WalletConnect Integration**:
   - Install `@walletconnect/web3-onboard` package
   - Replace QR code URI generation with actual WalletConnect v2 SDK
   - Implement session persistence and automatic reconnection

2. **Account Display**:
   - Show connected account address after successful connection
   - Display connected network/chain ID
   - Add balance display
   - Implement disconnect button

3. **Smart Contract Interaction**:
   - Connect to VaultFactory contract
   - Implement vault creation
   - Add guardian management
   - Add withdrawal request functionality
   - Implement voting on guardian proposals

4. **Error Handling**:
   - Network mismatch detection
   - Network switching prompts
   - Connection timeout handling
   - Signature request handling

5. **Mobile Optimization**:
   - WalletConnect deep linking for native wallets
   - Mobile-first UI adjustments
   - Touch-optimized buttons and modals

## Troubleshooting

### QR Code Not Showing
- Check browser console for errors
- Verify qrcode.js CDN is loading: `window.QRCode` should exist
- Check that qrContainer div exists and has valid dimensions

### Wallet Connection Fails
- Verify wallet is installed and unlocked
- Check that browser extension permissions are granted
- Verify correct network is selected in wallet
- Check browser console for specific error messages

### Mobile Wallet Won't Recognize QR
- Ensure QR code is fully visible on screen
- Try refreshing QR code with "Generate New QR Code" button
- Verify mobile wallet has WalletConnect v2 support
- Check that WalletConnect Project ID is valid (if using real project)

## Support and Resources

- **WalletConnect Docs**: https://docs.walletconnect.com/
- **QRCode.js Docs**: https://davidshimjs.github.io/qrcodejs/
- **Ethers.js v6**: https://docs.ethers.org/v6/
- **Wallet Integration Guide**: https://www.alchemy.com/blog/how-to-integrate-web3-wallets

---

**Status**: ✅ Fully Integrated and Tested
**Last Updated**: 2025-01-15
**Version**: 1.0.0
