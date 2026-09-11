import test from 'node:test';
import assert from 'node:assert/strict';
import { ScoringEngine } from '../server/scoringEngine.js';
import { FestivalDatabase } from '../server/db.js';

test('ScoringEngine - weight normalization', () => {
  const engine = new ScoringEngine({
    crowdActivity: 35,
    visitorInterest: 20,
    socialMedia: 15,
    searchViews: 10,
    historicalPopularity: 10,
    liveVisualActivity: 10,
  });

  const weights = engine.normalizedWeights;
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1.0) < 0.0001, 'Normalized weights must sum to 1.0');
});

test('ScoringEngine - exponential time decay', () => {
  const engine = new ScoringEngine({ decayHalfLifeHours: 4.0 });
  const now = Date.now();

  // Fresh observation has 0 elapsed time -> no decay
  const fresh = engine.applyTimeDecay(100, new Date(now).toISOString());
  assert.equal(Math.round(fresh), 100);

  // 4 hours elapsed -> exactly 50% decay (1 half-life)
  const fourHoursAgo = new Date(now - 4 * 3600 * 1000).toISOString();
  const decayed = engine.applyTimeDecay(100, fourHoursAgo);
  assert.equal(Math.round(decayed), 50);

  // 8 hours elapsed -> 25% remaining (2 half-lives)
  const eightHoursAgo = new Date(now - 8 * 3600 * 1000).toISOString();
  const decayed8 = engine.applyTimeDecay(100, eightHoursAgo);
  assert.equal(Math.round(decayed8), 25);
});

test('ScoringEngine - calculateCrowdScore preserves range 0-100', () => {
  const engine = new ScoringEngine();

  const lowCrowd = engine.calculateCrowdScore({
    density_score: 20,
    queue_score: 10,
    activity_score: 30,
  });
  assert.ok(lowCrowd >= 0 && lowCrowd <= 40, `Expected low crowd score, got ${lowCrowd}`);

  const extremeCrowd = engine.calculateCrowdScore({
    density_score: 95,
    queue_score: 90,
    activity_score: 85,
  });
  assert.ok(extremeCrowd >= 80 && extremeCrowd <= 100, `Expected extreme crowd score, got ${extremeCrowd}`);
});

test('ScoringEngine - calculateExperienceScore sweet spot', () => {
  const engine = new ScoringEngine();

  // Mandal with good popularity, reasonable crowd, and stage activity should have high experience score
  const highExp = engine.calculateExperienceScore(85, 45, { mechanical_prop_detected: true }, 15);
  // Mandal with overwhelming crowd bottleneck (>95%) and 3-hour wait should have lower experience score
  const chokedExp = engine.calculateExperienceScore(85, 98, null, 180);

  assert.ok(highExp > chokedExp, `Sweet spot experience (${highExp}) should exceed choked queue experience (${chokedExp})`);
});

test('ScoringEngine - rankCityMandals assigns ranks and trends', () => {
  const db = new FestivalDatabase();
  const engine = new ScoringEngine();

  db.addCity({ id: 'city_test', name: 'TestCity', slug: 'test' });
  const m1 = db.addMandal({ id: 'm1', city_id: 'city_test', name: 'Mandal One', latitude: 18.5, longitude: 73.8 });
  const m2 = db.addMandal({ id: 'm2', city_id: 'city_test', name: 'Mandal Two', latitude: 18.6, longitude: 73.9 });

  // M1 has higher crowd and activity
  db.addCrowdObservation({ mandal_id: 'm1', density_score: 90, queue_score: 80, activity_score: 95 });
  db.addCrowdObservation({ mandal_id: 'm2', density_score: 40, queue_score: 20, activity_score: 50 });

  const ranked = engine.rankCityMandals(db, 'city_test');
  assert.equal(ranked.length, 2);
  assert.equal(ranked[0].currentRank, 1);
  assert.equal(ranked[1].currentRank, 2);
  assert.equal(ranked[0].mandal.id, 'm1');
  assert.equal(ranked[1].mandal.id, 'm2');
});
