'use client';

import { useState, useEffect } from 'react';
import { usePublicClient, useBlockNumber } from 'wagmi';
import { type Address, type Hex } from 'viem';
import { GuardianSBTABI } from '@/lib/abis/GuardianSBT';
import { SpendVaultABI } from '@/lib/abis/SpendVault';
import { getLogsInChunks } from '@/lib/utils/chunked-logs';

export interface Guardian {
    address: Address;
    tokenId: bigint;
    addedAt: number;
    blockNumber: bigint;
    txHash: Hex;
}

export interface WithdrawalEvent {
    token: Address;
    recipient: Address;
    amount: bigint;
    reason: string;
    timestamp: number;
    blockNumber: bigint;
    txHash: Hex;
}

export interface DepositEvent {
    token: Address;
    from: Address;
    amount: bigint;
    timestamp: number;
    blockNumber: bigint;
    txHash: Hex;
}

/**
 * Hook to fetch all current guardians for a vault
 */
export function useGuardians(guardianTokenAddress?: Address) {
    const publicClient = usePublicClient();
    const { data: currentBlock } = useBlockNumber();
    const [guardians, setGuardians] = useState<Guardian[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchGuardians() {
            if (!guardianTokenAddress || !publicClient || !currentBlock) {
                setGuardians([]);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Start from genesis or recent blocks
                const fromBlock = 0n; // Fetch from genesis to ensure we get all events
                
                console.log('[useGuardians] Fetching guardians from block', fromBlock, 'to latest');
                console.log('[useGuardians] Guardian token address:', guardianTokenAddress);
                
                const addedLogs = await getLogsInChunks(
                    publicClient,
                    {
                        address: guardianTokenAddress,
                        event: {
                            type: 'event',
                            name: 'GuardianAdded',
                            inputs: [
                                { type: 'address', indexed: true, name: 'guardian' },
                                { type: 'uint256', indexed: false, name: 'tokenId' },
                            ],
                        },
                    },
                    fromBlock,
                    'latest'
                );

                console.log('[useGuardians] Found', addedLogs.length, 'GuardianAdded events');

                const removedLogs = await getLogsInChunks(
                    publicClient,
                    {
                        address: guardianTokenAddress,
                        event: {
                            type: 'event',
                            name: 'GuardianRemoved',
                            inputs: [
                                { type: 'address', indexed: true, name: 'guardian' },
                                { type: 'uint256', indexed: false, name: 'tokenId' },
                            ],
                        },
                    },
                    fromBlock,
                    'latest'
                );

                console.log('[useGuardians] Found', removedLogs.length, 'GuardianRemoved events');

                // Build map of current guardians (added but not removed)
                const guardianMap = new Map<string, Guardian>();
                const removedSet = new Set<string>();

                // Track removed guardians
                for (const log of removedLogs) {
                    const args = (log as any).args;
                    if (args?.guardian) {
                        removedSet.add(args.guardian.toLowerCase());
                    }
                }

                // Add guardians that haven't been removed
                for (const log of addedLogs) {
                    const args = (log as any).args;
                    const blockNumber = log.blockNumber;
                    const transactionHash = log.transactionHash;
                    
                    if (!args?.guardian || blockNumber === null || transactionHash === null) continue;
                    
                    if (!removedSet.has(args.guardian.toLowerCase())) {
                        const block = await publicClient.getBlock({ blockNumber });
                        
                        guardianMap.set(args.guardian.toLowerCase(), {
                            address: args.guardian as Address,
                            tokenId: args.tokenId as bigint,
                            addedAt: Number(block.timestamp) * 1000,
                            blockNumber,
                            txHash: transactionHash as Hex,
                        });
                    }
                }

                const guardianList = Array.from(guardianMap.values())
                    .sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));

                console.log('[useGuardians] Final guardian list:', guardianList);
                setGuardians(guardianList);
            } catch (err) {
                console.error('[useGuardians] Error fetching guardians:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch guardians'));
            } finally {
                setIsLoading(false);
            }
        }

        fetchGuardians();
    }, [guardianTokenAddress, publicClient, currentBlock]);

    return { guardians, isLoading, error };
}

