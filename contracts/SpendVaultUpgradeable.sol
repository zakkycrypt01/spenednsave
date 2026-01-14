// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface IGuardianSBT {
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title SpendVaultUpgradeable
 * @notice UUPS upgradable multi-signature treasury vault with guardian-based approvals
 */
contract SpendVaultUpgradeable is Initializable, OwnableUpgradeable, UUPSUpgradeable, ReentrancyGuardUpgradeable, EIP712 {
    // ...existing storage and logic from SpendVault.sol...
    // You must copy all state variables and logic from SpendVault here, but use initializer instead of constructor.

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(address _guardianToken, uint256 _quorum) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        // EIP712 domain separator
        __EIP712_init("SpendVault", "1");
        // ...initialize your storage variables here...
        // Example:
        // guardianToken = _guardianToken;
        // quorum = _quorum;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ...rest of SpendVault logic...
}
