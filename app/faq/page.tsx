import Link from "next/link";

export default function FaqPage() {
  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions (FAQ)</h1>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">What is Spend & Save?</h2>
          <p>
            Spend & Save is a social savings vault on Base, designed to help you save securely with the help of trusted guardians. You can deposit funds, assign guardians, and set up withdrawal approvals for extra security.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">How do I add or remove a guardian?</h2>
          <p>
            Go to the Guardians section in your dashboard. You can invite new guardians or remove existing ones. Guardians help approve withdrawals and keep your funds safe.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">How do I withdraw funds?</h2>
          <p>
            Submit a withdrawal request from your vault. Your guardians will be notified and must approve the request before funds are released.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">What happens if I lose access to my wallet?</h2>
          <p>
            If you lose access, your guardians can help you recover your funds by approving a transfer to a new wallet. Make sure your guardians are people you trust.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">Where can I get more help?</h2>
          <p>
            If your question isn't answered here, please contact our support team or visit our community channels for assistance.
          </p>
        </section>
      </div>
      <div className="mt-10 text-center">
        <Link href="/" className="text-blue-600 hover:underline">Back to Home</Link>
      </div>
    </main>
  );
}
