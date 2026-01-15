import { EmailPreferences } from '@/components/settings/email-preferences';

export default function SettingsPage() {
  // TODO: Load user's current email and opt-in status from backend
  // Handler stubs for delete account and remove email
  const handleDeleteAccount = () => {
    // TODO: Implement delete account logic (API call, confirmation, etc.)
    alert('Delete account functionality coming soon.');
  };
  const handleRemoveEmail = () => {
    // TODO: Implement remove email logic (API call, confirmation, etc.)
    alert('Remove email functionality coming soon.');
  };
  return (
    <main className="max-w-2xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <EmailPreferences />
      <div className="mt-8 flex flex-col gap-4">
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          onClick={handleDeleteAccount}
        >
          Delete Account
        </button>
        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          onClick={handleRemoveEmail}
        >
          Remove Email
        </button>
      </div>
    </main>
  );
}
