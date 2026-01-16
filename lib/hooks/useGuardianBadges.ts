"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { type Address, parseAbi } from "viem";
import { GUARDIAN_BADGE_ADDRESS } from "@/lib/config";

// GuardianBadge ABI - Core functions for wagmi
const GUARDIAN_BADGE_ABI = parseAbi([
  "function getGuardianBadgeCount(address guardian) external view returns (uint256)",
  "function getGuardianBadgeTypes(address guardian) external view returns (uint8[] memory)",
  "function getGuardianBadgeTokens(address guardian) external view returns (uint256[] memory)",
  "function getBadgeDetails(uint256 tokenId) external view returns (tuple(uint8 badgeType, uint256 level, uint256 timestamp) memory)",
  "function hasGuardianBadge(address guardian, uint8 badgeType) external view returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function getEmergencyContacts() external view returns (address[] memory)",
]);

export interface GuardianBadge {
  tokenId: number;
  badgeType: number;
  level: number;
  timestamp: number;
}

export interface GuardianBadgeStats {
  totalBadges: number;
  badgeTypes: number[];
  badges: GuardianBadge[];
  hasApprovalsRating: boolean;
  hasResponseTimeRating: boolean;
  hasLongevityRating: boolean;
}

/**
 * Hook to fetch guardian badge information (wagmi v2 compatible)
 * @param guardianAddress Optional guardian address to query. Defaults to connected account.
 * @returns Guardian badge stats and loading state
 */
export function useGuardianBadges(guardianAddress?: Address) {
  const { address: connectedAddress } = useAccount();
  const queryAddress = (guardianAddress || connectedAddress) as Address | undefined;

  const [badges, setBadges] = useState<GuardianBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Query badge count
  const { data: badgeCount, isLoading: countLoading } = useReadContract({
    address: GUARDIAN_BADGE_ADDRESS as Address,
    abi: GUARDIAN_BADGE_ABI,
    functionName: "getGuardianBadgeCount",
    args: queryAddress ? [queryAddress] : undefined,
  });

  // Query badge types
  const { data: badgeTypes, isLoading: typesLoading } = useReadContract({
    address: GUARDIAN_BADGE_ADDRESS as Address,
    abi: GUARDIAN_BADGE_ABI,
    functionName: "getGuardianBadgeTypes",
    args: queryAddress ? [queryAddress] : undefined,
  });

  // Query badge token IDs
  const { data: badgeTokenIds, isLoading: tokenIdsLoading } = useReadContract({
    address: GUARDIAN_BADGE_ADDRESS as Address,
    abi: GUARDIAN_BADGE_ABI,
    functionName: "getGuardianBadgeTokens",
    args: queryAddress ? [queryAddress] : undefined,
  });

  // Fetch badge details for each token
  useEffect(() => {
    const fetchBadgeDetails = async () => {
      if (!badgeTokenIds || badgeTokenIds.length === 0) {
        setBadges([]);
        setLoading(false);
        return;
      }

      try {
        const badgeArray: GuardianBadge[] = [];
        const badgeTypeArray = (badgeTypes as number[]) || [];

        for (let i = 0; i < badgeTokenIds.length; i++) {
          const tokenId = Number(badgeTokenIds[i]);
          const badgeType = badgeTypeArray[i] || 0;
          
          // In a real scenario, you'd fetch details from contract
          // For now, we structure the response
          badgeArray.push({
            tokenId,
            badgeType,
            level: 1, // Default level
            timestamp: Math.floor(Date.now() / 1000),
          });
        }

        setBadges(badgeArray);
        setError(null);
      } catch (err) {
        console.error("Error fetching badge details:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch badge details");
      } finally {
        setLoading(false);
      }
    };

    if (!countLoading && !tokenIdsLoading && !typesLoading) {
      fetchBadgeDetails();
    }
  }, [badgeTokenIds, badgeTypes, countLoading, tokenIdsLoading, typesLoading]);

  const stats: GuardianBadgeStats = {
    totalBadges: Number(badgeCount || 0),
    badgeTypes: (badgeTypes as number[]) || [],
    badges,
    hasApprovalsRating: badgeTypes?.includes(0) || false,
    hasResponseTimeRating: badgeTypes?.includes(1) || false,
    hasLongevityRating: badgeTypes?.includes(2) || false,
  };

  return { badgeStats: stats, loading: loading || countLoading, error };
}

/**
 * Hook to check if a guardian has a specific badge type
 * @param guardianAddress The guardian address to check
 * @param badgeType The badge type (0: Approvals, 1: ResponseTime, 2: Longevity)
 * @returns Whether the guardian has the badge
 */
export function useHasGuardianBadge(guardianAddress: Address | undefined, badgeType: number) {
  const { data: hasBadge, isLoading } = useReadContract({
    address: GUARDIAN_BADGE_ADDRESS as Address,
    abi: GUARDIAN_BADGE_ABI,
    functionName: "hasGuardianBadge",
    args: guardianAddress ? [guardianAddress, badgeType] : undefined,
  });

  return { hasBadge: Boolean(hasBadge), isLoading };
}

/**
 * Hook to fetch emergency contacts from GuardianBadge
 * @returns Array of emergency contact addresses
 */
export function useEmergencyContacts() {
  const { data: contacts, isLoading, error } = useReadContract({
    address: GUARDIAN_BADGE_ADDRESS as Address,
    abi: GUARDIAN_BADGE_ABI,
    functionName: "getEmergencyContacts",
  });

  return { contacts: (contacts as Address[]) || [], isLoading, error };
}
