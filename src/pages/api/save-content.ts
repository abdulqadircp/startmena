import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

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
    const contentPath = path.join(process.cwd(), 'src', 'data', 'content.json');
    fs.writeFileSync(contentPath, JSON.stringify(body, null, 2), 'utf-8');
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to save' }), { status: 500 });
  }
};
