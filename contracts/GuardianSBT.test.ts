import { expect } from "chai";
import { ethers } from "hardhat";

describe("GuardianSBT", function () {
  let guardianSBT: any;
  let owner: any;
  let guardian: any;
  let otherGuardian: any;
  let vault: any;

  beforeEach(async function () {
    [owner, guardian, otherGuardian, vault] = await ethers.getSigners();
    const GuardianSBT = await ethers.getContractFactory("GuardianSBT");
    guardianSBT = await GuardianSBT.deploy();
    await guardianSBT.waitForDeployment();
  });

  describe("Minting", function () {
    it("should mint and assign SBT to guardian", async function () {
      await guardianSBT.mint(guardian.address, vault.address);
      expect(await guardianSBT.balanceOf(guardian.address)).to.equal(1);
      const vaults = await guardianSBT.getVaultsForGuardian(guardian.address);
      expect(vaults).to.include(vault.address);
    });

    it("should allow guardian to be associated with multiple vaults", async function () {
      const vault1 = ethers.Wallet.createRandom().address;
      const vault2 = ethers.Wallet.createRandom().address;

      await guardianSBT.mint(guardian.address, vault1);
      await guardianSBT.mint(guardian.address, vault2);

      expect(await guardianSBT.balanceOf(guardian.address)).to.equal(2);
      const vaults = await guardianSBT.getVaultsForGuardian(guardian.address);
      expect(vaults).to.include(vault1);
      expect(vaults).to.include(vault2);
    });

    it("should only allow owner to mint", async function () {
      await expect(
        guardianSBT.connect(guardian).mint(guardian.address, vault.address)
      ).to.be.revertedWithCustomError(guardianSBT, "OwnableUnauthorizedAccount");
    });

    it("should reject invalid guardian address", async function () {
      await expect(
        guardianSBT.mint(ethers.ZeroAddress, vault.address)
      ).to.be.revertedWith("Invalid guardian address");
    });

    it("should reject invalid vault address", async function () {
      await expect(
        guardianSBT.mint(guardian.address, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid vault address");
    });
  });

  describe("Soulbound (No Transfers)", function () {
    beforeEach(async function () {
      await guardianSBT.mint(guardian.address, vault.address);
    });

    it("should prevent direct transfers", async function () {
      await expect(
        guardianSBT.connect(guardian).transferFrom(guardian.address, otherGuardian.address, 1)
      ).to.be.revertedWith("Soulbound: Transfers disabled");
    });

    it("should prevent safe transfers", async function () {
      await expect(
        guardianSBT.connect(guardian).safeTransferFrom(guardian.address, otherGuardian.address, 1)
      ).to.be.revertedWith("Soulbound: Transfers disabled");
    });

    it("should prevent approval", async function () {
      await expect(
        guardianSBT.connect(guardian).approve(otherGuardian.address, 1)
      ).to.be.revertedWith("Soulbound: Approvals disabled");
    });

    it("should prevent approval for all", async function () {
      await expect(
        guardianSBT.connect(guardian).setApprovalForAll(otherGuardian.address, true)
      ).to.be.revertedWith("Soulbound: Approvals disabled");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await guardianSBT.mint(guardian.address, vault.address);
    });

    it("should allow owner to burn tokens", async function () {
      expect(await guardianSBT.balanceOf(guardian.address)).to.equal(1);
      await guardianSBT.burn(1, vault.address);
      expect(await guardianSBT.balanceOf(guardian.address)).to.equal(0);
    });

    it("should remove vault association on burn", async function () {
      const vaults = await guardianSBT.getVaultsForGuardian(guardian.address);
      expect(vaults).to.include(vault.address);

      await guardianSBT.burn(1, vault.address);

      const vaultsAfter = await guardianSBT.getVaultsForGuardian(guardian.address);
      expect(vaultsAfter).to.not.include(vault.address);
    });

    it("should only allow owner to burn", async function () {
      await expect(
        guardianSBT.connect(guardian).burn(1, vault.address)
      ).to.be.revertedWithCustomError(guardianSBT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Querying", function () {
    it("should retrieve all vaults for a guardian", async function () {
      const vault1 = ethers.Wallet.createRandom().address;
      const vault2 = ethers.Wallet.createRandom().address;

      await guardianSBT.mint(guardian.address, vault1);
      await guardianSBT.mint(guardian.address, vault2);

      const vaults = await guardianSBT.getVaultsForGuardian(guardian.address);
      expect(vaults.length).to.equal(2);
      expect(vaults).to.include(vault1);
      expect(vaults).to.include(vault2);
    });

    it("should retrieve all guardians for a vault", async function () {
      await guardianSBT.mint(guardian.address, vault.address);
      await guardianSBT.mint(otherGuardian.address, vault.address);

      const guardians = await guardianSBT.getGuardiansForVault(vault.address);
      expect(guardians.length).to.equal(2);
      expect(guardians).to.include(guardian.address);
      expect(guardians).to.include(otherGuardian.address);
    });

    it("should return empty array for guardian with no vaults", async function () {
      const vaults = await guardianSBT.getVaultsForGuardian(guardian.address);
      expect(vaults.length).to.equal(0);
    });

    it("should return empty array for vault with no guardians", async function () {
      const guardians = await guardianSBT.getGuardiansForVault(vault.address);
      expect(guardians.length).to.equal(0);
    });
  });
});
