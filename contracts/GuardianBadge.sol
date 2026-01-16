
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GuardianBadge
 * @dev Non-transferable (soulbound) NFT for guardians, awarded based on activity.
 */
contract GuardianBadge is ERC721Enumerable, Ownable {
    enum BadgeType { Approvals, ResponseTime, Longevity }

    struct Badge {
        BadgeType badgeType;
        uint256 level;
        uint256 timestamp;
    }

    // tokenId => Badge
    mapping(uint256 => Badge) public badges;
    // guardian => badge type => tokenId
    mapping(address => mapping(BadgeType => uint256)) public guardianBadges;
    // guardian => array of badge types they own
    mapping(address => BadgeType[]) private guardianBadgeTypes;
    uint256 private _tokenIdCounter;

    event BadgeMinted(address indexed guardian, BadgeType indexed badgeType, uint256 level, uint256 indexed tokenId);
    event BadgeUpgraded(address indexed guardian, BadgeType indexed badgeType, uint256 newLevel, uint256 indexed tokenId);
    event BadgeBurned(address indexed guardian, BadgeType indexed badgeType, uint256 indexed tokenId);

    constructor() ERC721("GuardianBadge", "GBADGE") Ownable(msg.sender) {}

    // ============================================================
    // BADGE MANAGEMENT - Core badge minting and querying
    // ============================================================

    /**
     * @notice Mint a new badge for a guardian
     * @param guardian The guardian address
     * @param badgeType The type of badge
     * @param level The achievement level
     */
    function mintBadge(address guardian, BadgeType badgeType, uint256 level) external onlyOwner {
        require(guardian != address(0), "Invalid guardian address");
        require(guardianBadges[guardian][badgeType] == 0, "Badge type already exists");
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        _safeMint(guardian, tokenId);
        badges[tokenId] = Badge({ badgeType: badgeType, level: level, timestamp: block.timestamp });
        guardianBadges[guardian][badgeType] = tokenId;
        guardianBadgeTypes[guardian].push(badgeType);
        emit BadgeMinted(guardian, badgeType, level, tokenId);
    }

    /**
     * @notice Upgrade an existing badge to a new level
     * @param guardian The guardian address
     * @param badgeType The badge type to upgrade
     * @param newLevel The new achievement level
     */
    function upgradeBadge(address guardian, BadgeType badgeType, uint256 newLevel) external onlyOwner {
        uint256 tokenId = guardianBadges[guardian][badgeType];
        require(tokenId != 0, "Badge not found");
        require(newLevel > badges[tokenId].level, "New level must be higher");
        badges[tokenId].level = newLevel;
        badges[tokenId].timestamp = block.timestamp;
        emit BadgeUpgraded(guardian, badgeType, newLevel, tokenId);
    }

    /**
     * @notice Burn a badge (remove from circulation)
     * @param guardian The guardian address
     * @param badgeType The badge type to burn
     */
    function burnBadge(address guardian, BadgeType badgeType) external onlyOwner {
        uint256 tokenId = guardianBadges[guardian][badgeType];
        require(tokenId != 0, "Badge not found");
        _burn(tokenId);
        delete guardianBadges[guardian][badgeType];
        delete badges[tokenId];
        // Remove from badge types array
        for (uint256 i = 0; i < guardianBadgeTypes[guardian].length; i++) {
            if (guardianBadgeTypes[guardian][i] == badgeType) {
                guardianBadgeTypes[guardian][i] = guardianBadgeTypes[guardian][guardianBadgeTypes[guardian].length - 1];
                guardianBadgeTypes[guardian].pop();
                break;
            }
        }
        emit BadgeBurned(guardian, badgeType, tokenId);
    }

    /**
     * @notice Get all badge token IDs for a guardian
     * @param guardian The guardian address
     * @return An array of token IDs
     */
    function getGuardianBadgeTokens(address guardian) external view returns (uint256[] memory) {
        uint256[] memory tokenIds = new uint256[](guardianBadgeTypes[guardian].length);
        for (uint256 i = 0; i < guardianBadgeTypes[guardian].length; i++) {
            tokenIds[i] = guardianBadges[guardian][guardianBadgeTypes[guardian][i]];
        }
        return tokenIds;
    }

    /**
     * @notice Get all badge types for a guardian
     * @param guardian The guardian address
     * @return An array of badge types
     */
    function getGuardianBadgeTypes(address guardian) external view returns (BadgeType[] memory) {
        return guardianBadgeTypes[guardian];
    }

    /**
     * @notice Check if a guardian has a specific badge type
     * @param guardian The guardian address
     * @param badgeType The badge type to check
     * @return True if the guardian has the badge
     */
    function hasGuardianBadge(address guardian, BadgeType badgeType) external view returns (bool) {
        return guardianBadges[guardian][badgeType] != 0;
    }

    // ============================================================
    // EMERGENCY CONTACTS - Separate functionality for emergency recovery
    // ============================================================
    mapping(address => bool) public emergencyContacts;
    address[] public emergencyContactList;

    event EmergencyContactAdded(address indexed contact);
    event EmergencyContactRemoved(address indexed contact);

    /**
     * @notice Add a trusted emergency contact (owner only)
     * @param contact The address to add
     */
    function addEmergencyContact(address contact) external onlyOwner {
        require(contact != address(0), "Invalid contact");
        require(!emergencyContacts[contact], "Already added");
        emergencyContacts[contact] = true;
        emergencyContactList.push(contact);
        emit EmergencyContactAdded(contact);
    }

    /**
     * @notice Remove a trusted emergency contact (owner only)
     * @param contact The address to remove
     */
    function removeEmergencyContact(address contact) external onlyOwner {
        require(emergencyContacts[contact], "Not in list");
        emergencyContacts[contact] = false;
        // Remove from array using swap-and-pop pattern
        for (uint256 i = 0; i < emergencyContactList.length; i++) {
            if (emergencyContactList[i] == contact) {
                // Swap with last element
                emergencyContactList[i] = emergencyContactList[emergencyContactList.length - 1];
                // Remove last element
                emergencyContactList.pop();
                break;
            }
        }
        emit EmergencyContactRemoved(contact);
    }

    /**
     * @notice Get all emergency contacts
     */
    function getEmergencyContacts() external view returns (address[] memory) {
        return emergencyContactList;
    }

    // --- Soulbound: Block all transfers and approvals ---

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        require(from == address(0) || to == address(0), "Soulbound: Transfers disabled");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function approve(address to, uint256 tokenId) public override(ERC721) {
        revert("Soulbound: Approvals disabled");
    }

    function setApprovalForAll(address operator, bool approved) public override(ERC721) {
        revert("Soulbound: Approvals disabled");
    }

    function transferFrom(address from, address to, uint256 tokenId) public override(ERC721) {
        revert("Soulbound: Transfers disabled");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override(ERC721) {
        revert("Soulbound: Transfers disabled");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public override(ERC721) {
        revert("Soulbound: Transfers disabled");
    }
}
