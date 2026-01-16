import { expect } from "chai";
import { ethers } from "hardhat";

describe("GuardianBadge", function () {
  let guardianBadge: any;
  let owner: any;
  let guardian1: any;
  let guardian2: any;
  let emergencyContact: any;

  beforeEach(async function () {
    [owner, guardian1, guardian2, emergencyContact] = await ethers.getSigners();
    const GuardianBadge = await ethers.getContractFactory("GuardianBadge");
    guardianBadge = await GuardianBadge.deploy();
    await guardianBadge.waitForDeployment();
  });

  describe("Badge Management", function () {
    it("should mint a new badge for a guardian", async function () {
      await guardianBadge.mintBadge(guardian1.address, 0, 1); // BadgeType.Approvals = 0
      const tokenIds = await guardianBadge.getGuardianBadgeTokens(guardian1.address);
      expect(tokenIds.length).to.equal(1);
      expect(await guardianBadge.balanceOf(guardian1.address)).to.equal(1);
    });

    it("should prevent minting duplicate badge types for same guardian", async function () {
      await guardianBadge.mintBadge(guardian1.address, 0, 1);
      await expect(
        guardianBadge.mintBadge(guardian1.address, 0, 1)
      ).to.be.revertedWith("Badge type already exists");
    });

    it("should allow guardian to own multiple badge types", async function () {
      await guardianBadge.mintBadge(guardian1.address, 0, 1); // Approvals
      await guardianBadge.mintBadge(guardian1.address, 1, 2); // ResponseTime
      await guardianBadge.mintBadge(guardian1.address, 2, 3); // Longevity

      const badgeTypes = await guardianBadge.getGuardianBadgeTypes(guardian1.address);
      expect(badgeTypes.length).to.equal(3);
      expect(await guardianBadge.getGuardianBadgeCount(guardian1.address)).to.equal(3);
    });

    it("should upgrade badge to higher level", async function () {
      await guardianBadge.mintBadge(guardian1.address, 0, 1);
      const tokenIds = await guardianBadge.getGuardianBadgeTokens(guardian1.address);
      const tokenId = tokenIds[0];

      let badgeDetails = await guardianBadge.getBadgeDetails(tokenId);
      expect(badgeDetails.level).to.equal(1);

      await guardianBadge.upgradeBadge(guardian1.address, 0, 5);
      badgeDetails = await guardianBadge.getBadgeDetails(tokenId);
      expect(badgeDetails.level).to.equal(5);
    });

    it("should prevent downgrading badge level", async function () {
      await guardianBadge.mintBadge(guardian1.address, 0, 5);
      await expect(
        guardianBadge.upgradeBadge(guardian1.address, 0, 3)
      ).to.be.revertedWith("New level must be higher");
    });

    it("should burn a badge and remove from tracking", async function () {
      await guardianBadge.mintBadge(guardian1.address, 0, 1);
      await guardianBadge.mintBadge(guardian1.address, 1, 2);

      expect(await guardianBadge.getGuardianBadgeCount(guardian1.address)).to.equal(2);

      await guardianBadge.burnBadge(guardian1.address, 0);
      expect(await guardianBadge.getGuardianBadgeCount(guardian1.address)).to.equal(1);
      expect(await guardianBadge.hasGuardianBadge(guardian1.address, 0)).to.equal(false);
    });

    it("should only allow owner to mint badges", async function () {
      await expect(
        guardianBadge.connect(guardian1).mintBadge(guardian1.address, 0, 1)
      ).to.be.revertedWithCustomError(guardianBadge, "OwnableUnauthorizedAccount");
    });

    it("should only allow owner to upgrade badges", async function () {
      await guardianBadge.mintBadge(guardian1.address, 0, 1);
      await expect(
        guardianBadge.connect(guardian1).upgradeBadge(guardian1.address, 0, 2)
      ).to.be.revertedWithCustomError(guardianBadge, "OwnableUnauthorizedAccount");
    });

    it("should only allow owner to burn badges", async function () {
      await guardianBadge.mintBadge(guardian1.address, 0, 1);
      await expect(
        guardianBadge.connect(guardian1).burnBadge(guardian1.address, 0)
      ).to.be.revertedWithCustomError(guardianBadge, "OwnableUnauthorizedAccount");
    });
  });

  describe("Badge Queries", function () {
    beforeEach(async function () {
      await guardianBadge.mintBadge(guardian1.address, 0, 1);
      await guardianBadge.mintBadge(guardian1.address, 1, 2);
      await guardianBadge.mintBadge(guardian2.address, 0, 3);
    });

    it("should retrieve badge details by token ID", async function () {
      const tokenIds = await guardianBadge.getGuardianBadgeTokens(guardian1.address);
      const details = await guardianBadge.getBadgeDetails(tokenIds[0]);
      expect(details.level).to.equal(1);
      expect(details.badgeType).to.equal(0);
    });

    it("should check if guardian has specific badge type", async function () {
      expect(await guardianBadge.hasGuardianBadge(guardian1.address, 0)).to.equal(true);
      expect(await guardianBadge.hasGuardianBadge(guardian1.address, 2)).to.equal(false);
    });

    it("should return correct badge count", async function () {
      expect(await guardianBadge.getGuardianBadgeCount(guardian1.address)).to.equal(2);
      expect(await guardianBadge.getGuardianBadgeCount(guardian2.address)).to.equal(1);
    });

    it("should get all badge types for guardian", async function () {
      const types = await guardianBadge.getGuardianBadgeTypes(guardian1.address);
      expect(types.length).to.equal(2);
      expect(types[0]).to.equal(0);
      expect(types[1]).to.equal(1);
    });
  });

  describe("Soulbound Mechanics", function () {
    beforeEach(async function () {
      await guardianBadge.mintBadge(guardian1.address, 0, 1);
    });

    it("should prevent direct transfers", async function () {
      const tokenIds = await guardianBadge.getGuardianBadgeTokens(guardian1.address);
      await expect(
        guardianBadge.connect(guardian1).transferFrom(guardian1.address, guardian2.address, tokenIds[0])
      ).to.be.revertedWith("Soulbound: Transfers disabled");
    });

    it("should prevent safe transfers", async function () {
      const tokenIds = await guardianBadge.getGuardianBadgeTokens(guardian1.address);
      await expect(
        guardianBadge.connect(guardian1).safeTransferFrom(guardian1.address, guardian2.address, tokenIds[0])
      ).to.be.revertedWith("Soulbound: Transfers disabled");
    });

    it("should prevent safe transfers with data", async function () {
      const tokenIds = await guardianBadge.getGuardianBadgeTokens(guardian1.address);
      await expect(
        guardianBadge.connect(guardian1).safeTransferFrom(guardian1.address, guardian2.address, tokenIds[0], "0x")
      ).to.be.revertedWith("Soulbound: Transfers disabled");
    });

    it("should prevent approval", async function () {
      const tokenIds = await guardianBadge.getGuardianBadgeTokens(guardian1.address);
      await expect(
        guardianBadge.connect(guardian1).approve(guardian2.address, tokenIds[0])
      ).to.be.revertedWith("Soulbound: Approvals disabled");
    });

    it("should prevent approval for all", async function () {
      await expect(
        guardianBadge.connect(guardian1).setApprovalForAll(guardian2.address, true)
      ).to.be.revertedWith("Soulbound: Approvals disabled");
    });
  });

  describe("Emergency Contacts", function () {
    it("should add emergency contact", async function () {
      await guardianBadge.addEmergencyContact(emergencyContact.address);
      const contacts = await guardianBadge.getEmergencyContacts();
      expect(contacts).to.include(emergencyContact.address);
      expect(await guardianBadge.emergencyContacts(emergencyContact.address)).to.equal(true);
    });

    it("should prevent duplicate emergency contact", async function () {
      await guardianBadge.addEmergencyContact(emergencyContact.address);
      await expect(
        guardianBadge.addEmergencyContact(emergencyContact.address)
      ).to.be.revertedWith("Already added");
    });

    it("should remove emergency contact", async function () {
      await guardianBadge.addEmergencyContact(emergencyContact.address);
      await guardianBadge.removeEmergencyContact(emergencyContact.address);
      const contacts = await guardianBadge.getEmergencyContacts();
      expect(contacts).to.not.include(emergencyContact.address);
      expect(await guardianBadge.emergencyContacts(emergencyContact.address)).to.equal(false);
    });

    it("should only allow owner to manage emergency contacts", async function () {
      await expect(
        guardianBadge.connect(guardian1).addEmergencyContact(emergencyContact.address)
      ).to.be.revertedWithCustomError(guardianBadge, "OwnableUnauthorizedAccount");

      await guardianBadge.addEmergencyContact(emergencyContact.address);
      await expect(
        guardianBadge.connect(guardian1).removeEmergencyContact(emergencyContact.address)
      ).to.be.revertedWithCustomError(guardianBadge, "OwnableUnauthorizedAccount");
    });

    it("should handle multiple emergency contacts", async function () {
      const contact1 = ethers.Wallet.createRandom().address;
      const contact2 = ethers.Wallet.createRandom().address;
      const contact3 = ethers.Wallet.createRandom().address;

      await guardianBadge.addEmergencyContact(contact1);
      await guardianBadge.addEmergencyContact(contact2);
      await guardianBadge.addEmergencyContact(contact3);

      let contacts = await guardianBadge.getEmergencyContacts();
      expect(contacts.length).to.equal(3);

      await guardianBadge.removeEmergencyContact(contact2);
      contacts = await guardianBadge.getEmergencyContacts();
      expect(contacts.length).to.equal(2);
      expect(contacts).to.not.include(contact2);
    });
  });

  describe("Events", function () {
    it("should emit BadgeMinted event", async function () {
      await expect(guardianBadge.mintBadge(guardian1.address, 0, 1))
        .to.emit(guardianBadge, "BadgeMinted")
        .withArgs(guardian1.address, 0, 1, 1);
    });

    it("should emit BadgeUpgraded event", async function () {
      await guardianBadge.mintBadge(guardian1.address, 0, 1);
      await expect(guardianBadge.upgradeBadge(guardian1.address, 0, 3))
        .to.emit(guardianBadge, "BadgeUpgraded")
        .withArgs(guardian1.address, 0, 3, 1);
    });

    it("should emit BadgeBurned event", async function () {
      await guardianBadge.mintBadge(guardian1.address, 0, 1);
      await expect(guardianBadge.burnBadge(guardian1.address, 0))
        .to.emit(guardianBadge, "BadgeBurned")
        .withArgs(guardian1.address, 0, 1);
    });

    it("should emit EmergencyContactAdded event", async function () {
      await expect(guardianBadge.addEmergencyContact(emergencyContact.address))
        .to.emit(guardianBadge, "EmergencyContactAdded")
        .withArgs(emergencyContact.address);
    });

    it("should emit EmergencyContactRemoved event", async function () {
      await guardianBadge.addEmergencyContact(emergencyContact.address);
      await expect(guardianBadge.removeEmergencyContact(emergencyContact.address))
        .to.emit(guardianBadge, "EmergencyContactRemoved")
        .withArgs(emergencyContact.address);
    });
  });

  describe("Edge Cases", function () {
    it("should reject zero address for guardian", async function () {
      await expect(
        guardianBadge.mintBadge(ethers.ZeroAddress, 0, 1)
      ).to.be.revertedWith("Invalid guardian address");
    });

    it("should reject zero address for emergency contact", async function () {
      await expect(
        guardianBadge.addEmergencyContact(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid contact");
    });

    it("should reject invalid token ID in getBadgeDetails", async function () {
      await expect(
        guardianBadge.getBadgeDetails(9999)
      ).to.be.revertedWith("Badge not found");
    });

    it("should return empty arrays for guardian with no badges", async function () {
      const tokenIds = await guardianBadge.getGuardianBadgeTokens(guardian1.address);
      const types = await guardianBadge.getGuardianBadgeTypes(guardian1.address);
      expect(tokenIds.length).to.equal(0);
      expect(types.length).to.equal(0);
      expect(await guardianBadge.getGuardianBadgeCount(guardian1.address)).to.equal(0);
    });
  });
});
