# Contract Deployment Guide

## Prerequisites

1. **Install Hardhat**:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

2. **Initialize Hardhat** (if not already done):
```bash
npx hardhat init
```
Select "Create a TypeScript project" and install dependencies.

3. **Install OpenZeppelin Contracts**:
```bash
npm install @openzeppelin/contracts
```

## Deployment Steps

### 1. Configure Hardhat for Base Sepolia

Create or update `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY || ""],
      chainId: 84532,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
};

export default config;
```

### 2. Set Environment Variables

Create `.env` file:
```
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
```

**IMPORTANT**: Add `.env` to `.gitignore`!

### 3. Create Deployment Script

Create `scripts/deploy.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying SpendGuard contracts to Base Sepolia...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy GuardianSBT
  console.log("\n1. Deploying GuardianSBT...");
  const GuardianSBT = await ethers.getContractFactory("GuardianSBT");
  const guardianSBT = await GuardianSBT.deploy();
  await guardianSBT.waitForDeployment();
  const guardianSBTAddress = await guardianSBT.getAddress();
  console.log("✅ GuardianSBT deployed to:", guardianSBTAddress);

  // Deploy SpendVault with quorum of 2
  console.log("\n2. Deploying SpendVault...");
  const SpendVault = await ethers.getContractFactory("SpendVault");
  const spendVault = await SpendVault.deploy(
    guardianSBTAddress,
    2 // Quorum: 2 of 3 guardians required
  );
  await spendVault.waitForDeployment();
  const spendVaultAddress = await spendVault.getAddress();
  console.log("✅ SpendVault deployed to:", spendVaultAddress);

  // Summary
  console.log("\n📋 Deployment Summary:");
  console.log("====================");
  console.log("GuardianSBT:", guardianSBTAddress);
  console.log("SpendVault:", spendVaultAddress);
  console.log("\n⚠️  IMPORTANT: Update lib/contracts.ts with these addresses!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 4. Deploy Contracts

```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

### 5. Update Frontend Configuration

After deployment, update `lib/contracts.ts`:

```typescript
export const CONTRACTS_BASE_SEPOLIA = {
  GuardianSBT: '0xYOUR_GUARDIAN_SBT_ADDRESS',
  SpendVault: '0xYOUR_SPEND_VAULT_ADDRESS',
} as const;
```

### 6. Verify Contracts (Optional but Recommended)

```bash
npx hardhat verify --network baseSepolia GUARDIAN_SBT_ADDRESS

npx hardhat verify --network baseSepolia SPEND_VAULT_ADDRESS "GUARDIAN_SBT_ADDRESS" "2"
```

## Testing Deployment

### 1. Add Test Guardians

Create `scripts/addGuardians.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  const guardianSBTAddress = "YOUR_GUARDIAN_SBT_ADDRESS";
  const guardianAddresses = [
    "0xGuardian1Address",
    "0xGuardian2Address",
    "0xGuardian3Address",
  ];

  const GuardianSBT = await ethers.getContractAt("GuardianSBT", guardianSBTAddress);

  for (const address of guardianAddresses) {
    console.log(`Adding guardian: ${address}`);
    const tx = await GuardianSBT.mint(address);
    await tx.wait();
    console.log("✅ Guardian added");
  }
}

main();
```

Run:
```bash
npx hardhat run scripts/addGuardians.ts --network baseSepolia
```

### 2. Test Deposit

```typescript
import { ethers } from "hardhat";

async function main() {
  const spendVaultAddress = "YOUR_SPEND_VAULT_ADDRESS";
  const SpendVault = await ethers.getContractAt("SpendVault", spendVaultAddress);

  // Deposit 0.01 ETH
  const tx = await SpendVault.deposit(
    ethers.ZeroAddress, // ETH
    ethers.parseEther("0.01"),
    { value: ethers.parseEther("0.01") }
  );
  await tx.wait();

  const balance = await SpendVault.getETHBalance();
  console.log("Vault balance:", ethers.formatEther(balance), "ETH");
}

main();
```

## Troubleshooting

### "Insufficient funds for gas"
- Ensure your deployer wallet has enough ETH on Base Sepolia
- Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### "Contract deployment failed"
- Check your RPC endpoint is correct
- Verify your private key is set correctly
- Ensure you're on the right network (Base Sepolia chainId: 84532)

### "Verification failed"
- Wait a few minutes after deployment before verifying
- Ensure constructor arguments match exactly
- Check BaseScan API key is valid

## Next Steps

1. ✅ Deploy contracts
2. ✅ Update `lib/contracts.ts` with addresses
3. ✅ Add guardian addresses via frontend or script
4. ✅ Test deposit functionality
5. ✅ Implement withdrawal flow with EIP-712 signatures
6. 🔄 Deploy to Base Mainnet when ready

## Resources

- Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Base Sepolia Explorer: https://sepolia.basescan.org
- Hardhat Docs: https://hardhat.org/docs
