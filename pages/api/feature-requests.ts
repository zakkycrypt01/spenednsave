import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { feature } = req.body;
  if (!feature) {
    return res.status(400).json({ error: "Feature request is required" });
  }
  // TODO: Integrate with your database, email, or ticketing system
  console.log("Feature request:", feature);
  return res.status(200).json({ success: true });
}
