import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const outDir = path.resolve('public/screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // 1. Desktop Dashboard
  const pageDesktop = await browser.newPage();
  await pageDesktop.setViewport({ width: 1366, height: 860 });
  await pageDesktop.goto('http://localhost:30000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await pageDesktop.screenshot({ path: path.join(outDir, '01_desktop_dashboard.png') });
  console.log('Saved 01_desktop_dashboard.png');

  // Test Sync Button
  await pageDesktop.click('#btn-sync-feeds');
  await new Promise(r => setTimeout(r, 800));
  await pageDesktop.screenshot({ path: path.join(outDir, '02_sync_feeedback.png') });
  console.log('Saved 02_sync_feeedback.png');

  // 2. Mobile Dashboard (iPhone 14 / modern mobile viewport)
  const pageMobile = await browser.newPage();
  await pageMobile.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await pageMobile.goto('http://localhost:30000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await pageMobile.screenshot({ path: path.join(outDir, '03_mobile_dashboard.png') });
  console.log('Saved 03_mobile_dashboard.png');

  // Switch to Rankings Tab on Mobile
  await pageMobile.click('.mobile-nav-btn[data-tab="rankings"]');
  await new Promise(r => setTimeout(r, 500));
  await pageMobile.screenshot({ path: path.join(outDir, '04_mobile_rankings_with_sponsor.png') });
  console.log('Saved 04_mobile_rankings_with_sponsor.png');

  // Open "Stand in Front" (Devotee POV Modal)
  await pageMobile.click('.mobile-nav-btn[data-tab="darshan"]');
  await new Promise(r => setTimeout(r, 1500));
  await pageMobile.screenshot({ path: path.join(outDir, '05_mobile_darshan_idol.png') });
  console.log('Saved 05_mobile_darshan_idol.png');

  // Switch to Live Road Traffic Tab
  await pageMobile.click('.pov-tab-btn[data-pane="traffic"]');
  await new Promise(r => setTimeout(r, 1500));
  await pageMobile.screenshot({ path: path.join(outDir, '06_mobile_road_traffic.png') });
  console.log('Saved 06_mobile_road_traffic.png');

  // Switch to Devotee Social Media Snaps Tab
  await pageMobile.click('.pov-tab-btn[data-pane="social"]');
  await new Promise(r => setTimeout(r, 1000));
  await pageMobile.screenshot({ path: path.join(outDir, '07_mobile_social_snaps.png') });
  console.log('Saved 07_mobile_social_snaps.png');

  await browser.close();
  console.log('Verification completed successfully!');
}

run().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