/**
 * Hook to fetch withdrawal history
 */
export function useWithdrawalHistory(vaultAddress?: Address, limit = 50) {
    const publicClient = usePublicClient();
    const { data: currentBlock } = useBlockNumber();
    const [withdrawals, setWithdrawals] = useState<WithdrawalEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchWithdrawals() {
            if (!vaultAddress || !publicClient || !currentBlock) {
                setWithdrawals([]);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const fromBlock = 0n; // Fetch from genesis
                console.log('[useWithdrawalHistory] Fetching from block', fromBlock, 'for vault:', vaultAddress);
                
                const withdrawalLogs = await getLogsInChunks(
                    publicClient,
                    {
                        address: vaultAddress,
                        event: {
                            type: 'event',
                            name: 'Withdrawn',
                            inputs: [
                                { type: 'address', indexed: true, name: 'token' },
                                { type: 'address', indexed: true, name: 'recipient' },
                                { type: 'uint256', indexed: false, name: 'amount' },
                                { type: 'string', indexed: false, name: 'reason' },
                            ],
                        },
                    },
                    fromBlock,
                    'latest'
                );

                console.log('[useWithdrawalHistory] Found', withdrawalLogs.length, 'withdrawal events');
                const withdrawalEvents: WithdrawalEvent[] = [];

                for (const log of withdrawalLogs.slice(-limit)) {
                    const args = (log as any).args;
                    const blockNumber = log.blockNumber;
                    const transactionHash = log.transactionHash;
                    
                    if (!args || blockNumber === null || transactionHash === null) continue;
                    
                    const block = await publicClient.getBlock({ blockNumber });

                    withdrawalEvents.push({
                        token: args.token as Address,
                        recipient: args.recipient as Address,
                        amount: args.amount as bigint,
                        reason: args.reason as string,
                        timestamp: Number(block.timestamp) * 1000,
                        blockNumber,
                        txHash: transactionHash as Hex,
                    });
                }

                setWithdrawals(withdrawalEvents.reverse());
            } catch (err) {
                console.error('Error fetching withdrawals:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch withdrawals'));
            } finally {
                setIsLoading(false);
            }
        }

        fetchWithdrawals();
    }, [vaultAddress, publicClient, currentBlock, limit]);

    return { withdrawals, isLoading, error };
}

/**
 * Hook to fetch deposit history
 */
export function useDepositHistory(vaultAddress?: Address, limit = 50) {
    const publicClient = usePublicClient();
    const { data: currentBlock } = useBlockNumber();
    const [deposits, setDeposits] = useState<DepositEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchDeposits() {
            if (!vaultAddress || !publicClient || !currentBlock) {
                setDeposits([]);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const fromBlock = 0n; // Fetch from genesis
                console.log('[useDepositHistory] Fetching from block', fromBlock, 'for vault:', vaultAddress);
                
                const depositLogs = await getLogsInChunks(
                    publicClient,
                    {
                        address: vaultAddress,
                        event: {
                            type: 'event',
                            name: 'Deposited',
                            inputs: [
                                { type: 'address', indexed: true, name: 'token' },
                                { type: 'address', indexed: true, name: 'from' },
                                { type: 'uint256', indexed: false, name: 'amount' },
                            ],
                        },
                    },
                    fromBlock,
                    'latest'
                );

                console.log('[useDepositHistory] Found', depositLogs.length, 'deposit events');
                const depositEvents: DepositEvent[] = [];

                for (const log of depositLogs.slice(-limit)) {
                    const args = (log as any).args;
                    const blockNumber = log.blockNumber;
                    const transactionHash = log.transactionHash;
                    
                    if (!args || blockNumber === null || transactionHash === null) continue;
                    
                    const block = await publicClient.getBlock({ blockNumber });

                    depositEvents.push({
                        token: args.token as Address,
                        from: args.from as Address,
                        amount: args.amount as bigint,
                        timestamp: Number(block.timestamp) * 1000,
                        blockNumber,
                        txHash: transactionHash as Hex,
                    });
                }

                setDeposits(depositEvents.reverse());
            } catch (err) {
                console.error('Error fetching deposits:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch deposits'));
            } finally {
                setIsLoading(false);
            }
        }

        fetchDeposits();
    }, [vaultAddress, publicClient, currentBlock, limit]);

    return { deposits, isLoading, error };
}

