/**
 * Programmatic SEO & Bot Crawler Prerendering Engine
 * 
 * Serves optimized HTML with dynamic meta tags, OpenGraph previews,
 * and Schema.org JSON-LD rich snippets for search engines & social crawlers.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db.js';
import { calculateDynamicCrowd } from './crowdModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

let baseIndexHtml = null;

function getBaseIndexHtml() {
  if (!baseIndexHtml || process.env.NODE_ENV !== 'production') {
    baseIndexHtml = fs.readFileSync(path.join(ROOT_DIR, 'public', 'index.html'), 'utf8');
  }
  return baseIndexHtml;
}

export function renderMandalPage(mandalId, req) {
  const template = getBaseIndexHtml();
  let mandal = db.getMandal(mandalId);
  if (!mandal) {
    const all = db.getAllMandals();
    mandal = all.find(m => m.id.includes(mandalId) || mandalId.includes(m.id));
  }

  if (!mandal) {
    return template;
  }

  const dynamic = calculateDynamicCrowd(mandal);
  const density = dynamic.density_score ?? 35;
  const waitMins = dynamic.estimated_wait_minutes ?? 20;
  const rushCategory = dynamic.rush_category || (density >= 85 ? 'Jam-Packed' : density >= 65 ? 'Full Rush' : density >= 45 ? 'Thoda Rush' : 'Khali');
  const cityName = (mandal.city_id?.includes('mumbai') || mandal.city?.toLowerCase() === 'mumbai') ? 'MUMBAI' : 'PUNE';

  const roads = dynamic.top_roads || mandal.top_roads || [];
  const fastestRoadObj = roads.find(r => r.color === 'blue') || roads.find(r => r.color === 'orange') || roads[0];
  const fastestRoad = fastestRoadObj?.name ? `${fastestRoadObj.name}${fastestRoadObj.avg_speed ? ` (${fastestRoadObj.avg_speed})` : ''}` : 'Main Corridor';

  const host = req.get('host') || 'ganeshmandal.in';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const canonicalUrl = `${protocol}://${host}/mandal/${mandal.id}`;
  const murtiUrl = mandal.image_url
    ? `${protocol}://${host}${mandal.image_url}`
    : `${protocol}://${host}/images/mandals/dagdusheth_idol.jpg`;
  const imageType = mandal.image_url?.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

  const title = `${mandal.name} Live Crowd Status (${density}% ${rushCategory}, ~${waitMins}m Wait) — GaneshMandal.in`;
  const description = `Live queue wait time ~${waitMins} mins, real-time crowd rush ${density}% (${rushCategory}), fastest approach corridor ${fastestRoad} for ${mandal.name} in ${cityName}. Verified live festival telemetry.`;

  const schemaJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CivicStructure",
        "@id": `${canonicalUrl}#mandal`,
        "name": mandal.name,
        "description": description,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": mandal.address || mandal.name,
          "addressLocality": mandal.city || "Pune",
          "addressRegion": "Maharashtra",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": mandal.latitude,
          "longitude": mandal.longitude
        },
        "isAccessibleForFree": true,
        "openingHours": "Mo-Su 05:00-23:59",
        "image": murtiUrl
      },
      {
        "@type": "Event",
        "@id": `${canonicalUrl}#darshan`,
        "name": `${mandal.name} Sarvajanik Ganeshotsav 2026`,
        "description": description,
        "startDate": "2026-09-07T05:00:00+05:30",
        "endDate": "2026-09-18T23:59:59+05:30",
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": {
          "@type": "Place",
          "name": mandal.name,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": mandal.city || "Pune",
            "addressRegion": "Maharashtra",
            "addressCountry": "IN"
          }
        },
        "organizer": {
          "@type": "Organization",
          "name": mandal.name,
          "url": canonicalUrl
        },
        "publisher": {
          "@type": "Organization",
          "name": "GaneshMandal.in",
          "url": `${protocol}://${host}/`,
          "logo": `${protocol}://${host}/images/logo/ganeshmandal_logo.svg`
        },
        "isAccessibleForFree": true
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `What is the current wait time at ${mandal.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `As of right now, the estimated darshan queue wait time at ${mandal.name} is ~${waitMins} minutes with crowd density at ${density}%.`
            }
          },
          {
            "@type": "Question",
            "name": `Which is the best approach road to reach ${mandal.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `The fastest recommended approach corridor is ${fastestRoad}. Devotees can check live approach road traffic speeds and barricade updates on GaneshMandal.in.`
            }
          }
        ]
      }
    ]
  };

  const headInjections = `
  <!-- Programmatic SEO & OpenGraph Dynamic Tags -->
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- OpenGraph / Facebook / WhatsApp (Sacred Bappa Murti Preview) -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${murtiUrl}">
  <meta property="og:image:secure_url" content="${murtiUrl}">
  <meta property="og:image:type" content="${imageType}">
  <meta property="og:image:width" content="1000">
  <meta property="og:image:height" content="1000">
  <meta property="og:image:alt" content="${escapeHtml(mandal.name)} Bappa Murti Darshan">
  <meta property="og:site_name" content="GaneshMandal.in">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${murtiUrl}">

  <!-- JSON-LD Structured Data Schema -->
  <script type="application/ld+json">
${JSON.stringify(schemaJsonLd, null, 2)}
  </script>

  <!-- Client-side auto-hydration trigger -->
  <script>
    window._INITIAL_MANDAL_ID = "${escapeHtml(mandal.id)}";
  </script>
  `;

  // Cleanly replace default title, OpenGraph & Twitter tags to prevent duplicate meta tag conflicts
  let modifiedHtml = template
    .replace(/<title>.*?<\/title>/i, '')
    .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '');
  modifiedHtml = modifiedHtml.replace('</head>', `${headInjections}\n</head>`);

  return modifiedHtml;
}

function escapeHtml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&#39;';
      case '"': return '&quot;';
    }
  });
}
