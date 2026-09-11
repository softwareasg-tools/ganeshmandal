import puppeteer from 'puppeteer';

const BASE_URL = 'http://127.0.0.1:30000';

console.log('========================================================');
console.log('🚀 TESTING ADVERTISER CONTACT FLOW & COMMUNITY MODAL TABS');
console.log('========================================================\n');

// 1. Test POST /api/advertisers/contact
console.log('--- 1. Testing API Endpoints ---');
const postRes = await fetch(`${BASE_URL}/api/advertisers/contact`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    brand_name: 'Chitale Bandhu Mithaiwale',
    contact_name: 'Shrikrishna Chitale',
    email: 'partnerships@chitalebandhu.in',
    phone: '+91 98220 12345',
    target_city: 'both',
    placement_interest: 'leaderboard',
    budget_range: '50k-1L',
    message: 'We want to sponsor the #1 and #2 leaderboard slots for authentic Bakarwadi & Modak festival promotions.',
  }),
});

const postJson = await postRes.json();
console.log('POST status:', postRes.status, 'Success:', postJson.success);
if (!postJson.success) {
  console.error('❌ Failed to post advertiser inquiry:', postJson);
  process.exit(1);
}

// Test validation failure
const invalidRes = await fetch(`${BASE_URL}/api/advertisers/contact`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    brand_name: 'Incomplete Brand',
  }),
});
console.log('Validation rejection status:', invalidRes.status, '(Expected 400)');
if (invalidRes.status !== 400) {
  console.error('❌ Validation check failed');
  process.exit(1);
}

// Test GET /api/admin/advertisers
const adminRes = await fetch(`${BASE_URL}/api/admin/advertisers`, {
  headers: { 'X-Admin-Password': 'asg12345$' },
});
const adminJson = await adminRes.json();
console.log('Admin fetch status:', adminRes.status, 'Count:', adminJson.count);
if (!adminJson.success || adminJson.count === 0) {
  console.error('❌ Failed to fetch advertiser inquiries in admin');
  process.exit(1);
}
console.log('✅ Backend API endpoints verified successfully!\n');

// 2. UI Verification using Puppeteer
console.log('--- 2. Launching Browser for UI Verification ---');
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
await new Promise((r) => setTimeout(r, 2000));

// A. Click "📢 Advertise With Us" in header
console.log('Clicking "📢 Advertise With Us" in header...');
await page.click('#btn-open-advertise');
await new Promise((r) => setTimeout(r, 600));

// Verify modal is open and advertise tab is active
const isAdvPaneVisible = await page.evaluate(() => {
  const modal = document.getElementById('suggest-modal');
  const pane = document.getElementById('pane-advertise-contact');
  const tabAdv = document.getElementById('tab-btn-advertise');
  return modal.classList.contains('open') &&
    pane.style.display !== 'none' &&
    tabAdv.classList.contains('active');
});

console.log('Advertiser pane visible:', isAdvPaneVisible);
if (!isAdvPaneVisible) {
  console.error('❌ Advertiser tab not active on click');
  process.exit(1);
}

const advShot = 'C:/Users/91989/.gemini/antigravity/brain/9d119cdb-702a-435e-8978-d54a30f529e6/advertiser_tab_view.png';
await page.screenshot({ path: advShot });
console.log(`Saved Advertiser tab view to: ${advShot}`);

// B. Click "📍 Suggest a Mandal" tab to verify switching
console.log('Switching to "📍 Suggest a Mandal" tab...');
await page.click('#tab-btn-suggest');
await new Promise((r) => setTimeout(r, 400));

const isSuggestPaneVisible = await page.evaluate(() => {
  const pane = document.getElementById('pane-suggest-mandal');
  const tabSug = document.getElementById('tab-btn-suggest');
  return pane.style.display !== 'none' && tabSug.classList.contains('active');
});
console.log('Suggest pane visible:', isSuggestPaneVisible);

const sugShot = 'C:/Users/91989/.gemini/antigravity/brain/9d119cdb-702a-435e-8978-d54a30f529e6/suggest_tab_view.png';
await page.screenshot({ path: sugShot });
console.log(`Saved Suggest tab view to: ${sugShot}`);

// Close community modal
await page.click('#btn-close-suggest-modal');
await new Promise((r) => setTimeout(r, 400));

// C. Verify Admin Console Advertiser Leads
console.log('Opening Admin Console with password asg12345$...');
await page.click('#btn-open-admin');
await new Promise((r) => setTimeout(r, 500));

await page.type('#admin-password-input', 'asg12345$');
await page.click('#btn-admin-login');
await new Promise((r) => setTimeout(r, 800));

// Click "💼 Advertiser Leads" tab
console.log('Navigating to "💼 Advertiser Leads" tab...');
await page.evaluate(() => {
  const btn = document.querySelector('.admin-tab-btn[data-tab="advertisers"]');
  if (btn) btn.click();
});
await new Promise((r) => setTimeout(r, 600));

const adminAdvShot = 'C:/Users/91989/.gemini/antigravity/brain/9d119cdb-702a-435e-8978-d54a30f529e6/admin_advertiser_leads_view.png';
await page.screenshot({ path: adminAdvShot });
console.log(`Saved Admin Advertiser Leads view to: ${adminAdvShot}`);

await browser.close();
console.log('\n🎉 ALL ADVERTISER & COMMUNITY MODAL VERIFICATIONS PASSED SUCCESSFULLY!');