/**
 * Hook to get all activity (deposits, withdrawals, guardian changes)
 */
export function useVaultActivity(vaultAddress?: Address, guardianTokenAddress?: Address, limit = 50) {
    const { deposits, isLoading: depositsLoading } = useDepositHistory(vaultAddress, limit);
    const { withdrawals, isLoading: withdrawalsLoading } = useWithdrawalHistory(vaultAddress, limit);
    const { guardians, isLoading: guardiansLoading } = useGuardians(guardianTokenAddress);

    const [activities, setActivities] = useState<any[]>([]);
    const isLoading = depositsLoading || withdrawalsLoading || guardiansLoading;

    useEffect(() => {
        console.log('[useVaultActivity] Combining activities...');
        console.log('[useVaultActivity] deposits:', deposits.length);
        console.log('[useVaultActivity] withdrawals:', withdrawals.length);
        console.log('[useVaultActivity] guardians:', guardians.length);
        
        const allActivities = [
            ...deposits.map(d => ({
                type: 'deposit' as const,
                timestamp: d.timestamp,
                blockNumber: d.blockNumber,
                data: d,
            })),
            ...withdrawals.map(w => ({
                type: 'withdrawal' as const,
                timestamp: w.timestamp,
                blockNumber: w.blockNumber,
                data: w,
            })),
            ...guardians.map(g => ({
                type: 'guardian_added' as const,
                timestamp: g.addedAt,
                blockNumber: g.blockNumber,
                data: g,
            })),
        ];

        allActivities.sort((a, b) => b.timestamp - a.timestamp);
        const limited = allActivities.slice(0, limit);
        console.log('[useVaultActivity] Final activities:', limited.length);
        setActivities(limited);
    }, [deposits, withdrawals, guardians, limit]);

    return { activities, isLoading };
}

/**
 * Hook to get emergency unlock state
 */
export function useEmergencyUnlockState(unlockRequestTime?: bigint, timeRemaining?: bigint) {
    const [state, setState] = useState<{
        isActive: boolean;
        canExecute: boolean;
        timeLeft: { d: number; h: number; m: number; s: number } | null;
    }>({
        isActive: false,
        canExecute: false,
        timeLeft: null,
    });

    useEffect(() => {
        if (!unlockRequestTime || unlockRequestTime === 0n) {
            setState({
                isActive: false,
                canExecute: false,
                timeLeft: null,
            });
            return;
        }

        const isActive = unlockRequestTime > 0n;
        const remaining = timeRemaining ? Number(timeRemaining) : 0;
        const canExecute = remaining === 0;

        if (remaining > 0) {
            const d = Math.floor(remaining / (60 * 60 * 24));
            const h = Math.floor((remaining % (60 * 60 * 24)) / (60 * 60));
            const m = Math.floor((remaining % (60 * 60)) / 60);
            const s = Math.floor(remaining % 60);

            setState({
                isActive,
                canExecute,
                timeLeft: { d, h, m, s },
            });
        } else {
            setState({
                isActive,
                canExecute,
                timeLeft: { d: 0, h: 0, m: 0, s: 0 },
            });
        }
    }, [unlockRequestTime, timeRemaining]);

    return state;
}

