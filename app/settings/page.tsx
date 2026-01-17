"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Moon, Lock, Wallet, User } from 'lucide-react';
import { ThemeToggle } from '@/components/settings/theme-toggle';
import { NotificationPreferences } from '@/components/notifications/notification-preferences';
import { SecuritySettings } from '@/components/settings/security-settings';
import { WalletManagement } from '@/components/settings/wallet-management';
import { AccountPreferences } from '@/components/settings/account-preferences';
import { EmailPreferences } from '@/components/settings/email-preferences';
import { VaultTransfer } from '@/components/settings/vault-transfer';
import { VaultAnalytics } from '@/components/settings/vault-analytics';
import { useAccount } from 'wagmi';

export default function SettingsPage() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState("appearance");

  // Handle tab from URL params if provided
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-lg">
              <SettingsIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account, security, and preferences</p>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8 bg-card border border-border">
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              <span className="hidden sm:inline">Appearance</span>
              <span className="sm:hidden">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">notifications</span>
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
              <span className="sm:hidden">Safe</span>
            </TabsTrigger>
            <TabsTrigger value="wallets" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Wallets</span>
              <span className="sm:hidden">Wallets</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
              <span className="sm:hidden">Acct</span>
            </TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <ThemeToggle />
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <NotificationPreferences />
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <SecuritySettings />
            </div>
          </TabsContent>

          {/* Wallets Tab */}
          <TabsContent value="wallets" className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <WalletManagement />
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <AccountPreferences />
            </div>
          </TabsContent>
        </Tabs>

        {/* Additional Settings Sections */}
        <div className="mt-12 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              Vault Management
            </h2>
            <div className="space-y-6">
              {/* Email Preferences */}
              <div className="bg-card border border-border rounded-lg p-6">
                <EmailPreferences />
              </div>

              {/* Vault Analytics */}
              {address && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <VaultAnalytics vaultAddress={address} />
                </div>
              )}

              {/* Vault Transfer */}
              <div className="bg-card border border-border rounded-lg p-6">
                <VaultTransfer />
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-4">
              These actions are permanent and cannot be undone. Proceed with caution.
            </p>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
              Sign Out of All Sessions
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
