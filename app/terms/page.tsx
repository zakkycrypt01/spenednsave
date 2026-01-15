export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4">By using SpendGuard, you agree to the following terms and conditions. Please read them carefully.</p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>SpendGuard is provided as-is, without warranties of any kind.</li>
        <li>You are responsible for the security of your wallet and private keys.</li>
        <li>Guardians are trusted by you; SpendGuard is not responsible for their actions.</li>
        <li>All transactions are final and irreversible on the blockchain.</li>
        <li>We may update these terms at any time. Continued use constitutes acceptance.</li>
      </ul>
      <p>If you have questions about these terms, please contact support.</p>
    </main>
  );
}
