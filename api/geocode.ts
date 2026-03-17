import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ORS_API_KEY not configured' });
  }

  const params = new URLSearchParams();
  const allowed = ['text', 'boundary.country', 'focus.point.lat', 'focus.point.lon', 'size'];
  for (const key of allowed) {
    const val = req.query[key];
    if (typeof val === 'string') params.set(key, val);
  }

  const orsRes = await fetch(
    `https://api.openrouteservice.org/geocode/search?${params}`,
    { headers: { Authorization: apiKey } }
  );

  const data = await orsRes.json();
  return res.status(orsRes.status).json(data);
}
