/**
 * ============================================================================
 * VERCEL SERVERLESS BRIDGE — CRAVE PARCEL (/api/sync.js)
 * ============================================================================
 * Menghubungkan frontend Vercel ke Google Apps Script secara otomatis & aman
 * tanpa perlu menuliskan URL Google Apps Script di dalam kode HTML.
 *
 * Cara Setup di Vercel:
 * Masuk ke Project Settings -> Environment Variables -> Tambahkan:
 * Key   : GAS_WEBAPP_URL
 * Value : https://script.google.com/macros/s/xxxxx/exec
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const gasUrl = process.env.GAS_WEBAPP_URL;

  if (!gasUrl) {
    return res.status(200).json({
      status: 'unconfigured',
      message: 'Environment Variable GAS_WEBAPP_URL belum diatur di Vercel Settings.'
    });
  }

  try {
    if (req.method === 'GET') {
      const urlObj = new URL(gasUrl);
      Object.entries(req.query || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          urlObj.searchParams.set(k, String(v));
        }
      });

      const response = await fetch(urlObj.toString(), {
        method: 'GET',
        redirect: 'follow'
      });
      const text = await response.text();
      return res.status(200).json(JSON.parse(text));
    }

    if (req.method === 'POST') {
      const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
      const response = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: payload,
        redirect: 'follow'
      });
      const text = await response.text();
      return res.status(200).json(JSON.parse(text));
    }

    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  } catch (error) {
    return res.status(502).json({
      status: 'error',
      message: 'Gagal terhubung ke Google Apps Script: ' + (error.message || String(error))
    });
  }
}