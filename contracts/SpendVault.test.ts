import { expect } from "chai";
import { ethers } from "hardhat";

describe("SpendVault", function () {
  it("should deploy and set the correct owner", async function () {
    const [owner] = await ethers.getSigners();
    const GuardianSBT = await ethers.getContractFactory("GuardianSBT");
    const guardianSBT = await GuardianSBT.deploy();
    await guardianSBT.deployed();

    const SpendVault = await ethers.getContractFactory("SpendVault");
    const spendVault = await SpendVault.deploy(owner.address, guardianSBT.address, 1); // quorum = 1
    await spendVault.deployed();

    expect(await spendVault.owner()).to.equal(owner.address);
    expect(await spendVault.guardianToken()).to.equal(guardianSBT.address);
  });

  it("should allow deposit and update balance", async function () {
    const [owner] = await ethers.getSigners();
    const GuardianSBT = await ethers.getContractFactory("GuardianSBT");
    const guardianSBT = await GuardianSBT.deploy();
    await guardianSBT.deployed();
    const SpendVault = await ethers.getContractFactory("SpendVault");
    const spendVault = await SpendVault.deploy(owner.address, guardianSBT.address, 1);
    await spendVault.deployed();

    await owner.sendTransaction({
      to: spendVault.address,
      value: ethers.utils.parseEther("1.0"),
    });
    const balance = await ethers.provider.getBalance(spendVault.address);
    expect(balance).to.equal(ethers.utils.parseEther("1.0"));
  });
});
