import { expect } from "chai";
import { ethers } from "hardhat";

describe("VaultFactory", function () {
  it("should deploy a new SpendVault and GuardianSBT", async function () {
    const [owner] = await ethers.getSigners();
    const VaultFactory = await ethers.getContractFactory("VaultFactory");
    const vaultFactory = await VaultFactory.deploy();
    await vaultFactory.deployed();

    const tx = await vaultFactory.createVault(1); // quorum = 1
    const receipt = await tx.wait();
    const event = receipt.events?.find(e => e.event === "VaultCreated");
    expect(event).to.not.be.undefined;
    const [vault, guardianSBT] = event?.args || [];
    expect(vault).to.properAddress;
    expect(guardianSBT).to.properAddress;
  });
});
