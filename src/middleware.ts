import { defineMiddleware } from 'astro:middleware';
import { createHash } from 'crypto';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies } = context;

  if (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login')) {
    const session = cookies.get('session')?.value;
    const adminPassword = import.meta.env.ADMIN_PASSWORD || 'admin123';
    const expectedToken = createHash('sha256').update(adminPassword).digest('hex');

    if (session !== expectedToken) {
      return context.redirect('/admin/login');
    }
  }

  return next();
});
