import fs from 'fs';

export async function POST(req) {
  try {
    const payload = await req.json();
    // For now, just log to server console. In production, forward to analytics provider.
    console.log('[analytics/track] event=', payload.event, 'meta=', payload.meta || {});
    // Optionally, persist to a local file for dev inspection (append)
    try {
      fs.appendFileSync('analytics.log', JSON.stringify({ ts: Date.now(), ...payload }) + '\n');
    } catch (e) {
      // ignore
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('analytics/track error', e);
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
