import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR } from '../../utils/content';

export const prerender = false;

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
};

export const GET: APIRoute = async ({ params }) => {
  const filename = params.filename;
  if (!filename) return new Response('Not found', { status: 404 });

  const safeName = path.basename(filename);
  const filePath = path.join(UPLOAD_DIR, safeName);

  if (!fs.existsSync(filePath)) return new Response('Not found', { status: 404 });

  const ext = safeName.split('.').pop()?.toLowerCase() || '';
  const contentType = MIME[ext] || 'application/octet-stream';
  const buffer = fs.readFileSync(filePath);

  return new Response(buffer, {
    status: 200,
    headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000' },
  });
};
