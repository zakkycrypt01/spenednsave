// scripts/deployUpgradeableVaults.ts
import { ethers, upgrades } from "hardhat";

async function main() {
  // 1. Deploy SpendVaultUpgradeable implementation
  const SpendVaultUpgradeable = await ethers.getContractFactory("SpendVaultUpgradeable");
  const spendVaultImpl = await SpendVaultUpgradeable.deploy();
  await spendVaultImpl.deployed();
  console.log("SpendVaultUpgradeable implementation deployed at:", spendVaultImpl.address);

  // 2. Deploy VaultFactoryUpgradeable with implementation address
  const VaultFactoryUpgradeable = await ethers.getContractFactory("VaultFactoryUpgradeable");
  const vaultFactory = await VaultFactoryUpgradeable.deploy(spendVaultImpl.address);
  await vaultFactory.deployed();
  console.log("VaultFactoryUpgradeable deployed at:", vaultFactory.address);

  // 3. (Optional) Deploy a new upgradable vault for a user
  // const tx = await vaultFactory.createVault(2); // quorum = 2
  // await tx.wait();
  // console.log("Vault created");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
