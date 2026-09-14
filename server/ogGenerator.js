/**
 * Dynamic Open Graph (OG) Image Generator
 * 
 * Generates lightweight, high-contrast SVG banners (1200x630) for WhatsApp,
 * Telegram, Twitter/X, and Facebook link previews.
 */

import { db } from './db.js';
import { calculateDynamicCrowd } from './crowdModel.js';

export function generateMandalOgSvg(mandalId) {
  let mandal = db.getMandal(mandalId);
  if (!mandal) {
    const all = db.getAllMandals();
    mandal = all.find(m => m.id.includes(mandalId) || mandalId.includes(m.id)) || all[0];
  }
  if (!mandal) return null;

  const dynamic = calculateDynamicCrowd(mandal);
  const density = dynamic.crowd_density ?? mandal.crowd_density ?? 35;
  const waitMins = dynamic.estimated_wait_minutes ?? mandal.estimated_wait_minutes ?? 20;

  // Status styling
  let statusColor = '#10b981';
  let statusLabel = '🟢 KHALI • SMOOTH DARSHAN FLOW';
  let statusBg = 'rgba(16, 185, 129, 0.2)';
  if (density > 85) {
    statusColor = '#a855f7';
    statusLabel = '🟣 JAM-PACKED • HEAVY QUEUE';
    statusBg = 'rgba(168, 85, 247, 0.2)';
  } else if (density > 65) {
    statusColor = '#ef4444';
    statusLabel = '🔴 FULL RUSH • BARRICADED QUEUE';
    statusBg = 'rgba(239, 68, 68, 0.2)';
  } else if (density > 45) {
    statusColor = '#f59e0b';
    statusLabel = '🟠 THODA RUSH • MODERATE QUEUE';
    statusBg = 'rgba(245, 158, 11, 0.2)';
  }

  const mandalName = escapeXml(mandal.name || 'Ganesh Mandal');
  const city = escapeXml((mandal.city || 'pune').toUpperCase());
  const address = escapeXml(mandal.address || 'Maharashtra');
  const fastestRoad = mandal.top_roads?.[0]?.name ? escapeXml(mandal.top_roads[0].name) : 'Main Approach Road';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c0a09" />
      <stop offset="40%" stop-color="#18120c" />
      <stop offset="100%" stop-color="#241408" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect x="20" y="20" width="1160" height="590" rx="24" fill="none" stroke="#f59e0b" stroke-opacity="0.35" stroke-width="2" />

  <!-- Top Decorative Header Strip -->
  <g transform="translate(60, 65)">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#f59e0b" letter-spacing="3">
      🚩 GANESHMANDAL.IN • LIVE FESTIVAL TELEMETRY
    </text>
    <rect x="740" y="-18" width="340" height="32" rx="16" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" stroke-opacity="0.4" stroke-width="1" />
    <text x="910" y="4" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#fef3c7" text-anchor="middle">
      📍 ${city} GANESHOTSAV 2026
    </text>
  </g>

  <!-- Mandal Name & Address -->
  <g transform="translate(60, 160)">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900" fill="#fffbeb">
      ${mandalName}
    </text>
    <text x="0" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="500" fill="#d6d3d1">
      📍 ${address}
    </text>
  </g>

  <!-- Real-Time Metrics Badges -->
  <g transform="translate(60, 260)">
    <!-- Rush Status Pill -->
    <rect x="0" y="0" width="460" height="70" rx="16" fill="${statusBg}" stroke="${statusColor}" stroke-opacity="0.6" stroke-width="2" />
    <circle cx="35" cy="35" r="10" fill="${statusColor}" filter="url(#glow)" />
    <text x="65" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="${statusColor}">
      ${density}% RUSH • ${statusLabel}
    </text>

    <!-- Wait Time Card -->
    <rect x="490" y="0" width="280" height="70" rx="16" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.5" />
    <text x="520" y="43" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#fffbeb">
      ⏱️ ~${waitMins} min wait
    </text>

    <!-- Approach Road Card -->
    <rect x="790" y="0" width="290" height="70" rx="16" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.5" />
    <text x="815" y="43" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600" fill="#93c5fd">
      🚗 ${fastestRoad}
    </text>
  </g>

  <!-- Marathi Callout Box (Society & WhatsApp Viral Trigger) -->
  <g transform="translate(60, 380)">
    <rect x="0" y="0" width="1080" height="120" rx="18" fill="rgba(234, 88, 12, 0.12)" stroke="rgba(234, 88, 12, 0.4)" stroke-width="1.5" />
    <text x="40" y="48" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#fed7aa">
      📢 दर्शन रांगेत जाण्यापूर्वी लाईव्ह गर्दी आणि रस्ते तपासा!
    </text>
    <text x="40" y="88" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="#fbd5a5">
      Check verified live darshan queue times, CCTV telemetry &amp; fastest approach corridors before leaving home.
    </text>
  </g>

  <!-- Footer Branding & Watermark -->
  <g transform="translate(60, 565)">
    <rect x="0" y="0" width="400" height="42" rx="10" fill="url(#gold)" />
    <text x="200" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">
      👉 https://ganeshmandal.in
    </text>

    <text x="1080" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#8b8580" text-anchor="end">
      Maharashtra's Premier Real-Time Festival Intelligence • Free Devotee Service
    </text>
  </g>
</svg>`;
}

function escapeXml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}
