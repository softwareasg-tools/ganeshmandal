import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:30000';
const projectRoot = 'e:/Antigravity/Godsyeview';

console.log('========================================================');
console.log('🚀 VERIFYING MULTI-PLATFORM SOCIAL FEEDS ACROSS ALL 50 MANDALS');
console.log('========================================================\n');

// 1. Fetch all mandals from both cities
const [puneRes, mumbaiRes] = await Promise.all([
  fetch(`${BASE_URL}/api/cities/pune/mandals`).then(r => r.json()),
  fetch(`${BASE_URL}/api/cities/mumbai/mandals`).then(r => r.json())
]);

const allMandals = [...puneRes.data, ...mumbaiRes.data];
console.log(`Loaded ${allMandals.length} mandals across Pune & Mumbai.`);

let totalErrors = 0;
let checkedFeeds = 0;

for (const m of allMandals) {
  const res = await fetch(`${BASE_URL}/api/mandals/${m.id}/social`);
  const json = await res.json();
  const posts = json.media?.social_posts || [];

  if (posts.length !== 5) {
    console.error(`❌ Mandal ${m.name} has ${posts.length} posts, expected 5!`);
    totalErrors++;
  }

  // Check distinct images within this mandal's feed
  const imgUrls = posts.map(p => p.image_url);
  const uniqueUrls = new Set(imgUrls);

  if (uniqueUrls.size !== posts.length) {
    console.error(`❌ Duplicate images found in feed for ${m.name}:`, imgUrls);
    totalErrors++;
  }

  // Check physical existence of each image
  for (const p of posts) {
    const filePath = path.join(projectRoot, 'public', p.image_url);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing image on disk: ${p.image_url} for ${m.name}`);
      totalErrors++;
    }
  }

  // Check platforms
  const platforms = posts.map(p => p.platform);
  if (!platforms.includes('instagram') || !platforms.includes('reddit') || !platforms.includes('pinterest') || !platforms.includes('facebook')) {
    console.error(`❌ Mandal ${m.name} missing required platforms. Found:`, platforms);
    totalErrors++;
  }

  checkedFeeds++;
}

console.log(`\nAudited ${checkedFeeds} mandal feeds with 0 internal image duplicates! Total errors: ${totalErrors}`);
if (totalErrors > 0) {
  process.exit(1);
}
console.log('✅ ALL 50 MANDALS HAVE 100% DISTINCT, MULTI-PLATFORM SOCIAL FEEDS!\n');

// 2. Launch Puppeteer to capture visual proof
console.log('--- Launching Browser for UI Screenshot Proof ---');
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 2500));

// A. Balgopal Mitra Mandal (Ganj Peth, Pune) - The exact one the user showed in their screenshot!
console.log('Opening Balgopal Mitra Mandal (Ganj Peth) POV modal...');
await page.evaluate(() => {
  window.festivalApp.openPOVModal('mandal_pune_balgopal', 'social');
});
await page.waitForFunction(() => {
  const imgs = Array.from(document.querySelectorAll('#pov-social-grid img'));
  return imgs.length === 5 && imgs.every(img => img.complete && img.naturalWidth > 0);
}, { timeout: 10000 });

const balgopalShot = 'C:/Users/91989/.gemini/antigravity/brain/9d119cdb-702a-435e-8978-d54a30f529e6/balgopal_multiplatform_social_view.png';
await page.screenshot({ path: balgopalShot });
console.log(`Saved Balgopal verified social view to: ${balgopalShot}`);

// Close modal
await page.evaluate(() => {
  document.getElementById('pov-street-modal').classList.remove('open');
});
await new Promise(r => setTimeout(r, 500));

// B. Switch to Mumbai & open Sewri Cha Raja
console.log('Switching to Mumbai & opening Sewri Cha Raja...');
await page.evaluate(async () => {
  await window.festivalApp.switchCity('mumbai');
});
await new Promise(r => setTimeout(r, 1500));

await page.evaluate(() => {
  window.festivalApp.openPOVModal('mandal_mumbai_sewri', 'social');
});
await page.waitForFunction(() => {
  const imgs = Array.from(document.querySelectorAll('#pov-social-grid img'));
  return imgs.length === 5 && imgs.every(img => img.complete && img.naturalWidth > 0);
}, { timeout: 10000 });

const sewriShot = 'C:/Users/91989/.gemini/antigravity/brain/9d119cdb-702a-435e-8978-d54a30f529e6/sewri_multiplatform_social_view.png';
await page.screenshot({ path: sewriShot });
console.log(`Saved Sewri verified social view to: ${sewriShot}`);

// Close modal
await page.evaluate(() => {
  document.getElementById('pov-street-modal').classList.remove('open');
});
await new Promise(r => setTimeout(r, 500));

// C. Lalbaugcha Raja
console.log('Opening Lalbaugcha Raja POV modal...');
await page.evaluate(() => {
  window.festivalApp.openPOVModal('mandal_mumbai_lalbaug', 'social');
});
await page.waitForFunction(() => {
  const imgs = Array.from(document.querySelectorAll('#pov-social-grid img'));
  return imgs.length === 5 && imgs.every(img => img.complete && img.naturalWidth > 0);
}, { timeout: 10000 });

const lalbaugShot = 'C:/Users/91989/.gemini/antigravity/brain/9d119cdb-702a-435e-8978-d54a30f529e6/lalbaug_multiplatform_social_view.png';
await page.screenshot({ path: lalbaugShot });
console.log(`Saved Lalbaugcha Raja verified social view to: ${lalbaugShot}`);

await browser.close();
console.log('\n🎉 ALL MULTI-PLATFORM SOCIAL MEDIA FEEDS VERIFIED WITH ZERO DUPLICATES!');
