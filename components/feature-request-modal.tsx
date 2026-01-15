"use client";
import { useState } from "react";

export function FeatureRequestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [feature, setFeature] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/feature-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit request.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Failed to submit request.");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {submitted ? (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Thank you!</h2>
            <p>Your feature request has been submitted.</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Feature Request / Feedback</h2>
            <textarea
              className="w-full px-3 py-2 border rounded"
              rows={5}
              value={feature}
              onChange={e => setFeature(e.target.value)}
              placeholder="Describe your idea or feedback..."
              required
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
