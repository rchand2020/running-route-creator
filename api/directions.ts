import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ORS_API_KEY not configured' });
  }

  const { coordinates, preference } = req.body;
  const body: Record<string, unknown> = { coordinates };
  if (preference) body.preference = preference;

  const orsRes = await fetch(
    `https://api.openrouteservice.org/v2/directions/foot-walking/geojson?api_key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  const data = await orsRes.json();
  return res.status(orsRes.status).json(data);
}
