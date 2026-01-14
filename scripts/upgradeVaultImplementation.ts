// scripts/upgradeVaultImplementation.ts
import { ethers, upgrades } from "hardhat";

async function main() {
  // Address of the deployed SpendVaultUpgradeable implementation
  const newImplAddress = "<NEW_IMPLEMENTATION_ADDRESS>"; // Replace with actual address after deploying new logic
  // Address of the proxy vault to upgrade
  const proxyAddress = "<PROXY_VAULT_ADDRESS>"; // Replace with actual proxy address

  // Get the proxy contract instance
  const SpendVaultUpgradeable = await ethers.getContractFactory("SpendVaultUpgradeable");
  // Upgrade the proxy to the new implementation
  await upgrades.upgradeProxy(proxyAddress, SpendVaultUpgradeable);
  console.log("Vault upgraded to new implementation at:", newImplAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
