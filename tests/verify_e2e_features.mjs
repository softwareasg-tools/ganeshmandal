import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:30000';
const ARTIFACT_DIR = 'C:/Users/91989/.gemini/antigravity/brain/9d119cdb-702a-435e-8978-d54a30f529e6';

async function runVerification() {
  console.log('========================================================');
  console.log('🚀 RUNNING END-TO-END VERIFICATION');
  console.log('========================================================');

  // --- 1. API VERIFICATIONS ---
  console.log('\n--- 1. Testing Visitor Suggestion API ---');
  const badSugRes = await fetch(`${BASE_URL}/api/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mandal_name: 'Incomplete Mandal' }),
  });
  console.log(`Bad suggestion status (expect 400): ${badSugRes.status}`);

  const goodSugRes = await fetch(`${BASE_URL}/api/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mandal_name: 'Shree Sai Ganesh Mandal',
      city: 'pune',
      google_maps_url: 'https://maps.app.goo.gl/sample12345',
      visitor_email: 'devotee_tester@gmail.com',
      notes: 'Famous for eco-friendly clay idol and 100-year traditional dhol tasha.',
    }),
  });
  const goodSugData = await goodSugRes.json();
  console.log(`Good suggestion status: ${goodSugRes.status}, success: ${goodSugData.success}`);
  console.log(`Message: ${goodSugData.message}`);

  // --- 2. Admin Authentication ---
  console.log('\n--- 2. Testing Admin Password Authentication (asg12345$) ---');
  const wrongLogin = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'wrongpassword' }),
  });
  console.log(`Wrong password status (expect 401): ${wrongLogin.status}`);

  const correctLogin = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'asg12345$' }),
  });
  const loginData = await correctLogin.json();
  console.log(`Correct password status (expect 200): ${correctLogin.status}, token: ${loginData.token}`);

  // --- 3. Admin Mandal Management (Add & Delete) ---
  console.log('\n--- 3. Testing Admin Add & Delete Mandal ---');
  const addMandalRes = await fetch(`${BASE_URL}/api/admin/mandals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Password': 'asg12345$',
    },
    body: JSON.stringify({
      name: 'Verif Mandal Pune Test',
      city_id: 'pune',
      latitude: 18.5204,
      longitude: 73.8567,
      address: 'Test Street, Camp, Pune',
      image_url: '/images/mandals/dagdusheth_idol.jpg',
      description: 'E2E Test Created Mandal',
    }),
  });
  const addMandalData = await addMandalRes.json();
  console.log(`Add mandal status: ${addMandalRes.status}, created ID: ${addMandalData.data?.id}`);
  const createdMandalId = addMandalData.data?.id;

  // Delete mandal
  const delMandalRes = await fetch(`${BASE_URL}/api/admin/mandals/${createdMandalId}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Password': 'asg12345$' },
  });
  console.log(`Delete mandal status (expect 200): ${delMandalRes.status}`);

  // --- 4. Admin Sponsor Ads (Add & Delete) ---
  console.log('\n--- 4. Testing Admin Add & Delete Sponsor Ad ---');
  const addAdRes = await fetch(`${BASE_URL}/api/admin/ads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Password': 'asg12345$',
    },
    body: JSON.stringify({
      sponsor_name: 'Kalyan Jewellers Festival Seva',
      placement: 'leaderboard',
      badge_text: 'FESTIVAL SPONSOR',
      cta_text: 'Gold Coin Offers 🪔',
      cta_url: 'https://kalyanjewellers.net',
      description: 'Exclusive Shubh Deepavali & Ganeshotsav blessing tokens and devotee savings scheme.',
    }),
  });
  const addAdData = await addAdRes.json();
  console.log(`Add ad status: ${addAdRes.status}, created ID: ${addAdData.ad?.id}`);
  const createdAdId = addAdData.ad?.id;

  const adsRes = await fetch(`${BASE_URL}/api/ads`);
  const adsData = await adsRes.json();
  console.log(`Current active ads count: ${adsData.count}`);

  const delAdRes = await fetch(`${BASE_URL}/api/admin/ads/${createdAdId}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Password': 'asg12345$' },
  });
  console.log(`Delete ad status (expect 200): ${delAdRes.status}`);

  // --- 5. Zero Cross-City Photo Overlap Audit ---
  console.log('\n--- 5. Checking Cross-City Image Audit ---');
  const [puneR, mumbaiR] = await Promise.all([
    fetch(`${BASE_URL}/api/cities/pune/mandals`).then(r => r.json()),
    fetch(`${BASE_URL}/api/cities/mumbai/mandals`).then(r => r.json()),
  ]);
  const puneMandals = puneR.data || [];
  const mumbaiMandals = mumbaiR.data || [];
  console.log(`Pune mandals count: ${puneMandals.length}, Mumbai mandals count: ${mumbaiMandals.length}`);

  const puneImages = new Set();
  puneMandals.forEach(m => {
    if (m.image_url) puneImages.add(m.image_url);
    if (m.temple_image_url) puneImages.add(m.temple_image_url);
  });

  const overlaps = [];
  mumbaiMandals.forEach(m => {
    if (m.image_url && puneImages.has(m.image_url)) overlaps.push({ mandal: m.name, image: m.image_url, type: 'idol' });
    if (m.temple_image_url && puneImages.has(m.temple_image_url)) overlaps.push({ mandal: m.name, image: m.temple_image_url, type: 'temple' });
  });

  console.log(`Total cross-city overlaps found: ${overlaps.length}`);
  if (overlaps.length > 0) {
    console.error('❌ OVERLAPS FOUND:', overlaps);
  } else {
    console.log('✅ ZERO cross-city photo overlap verified!');
  }

  // --- 6. Puppeteer Browser Testing & Visual Screenshots ---
  console.log('\n--- 6. Launching Puppeteer Browser for UI Verification ---');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Desktop View
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const desktopSS = path.join(ARTIFACT_DIR, 'desktop_overview_view.png');
    await page.screenshot({ path: desktopSS, fullPage: false });
    console.log(`Saved desktop view to: ${desktopSS}`);

    // Open Suggest Modal
    await page.click('#btn-open-suggest');
    await new Promise(r => setTimeout(r, 600));
    const suggestSS = path.join(ARTIFACT_DIR, 'suggest_modal_view.png');
    await page.screenshot({ path: suggestSS, fullPage: false });
    console.log(`Saved suggest modal view to: ${suggestSS}`);
    await page.click('#btn-close-suggest-modal');
    await new Promise(r => setTimeout(r, 400));

    // Open Admin Modal (Login View)
    await page.click('#btn-open-admin');
    await new Promise(r => setTimeout(r, 600));
    const adminLoginSS = path.join(ARTIFACT_DIR, 'admin_login_view.png');
    await page.screenshot({ path: adminLoginSS, fullPage: false });
    console.log(`Saved admin login view to: ${adminLoginSS}`);

    // Enter Password and Unlock
    await page.type('#admin-password-input', 'asg12345$');
    await page.click('#btn-admin-login');
    await new Promise(r => setTimeout(r, 1200));

    const adminDashSS = path.join(ARTIFACT_DIR, 'admin_dashboard_view.png');
    await page.screenshot({ path: adminDashSS, fullPage: false });
    console.log(`Saved authenticated admin dashboard view to: ${adminDashSS}`);

    // Switch to Sponsor Ads Tab
    await page.click('.admin-tab-btn[data-tab="ads"]');
    await new Promise(r => setTimeout(r, 600));
    const adminAdsSS = path.join(ARTIFACT_DIR, 'admin_ads_tab_view.png');
    await page.screenshot({ path: adminAdsSS, fullPage: false });
    console.log(`Saved admin ads tab view to: ${adminAdsSS}`);

    // Switch to Suggestions Tab
    await page.click('.admin-tab-btn[data-tab="suggestions"]');
    await new Promise(r => setTimeout(r, 600));
    const adminSugSS = path.join(ARTIFACT_DIR, 'admin_suggestions_tab_view.png');
    await page.screenshot({ path: adminSugSS, fullPage: false });
    console.log(`Saved admin suggestions tab view to: ${adminSugSS}`);

    await page.click('#btn-close-admin-modal');
    await new Promise(r => setTimeout(r, 400));

    // Mobile Viewport (iPhone 14 / modern Android 390x844)
    console.log('\n--- 7. Testing Mobile Viewport (390x844) ---');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    const mobileHomeSS = path.join(ARTIFACT_DIR, 'mobile_home_view.png');
    await page.screenshot({ path: mobileHomeSS, fullPage: false });
    console.log(`Saved mobile home view to: ${mobileHomeSS}`);

    // Switch to Rankings Tab on Mobile
    await page.click('.mobile-nav-btn[data-tab="rankings"]');
    await new Promise(r => setTimeout(r, 800));
    const mobileRankSS = path.join(ARTIFACT_DIR, 'mobile_rankings_view.png');
    await page.screenshot({ path: mobileRankSS, fullPage: false });
    console.log(`Saved mobile rankings view to: ${mobileRankSS}`);

    // Tap First Mandal "Stand in Front" to verify mobile POV modal
    const firstStandBtn = await page.$('.btn-stand-front');
    if (firstStandBtn) {
      await firstStandBtn.click();
      await new Promise(r => setTimeout(r, 1200));
      const mobilePOVSS = path.join(ARTIFACT_DIR, 'mobile_pov_view.png');
      await page.screenshot({ path: mobilePOVSS, fullPage: false });
      console.log(`Saved mobile POV view to: ${mobilePOVSS}`);
    }

  } catch (err) {
    console.error('Puppeteer verification failed:', err);
  } finally {
    await browser.close();
    console.log('\n✅ All automated verification runs completed.');
  }
}

runVerification();
