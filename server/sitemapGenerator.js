/**
 * Dynamic Sitemap Generator
 * 
 * Generates an XML sitemap updated continuously for Googlebot and Bingbot fast indexing.
 */

import { db } from './db.js';

export function generateSitemapXml(req) {
  const host = req ? (req.get('host') || 'ganeshmandal.in') : 'ganeshmandal.in';
  const protocol = req && (req.protocol === 'https' || req.get('x-forwarded-proto') === 'https') ? 'https' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const now = new Date().toISOString();

  const mandals = db.getAllMandals();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <!-- Core Static Hubs -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/press</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/poster</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/pune</loc>
    <lastmod>${now}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/mumbai</loc>
    <lastmod>${now}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
`;

  mandals.forEach(m => {
    const isFamous = m.is_famous || m.rank <= 5;
    xml += `  <url>
    <loc>${baseUrl}/mandal/${m.id}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>${isFamous ? '0.95' : '0.80'}</priority>
  </url>
`;
  });

  xml += `</urlset>`;
  return xml;
}
