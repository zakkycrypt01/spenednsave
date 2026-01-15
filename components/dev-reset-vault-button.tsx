"use client";
import { useState } from "react";

export function DevResetVaultButton() {
  const [cleared, setCleared] = useState(false);
  const [error, setError] = useState("");

  function handleClearCache() {
    setError("");
    try {
      // Remove all localStorage keys related to vaults, deposits, activities, etc.
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith("deposits-cache-") ||
          key.startsWith("deposits-debug-") ||
          key.startsWith("activities-migrated-") ||
          key.startsWith("vault-")
        ) {
          localStorage.removeItem(key);
        }
      });
      setCleared(true);
      setTimeout(() => setCleared(false), 2000);
    } catch (e) {
      setError("Failed to clear cache.");
    }
  }

  return (
    <button
      className="px-4 py-2 bg-red-600 text-white rounded mt-4 hover:bg-red-700 disabled:opacity-60"
      onClick={handleClearCache}
      type="button"
    >
      Reset Vault / Clear Cache
      {cleared && <span className="ml-2 text-green-200">✔</span>}
      {error && <span className="ml-2 text-yellow-200">{error}</span>}
    </button>
  );
}
