import { expect } from "chai";
import { ethers } from "hardhat";

describe("GuardianSBT", function () {
  it("should mint and assign SBT to guardian", async function () {
    const [owner, guardian] = await ethers.getSigners();
    const GuardianSBT = await ethers.getContractFactory("GuardianSBT");
    const guardianSBT = await GuardianSBT.deploy();
    await guardianSBT.deployed();

    await guardianSBT.mint(guardian.address, owner.address);
    expect(await guardianSBT.balanceOf(guardian.address)).to.equal(1);
    const vaults = await guardianSBT.getVaultsForGuardian(guardian.address);
    expect(vaults).to.include(owner.address);
  });
});
