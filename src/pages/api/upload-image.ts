import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

export const prerender = false;

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export const POST: APIRoute = async ({ request, cookies }) => {
  const adminPassword = import.meta.env.ADMIN_PASSWORD || 'admin123';
  const { createHash } = await import('crypto');
  const expectedToken = createHash('sha256').update(adminPassword).digest('hex');

  if (cookies.get('session')?.value !== expectedToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    if (!allowed.includes(ext)) {
      return new Response(JSON.stringify({ error: 'File type not allowed' }), { status: 400 });
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);

    // Keep only the 5 most recent uploads; delete the rest
    const MAX_UPLOADS = 5;
    const files = fs.readdirSync(UPLOAD_DIR)
      .map(name => ({ name, mtimeMs: fs.statSync(path.join(UPLOAD_DIR, name)).mtimeMs }))
      .sort((a, b) => a.mtimeMs - b.mtimeMs); // oldest first

    if (files.length > MAX_UPLOADS) {
      files.slice(0, files.length - MAX_UPLOADS).forEach(f => {
        fs.unlinkSync(path.join(UPLOAD_DIR, f.name));
      });
    }

    return new Response(JSON.stringify({ url: `/uploads/${filename}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
  }
};
