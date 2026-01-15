import type { NextApiRequest, NextApiResponse } from "next";

// This is a placeholder. Integrate with your email service for real delivery.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { to } = req.body;
  if (!to) {
    return res.status(400).json({ error: "Missing email address" });
  }
  // TODO: Integrate with your email service (SMTP, Resend, etc.)
  // For now, just log and return success
  console.log(`Test email sent to: ${to}`);
  return res.status(200).json({ success: true });
}
