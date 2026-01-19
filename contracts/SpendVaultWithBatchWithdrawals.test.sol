// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/SpendVaultWithBatchWithdrawals.sol";
import "../contracts/BatchWithdrawalManager.sol";
import "../mocks/MockGuardianSBT.sol";
import "../mocks/MockERC20.sol";

contract SpendVaultWithBatchWithdrawalsTest is Test {
    SpendVaultWithBatchWithdrawals vault;
    BatchWithdrawalManager manager;
    MockGuardianSBT guardianSBT;
    MockERC20 token1;
    MockERC20 token2;
    
    address owner = address(0x1111111111111111111111111111111111111111);
    address guardian1 = address(0x2222222222222222222222222222222222222222);
    address guardian2 = address(0x3333333333333333333333333333333333333333);
    address recipient = address(0x4444444444444444444444444444444444444444);

    function setUp() public {
        guardianSBT = new MockGuardianSBT();
        manager = new BatchWithdrawalManager();
        
        vm.prank(owner);
        vault = new SpendVaultWithBatchWithdrawals();
        
        vault.setQuorum(2);
        vault.updateGuardianToken(address(guardianSBT));
        vault.updateBatchManager(address(manager));
        
        manager.registerVault(address(vault), 2);
        
        guardianSBT.mint(guardian1);
        guardianSBT.mint(guardian2);
        
        token1 = new MockERC20("Token1", "T1");
        token2 = new MockERC20("Token2", "T2");
        
        token1.mint(address(vault), 10000 * 10**18);
        token2.mint(address(vault), 10000 * 10**18);
        vm.deal(address(vault), 10 ether);
    }

    // ==================== Batch Proposal Tests ====================

    function test_ProposeBatchWithdrawal() public {
        BatchWithdrawalManager.TokenWithdrawal[] memory tokens = 
            new BatchWithdrawalManager.TokenWithdrawal[](1);
        tokens[0] = BatchWithdrawalManager.TokenWithdrawal(
            address(token1),
            1000 * 10**18,
            recipient
        );

        vm.prank(owner);
        uint256 batchId = vault.proposeBatchWithdrawal(tokens, "Token transfer");
        
        assertEq(batchId, 0);
    }

    function test_ProposeBatchRequiresOwner() public {
        BatchWithdrawalManager.TokenWithdrawal[] memory tokens = 
            new BatchWithdrawalManager.TokenWithdrawal[](1);
        tokens[0] = BatchWithdrawalManager.TokenWithdrawal(
            address(token1),
            1000 * 10**18,
            recipient
        );

        vm.prank(guardian1);
        vm.expectRevert("Only owner");
        vault.proposeBatchWithdrawal(tokens, "Test");
    }

    function test_ProposeBatchValidatesBalance() public {
        BatchWithdrawalManager.TokenWithdrawal[] memory tokens = 
            new BatchWithdrawalManager.TokenWithdrawal[](1);
        tokens[0] = BatchWithdrawalManager.TokenWithdrawal(
            address(token1),
            20000 * 10**18,
            recipient
        );

        vm.prank(owner);
        vm.expectRevert("Insufficient tokens");
        vault.proposeBatchWithdrawal(tokens, "Test");
    }

    // ==================== Guardian Voting Tests ====================

    function test_GuardianCanVoteOnBatch() public {
        BatchWithdrawalManager.TokenWithdrawal[] memory tokens = 
            new BatchWithdrawalManager.TokenWithdrawal[](1);
        tokens[0] = BatchWithdrawalManager.TokenWithdrawal(
            address(token1),
            1000 * 10**18,
            recipient
        );

        vm.prank(owner);
        uint256 batchId = vault.proposeBatchWithdrawal(tokens, "Test");
        
        vm.prank(guardian1);
        vault.voteApproveBatch(batchId);
        
        assertTrue(manager.hasVoted(batchId, guardian1));
    }

    function test_VoteRequiresGuardianSBT() public {
        address nonGuardian = address(0x5555555555555555555555555555555555555555);

        BatchWithdrawalManager.TokenWithdrawal[] memory tokens = 
            new BatchWithdrawalManager.TokenWithdrawal[](1);
        tokens[0] = BatchWithdrawalManager.TokenWithdrawal(
            address(token1),
            1000 * 10**18,
            recipient
        );

        vm.prank(owner);
        uint256 batchId = vault.proposeBatchWithdrawal(tokens, "Test");
        
        vm.prank(nonGuardian);
        vm.expectRevert("Not a guardian");
        vault.voteApproveBatch(batchId);
    }

    // ==================== Batch Execution Tests ====================

    function test_ExecuteSingleTokenBatch() public {
        BatchWithdrawalManager.TokenWithdrawal[] memory tokens = 
            new BatchWithdrawalManager.TokenWithdrawal[](1);
        tokens[0] = BatchWithdrawalManager.TokenWithdrawal(
            address(token1),
            1000 * 10**18,
            recipient
        );

        vm.prank(owner);
        uint256 batchId = vault.proposeBatchWithdrawal(tokens, "Test");
        
        vm.prank(guardian1);
        vault.voteApproveBatch(batchId);
        
        vm.prank(guardian2);
        vault.voteApproveBatch(batchId);
        
        uint256 beforeBalance = token1.balanceOf(recipient);
        vault.executeBatchWithdrawal(batchId);
        uint256 afterBalance = token1.balanceOf(recipient);
        
        assertEq(afterBalance - beforeBalance, 1000 * 10**18);
    }

    function test_ExecuteMultiTokenBatch() public {
        BatchWithdrawalManager.TokenWithdrawal[] memory tokens = 
            new BatchWithdrawalManager.TokenWithdrawal[](2);
        tokens[0] = BatchWithdrawalManager.TokenWithdrawal(
            address(token1),
            1000 * 10**18,
            recipient
        );
        tokens[1] = BatchWithdrawalManager.TokenWithdrawal(
            address(token2),
            2000 * 10**18,
            recipient
        );

        vm.prank(owner);
        uint256 batchId = vault.proposeBatchWithdrawal(tokens, "Multi-token");
        
        vm.prank(guardian1);
        vault.voteApproveBatch(batchId);
        
        vm.prank(guardian2);
        vault.voteApproveBatch(batchId);
        
        uint256 before1 = token1.balanceOf(recipient);
        uint256 before2 = token2.balanceOf(recipient);
        
        vault.executeBatchWithdrawal(batchId);
        
        uint256 after1 = token1.balanceOf(recipient);
        uint256 after2 = token2.balanceOf(recipient);
        
        assertEq(after1 - before1, 1000 * 10**18);
        assertEq(after2 - before2, 2000 * 10**18);
    }

    function test_ExecuteETHInBatch() public {
        BatchWithdrawalManager.TokenWithdrawal[] memory tokens = 
            new BatchWithdrawalManager.TokenWithdrawal[](1);
        tokens[0] = BatchWithdrawalManager.TokenWithdrawal(
            address(0),
            1 ether,
            recipient
        );

        vm.prank(owner);
        uint256 batchId = vault.proposeBatchWithdrawal(tokens, "ETH batch");
        
        vm.prank(guardian1);
        vault.voteApproveBatch(batchId);
        
        vm.prank(guardian2);
        vault.voteApproveBatch(batchId);
        
        uint256 beforeBalance = recipient.balance;
        vault.executeBatchWithdrawal(batchId);
        uint256 afterBalance = recipient.balance;
        
        assertEq(afterBalance - beforeBalance, 1 ether);
    }

    function test_ExecuteBatchPreventsDubleExecution() public {
        BatchWithdrawalManager.TokenWithdrawal[] memory tokens = 
            new BatchWithdrawalManager.TokenWithdrawal[](1);
        tokens[0] = BatchWithdrawalManager.TokenWithdrawal(
            address(token1),
            1000 * 10**18,
            recipient
        );

        vm.prank(owner);
        uint256 batchId = vault.proposeBatchWithdrawal(tokens, "Test");
        
        vm.prank(guardian1);
        vault.voteApproveBatch(batchId);
        
        vm.prank(guardian2);
        vault.voteApproveBatch(batchId);
        
        vault.executeBatchWithdrawal(batchId);
        
        vm.expectRevert("Already executed");
        vault.executeBatchWithdrawal(batchId);
    }

    // ==================== Balance Tests ====================

    function test_GetETHBalance() public {
        assertEq(vault.getETHBalance(), 10 ether);
    }

    function test_GetTokenBalance() public {
        assertEq(vault.getTokenBalance(address(token1)), 10000 * 10**18);
    }

    // ==================== Configuration Tests ====================

    function test_SetQuorum() public {
        vm.prank(owner);
        vault.setQuorum(3);
        assertEq(vault.quorum(), 3);
    }

    function test_UpdateGuardianToken() public {
        address newToken = address(0x6666666666666666666666666666666666666666);
        vm.prank(owner);
        vault.updateGuardianToken(newToken);
        assertEq(vault.guardianToken(), newToken);
    }

    function test_UpdateBatchManager() public {
        BatchWithdrawalManager newManager = new BatchWithdrawalManager();
        vm.prank(owner);
        vault.updateBatchManager(address(newManager));
        assertEq(vault.batchManager(), address(newManager));
    }
}
