import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../server/index.js';
import { db } from '../server/db.js';
import { initializeSeedData } from '../server/seedData.js';

let server;
let baseUrl;

test.before(async () => {
  initializeSeedData(db);
  const app = createApp();
  server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /api/cities returns Pune and Mumbai', async () => {
  const res = await fetch(`${baseUrl}/api/cities`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.count >= 2);
  const slugs = json.data.map((c) => c.slug);
  assert.ok(slugs.includes('pune'));
  assert.ok(slugs.includes('mumbai'));
});

test('GET /api/cities/pune/mandals returns enriched mandals', async () => {
  const res = await fetch(`${baseUrl}/api/cities/pune/mandals`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.data.length > 0);
  const m1 = json.data[0];
  assert.ok(m1.current_rank >= 1);
  assert.ok(m1.popularity_score >= 0);
  assert.ok(m1.crowd_density >= 0);
});

test('GET /api/mandals/:id/live returns visual analysis', async () => {
  const res = await fetch(`${baseUrl}/api/mandals/mandal_pune_dagdusheth/live`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.visual_analysis);
  assert.ok(json.visual_analysis.available);
  assert.ok(json.visual_analysis.stage.idol_detected);
});

test('GET /api/rankings/pune returns sorted leaderboard', async () => {
  const res = await fetch(`${baseUrl}/api/rankings/pune`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.leaderboard));
  assert.ok(json.leaderboard.length > 0);
  assert.equal(json.leaderboard[0].rank, 1);
});

test('GET /api/heatmap/pune returns intensity points', async () => {
  const res = await fetch(`${baseUrl}/api/heatmap/pune`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.points.length > 0);
  assert.ok(json.points[0].lat && json.points[0].lng);
  assert.ok(json.points[0].intensity >= 0 && json.points[0].intensity <= 1.0);
});

test('GET /api/recommendations filters correctly', async () => {
  const res = await fetch(`${baseUrl}/api/recommendations?city=pune&criterion=least_crowded`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.recommendations.length > 0);
  assert.ok(json.recommendations[0].recommendation_badge.includes('Crowd'));
});

test('Admin authentication - rejects unauthorized requests', async () => {
  const res = await fetch(`${baseUrl}/api/admin/mandals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Hacker Mandal', city_id: 'city_pune', latitude: 18.5, longitude: 73.8 }),
  });
  assert.equal(res.status, 401);
});

test('Admin operations - creates mandal with valid header key', async () => {
  const res = await fetch(`${baseUrl}/api/admin/mandals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': 'ganpati-admin-secret-2026',
    },
    body: JSON.stringify({
      name: 'Someshwar Ganpati Test',
      city_id: 'city_pune',
      latitude: 18.5300,
      longitude: 73.8300,
      address: 'Aundh, Pune',
    }),
  });
  assert.equal(res.status, 201);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.name, 'Someshwar Ganpati Test');
});
