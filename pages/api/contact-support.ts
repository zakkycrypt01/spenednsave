import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  // TODO: Integrate with your email service or support system here
  // For now, just log and return success
  console.log("Support request:", { name, email, message });
  return res.status(200).json({ success: true });
}
