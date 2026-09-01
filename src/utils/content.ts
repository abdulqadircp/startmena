import fs from 'fs';
import path from 'path';

export interface Stat  { number: string; label: string }
export interface Card  { icon: string; title: string; description: string }

export interface Banner {
  enabled: boolean;
  type: 'bar' | 'popup';
  message: string;
  subtext: string;
  cta_text: string;
  cta_link: string;
  bg_color: string;
  text_color: string;
  dismissible: boolean;
}

export interface SiteContent {
  site: {
    name: string; email: string;
    whatsapp: string; whatsapp_message: string; logo: string;
  };
  hero: {
    badge: string; heading_line1: string; heading_highlight: string;
    subheading: string; cta_primary: string; cta_secondary: string;
    background_image: string;
  };
  about: {
    section_label: string; heading: string;
    paragraph1: string; paragraph2: string;
    image: string; stats: Stat[];
  };
  services: { section_label: string; heading: string; subheading: string; items: Card[] };
  why:      { section_label: string; heading: string; subheading: string; items: Card[] };
  contact: {
    section_label: string; heading: string; subheading: string;
    footer_note: string; whatsapp_button: string; email_button: string;
  };
  banner: Banner;
}

// DATA_DIR: set this env var on Railway and mount a Volume there.
// Falls back to src/data so local dev works with no configuration.
const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'src', 'data');

// The default shipped with the repo — used as fallback when the live file doesn't exist yet.
const DEFAULT_CONTENT_PATH = path.join(process.cwd(), 'src', 'data', 'content.json');

export const LIVE_CONTENT_PATH = path.join(DATA_DIR, 'content.json');
export const UPLOAD_DIR        = path.join(DATA_DIR, 'uploads');

/** Always reads from disk so admin edits are reflected without a restart. */
export function getContent(): SiteContent {
  const filePath = fs.existsSync(LIVE_CONTENT_PATH) ? LIVE_CONTENT_PATH : DEFAULT_CONTENT_PATH;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function whatsappUrl(site: SiteContent['site']): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsapp_message)}`;
}
