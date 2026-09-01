import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { LIVE_CONTENT_PATH } from '../../utils/content';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const adminPassword = import.meta.env.ADMIN_PASSWORD || 'admin123';
  const { createHash } = await import('crypto');
  const expectedToken = createHash('sha256').update(adminPassword).digest('hex');

  if (cookies.get('session')?.value !== expectedToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const dir = path.dirname(LIVE_CONTENT_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LIVE_CONTENT_PATH, JSON.stringify(body, null, 2), 'utf-8');
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to save' }), { status: 500 });
  }
};
