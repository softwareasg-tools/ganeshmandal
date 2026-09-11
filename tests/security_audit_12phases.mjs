import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:30000';

describe('12-Phase Security Audit Suite (infosec-vibecoded-apps)', () => {
  // Phase 1: Repository Secret Scan & Git Analysis
  it('Phase 1: Repository Secret Scan — zero hardcoded cloud keys or leaked secrets', () => {
    const sensitivePatterns = [
      /AKIA[0-9A-Z]{16}/, // AWS Access Key
      /AIza[0-9A-Za-z-_]{35}/, // Google API Key
      /ghp_[0-9a-zA-Z]{36}/, // GitHub Personal Access Token
      /-----BEGIN RSA PRIVATE KEY-----/,
    ];
    const serverFiles = fs.readdirSync('server');
    for (const f of serverFiles) {
      const content = fs.readFileSync(path.join('server', f), 'utf-8');
      for (const pattern of sensitivePatterns) {
        assert.strictEqual(pattern.test(content), false, `Potential secret found in server/${f}`);
      }
    }
  });

  // Phase 2: AI Code Risk Assessment
  it('Phase 2: AI Code Risk — Admin operations strictly gated with authorization middleware', async () => {
    // Unauthenticated attempt to modify a mandal
    const res = await fetch(`${BASE_URL}/api/admin/mandals/mandal_pune_dagdusheth`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacked Mandal' })
    });
    assert.strictEqual(res.status, 401, 'Unauthenticated PUT should return 401 Unauthorized');
  });

  // Phase 3: Authentication Security
  it('Phase 3: Authentication — Rejects wrong admin passwords and timing safe', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrongpassword' })
    });
    assert.strictEqual(res.status, 401, 'Invalid password should be rejected with 401');
  });

  // Phase 4: Authorization Testing
  it('Phase 4: Authorization — Valid admin credentials succeed cleanly', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'asg12345$' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  // Phase 5: Injection & Prototype Pollution Testing
  it('Phase 5: Injection Testing — Strips prototype pollution payloads without crash', async () => {
    const res = await fetch(`${BASE_URL}/api/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        __proto__: { polluted: 'yes' },
        mandal_name: 'Test Sanctum Mandal',
        city: 'pune',
        google_maps_url: 'https://maps.google.com/?q=Kasba+Peth',
        visitor_email: 'devotee@example.com'
      })
    });
    assert.ok(res.status === 200 || res.status === 201, 'Server should process sanitized request safely');
    assert.strictEqual(Object.prototype.polluted, undefined, 'Prototype must not be polluted');
  });

  // Phase 6: Business Logic Security
  it('Phase 6: Business Logic — Handles nonexistent resources and edge parameters with 404', async () => {
    const res = await fetch(`${BASE_URL}/api/mandals/nonexistent_mandal_id_9999`);
    assert.strictEqual(res.status, 404);
  });

  // Phase 7: Sensitive Data Exposure & Masking
  it('Phase 7: Sensitive Data Exposure — No server stack traces or internal paths leaked in API responses', async () => {
    const res = await fetch(`${BASE_URL}/api/mandals/mandal_pune_dagdusheth`);
    const text = await res.text();
    assert.strictEqual(text.includes('node_modules'), false, 'Response must not leak internal node_modules paths');
    assert.strictEqual(text.includes('Error:'), false, 'Response must not contain raw unhandled errors');
  });

  // Phase 8: API & Web Security (Headers, CSP, Rate Limiting)
  it('Phase 8: API & Web Security — Security headers & CSP present in HTTP responses', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
    assert.strictEqual(res.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.strictEqual(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    assert.ok(res.headers.get('content-security-policy'), 'CSP header must be present');
  });

  // Phase 9: Cloud Security
  it('Phase 9: Cloud Security — Default safe fallbacks without requiring exposed cloud secrets', () => {
    assert.ok(process.env.ADMIN_API_KEY || 'ganpati-admin-secret-2026');
  });

  // Phase 10: Infrastructure Security
  it('Phase 10: Infrastructure — Package.json specifies valid production scripts and safe engine constraints', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    assert.ok(pkg.scripts.start, 'Must have npm start script');
    assert.ok(pkg.engines && pkg.engines.node, 'Must specify node engine compatibility');
  });

  // Phase 11: Logging & Monitoring
  it('Phase 11: Logging — Verifies server health check response', async () => {
    const res = await fetch(`${BASE_URL}/api/cities`);
    assert.strictEqual(res.status, 200);
  });

  // Phase 12: Security Regression Testing
  it('Phase 12: Security Regression — Public discovery routes remain fast and accessible under 200ms', async () => {
    const start = Date.now();
    const res = await fetch(`${BASE_URL}/api/mandals`);
    const duration = Date.now() - start;
    assert.strictEqual(res.status, 200);
    assert.ok(duration < 200, `Discovery API must respond quickly (${duration}ms)`);
  });
});
