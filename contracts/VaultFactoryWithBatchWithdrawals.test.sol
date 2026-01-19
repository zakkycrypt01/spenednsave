// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/VaultFactoryWithBatchWithdrawals.sol";
import "../contracts/SpendVaultWithBatchWithdrawals.sol";
import "../contracts/BatchWithdrawalManager.sol";
import "../mocks/MockGuardianSBT.sol";

contract VaultFactoryWithBatchWithdrawalsTest is Test {
    VaultFactoryWithBatchWithdrawals factory;
    MockGuardianSBT guardianSBT;
    
    address user1 = address(0x1111111111111111111111111111111111111111);
    address user2 = address(0x2222222222222222222222222222222222222222);

    function setUp() public {
        factory = new VaultFactoryWithBatchWithdrawals();
        guardianSBT = new MockGuardianSBT();
    }

    // ==================== Vault Creation Tests ====================

    function test_CreateVault() public {
        vm.prank(user1);
        address vaultAddr = factory.createVault(2);
        
        assertNotEq(vaultAddr, address(0));
        assertTrue(factory.isManagedVault(vaultAddr));
    }

    function test_CreateVaultReturnsVaultAddress() public {
        vm.prank(user1);
        address vaultAddr = factory.createVault(2);
        
        SpendVaultWithBatchWithdrawals vault = SpendVaultWithBatchWithdrawals(payable(vaultAddr));
        assertEq(vault.quorum(), 2);
    }

    function test_MultipleVaultsPerUser() public {
        vm.prank(user1);
        address vault1 = factory.createVault(2);
        
        vm.prank(user1);
        address vault2 = factory.createVault(3);
        
        assertNotEq(vault1, vault2);
        assertTrue(factory.isManagedVault(vault1));
        assertTrue(factory.isManagedVault(vault2));
    }

    // ==================== User Vault Tracking Tests ====================

    function test_GetUserVaults() public {
        vm.prank(user1);
        address vault1 = factory.createVault(2);
        
        vm.prank(user1);
        address vault2 = factory.createVault(3);
        
        address[] memory userVaults = factory.getUserVaults(user1);
        assertEq(userVaults.length, 2);
        assertEq(userVaults[0], vault1);
        assertEq(userVaults[1], vault2);
    }

    function test_GetUserVaultsMultipleUsers() public {
        vm.prank(user1);
        address vault1a = factory.createVault(2);
        
        vm.prank(user1);
        address vault1b = factory.createVault(3);
        
        vm.prank(user2);
        address vault2a = factory.createVault(2);
        
        address[] memory user1Vaults = factory.getUserVaults(user1);
        address[] memory user2Vaults = factory.getUserVaults(user2);
        
        assertEq(user1Vaults.length, 2);
        assertEq(user2Vaults.length, 1);
        assertEq(user2Vaults[0], vault2a);
    }

    function test_GetUserVaultCount() public {
        vm.prank(user1);
        factory.createVault(2);
        
        vm.prank(user1);
        factory.createVault(3);
        
        assertEq(factory.getUserVaultCount(user1), 2);
    }

    function test_GetUserVaultCountMultipleUsers() public {
        vm.prank(user1);
        factory.createVault(2);
        factory.createVault(2);
        factory.createVault(2);
        
        vm.prank(user2);
        factory.createVault(2);
        factory.createVault(2);
        
        assertEq(factory.getUserVaultCount(user1), 3);
        assertEq(factory.getUserVaultCount(user2), 2);
    }

    // ==================== Manager Tests ====================

    function test_GetBatchManager() public {
        address manager = factory.getBatchManager();
        assertNotEq(manager, address(0));
    }

    function test_BatchManagerIsConsistent() public {
        address manager1 = factory.getBatchManager();
        address manager2 = factory.getBatchManager();
        
        assertEq(manager1, manager2);
    }

    // ==================== Managed Vault Tracking Tests ====================

    function test_VaultIsManagedAfterCreation() public {
        vm.prank(user1);
        address vault = factory.createVault(2);
        
        assertTrue(factory.isManagedVault(vault));
    }

    function test_NonManagedVaultReturnsFalse() public {
        address nonManagedVault = address(0x9999999999999999999999999999999999999999);
        assertFalse(factory.isManagedVault(nonManagedVault));
    }

    // ==================== Vault Enumeration Tests ====================

    function test_GetAllVaults() public {
        vm.prank(user1);
        address vault1 = factory.createVault(2);
        
        vm.prank(user2);
        address vault2 = factory.createVault(2);
        
        address[] memory allVaults = factory.getAllVaults();
        assertEq(allVaults.length, 2);
        assertEq(allVaults[0], vault1);
        assertEq(allVaults[1], vault2);
    }

    function test_GetVaultCount() public {
        vm.prank(user1);
        factory.createVault(2);
        
        vm.prank(user2);
        factory.createVault(2);
        
        vm.prank(user2);
        factory.createVault(3);
        
        assertEq(factory.getVaultCount(), 3);
    }

    // ==================== Integration Tests ====================

    function test_CreatedVaultIntegrationWithManager() public {
        vm.prank(user1);
        address vaultAddr = factory.createVault(2);
        
        SpendVaultWithBatchWithdrawals vault = SpendVaultWithBatchWithdrawals(payable(vaultAddr));
        address manager = factory.getBatchManager();
        
        assertEq(vault.batchManager(), manager);
    }

    function test_VaultAutomaticallyRegistered() public {
        vm.prank(user1);
        address vaultAddr = factory.createVault(2);
        
        BatchWithdrawalManager manager = BatchWithdrawalManager(factory.getBatchManager());
        
        assertEq(manager.vaultQuorum(vaultAddr), 2);
    }

    function test_MultipleVaultsManageInSameManager() public {
        vm.prank(user1);
        address vault1 = factory.createVault(2);
        
        vm.prank(user2);
        address vault2 = factory.createVault(3);
        
        address manager1 = SpendVaultWithBatchWithdrawals(payable(vault1)).batchManager();
        address manager2 = SpendVaultWithBatchWithdrawals(payable(vault2)).batchManager();
        
        assertEq(manager1, manager2);
    }

    // ==================== Quorum Variation Tests ====================

    function test_CreateVaultsWithDifferentQuorum() public {
        vm.prank(user1);
        address vault2 = factory.createVault(2);
        
        vm.prank(user1);
        address vault3 = factory.createVault(3);
        
        vm.prank(user1);
        address vault5 = factory.createVault(5);
        
        BatchWithdrawalManager manager = BatchWithdrawalManager(factory.getBatchManager());
        
        assertEq(manager.vaultQuorum(vault2), 2);
        assertEq(manager.vaultQuorum(vault3), 3);
        assertEq(manager.vaultQuorum(vault5), 5);
    }
}
