import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ORS_API_KEY not configured' });
  }

  // Forward the raw query string to preserve dotted param keys
  const queryString = req.url?.split('?')[1] || '';

  const orsRes = await fetch(
    `https://api.openrouteservice.org/geocode/search?${queryString}&api_key=${apiKey}`,
  );

  const data = await orsRes.json();
  return res.status(orsRes.status).json(data);
}
