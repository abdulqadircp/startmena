import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { UPLOAD_DIR } from '../../utils/content';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  const adminPassword = import.meta.env.ADMIN_PASSWORD || 'admin123';
  const expectedToken = createHash('sha256').update(adminPassword).digest('hex');
  if (cookies.get('session')?.value !== expectedToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      return new Response(JSON.stringify({ urls: [] }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      });
    }

    const urls = fs.readdirSync(UPLOAD_DIR)
      .map(name => ({ name, mtimeMs: fs.statSync(path.join(UPLOAD_DIR, name)).mtimeMs }))
      .sort((a, b) => b.mtimeMs - a.mtimeMs)
      .slice(0, 5)
      .map(f => `/uploads/${f.name}`);

    return new Response(JSON.stringify({ urls }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ urls: [] }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }
};
