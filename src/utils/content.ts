import fs from 'fs';
import path from 'path';

export interface Stat  { number: string; label: string }
export interface Card  { icon: string; title: string; description: string }

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
}

const CONTENT_PATH = path.join(process.cwd(), 'src', 'data', 'content.json');

/** Always reads from disk so admin edits are reflected without a restart. */
export function getContent(): SiteContent {
  return JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf-8'));
}

export function whatsappUrl(site: SiteContent['site']): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsapp_message)}`;
}
