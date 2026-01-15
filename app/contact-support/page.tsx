"use client";
import { useState } from "react";

export default function ContactSupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/contact-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send message. Please try again later.");
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setError("Failed to send message. Please try again later.");
    }
  }

  if (submitted) {
    return (
      <main className="max-w-md mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Contact Support</h1>
        <p className="text-green-600 font-medium">Thank you! Your message has been sent.</p>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Contact Support</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            className="w-full px-3 py-2 border rounded"
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
        >
          Send Message
        </button>
      </form>
    </main>
  );
}
