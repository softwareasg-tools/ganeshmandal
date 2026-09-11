import test from 'node:test';
import assert from 'node:assert/strict';
import { CVEngine } from '../server/cvEngine.js';

test('CVEngine - offline feed returns available false', () => {
  const cv = new CVEngine();
  const feed = { status: 'OFFLINE' };
  const mandal = { id: 'm1', name: 'Test Mandal' };

  const res = cv.analyzeVisualScene(feed, mandal);
  assert.equal(res.available, false);
  assert.equal(res.status, 'OFFLINE');
  assert.ok(res.message.includes('No authorized live camera'));
});

test('CVEngine - live feed returns detections and crowd estimate', () => {
  const cv = new CVEngine();
  const feed = { id: 'f1', status: 'LIVE', is_authorized: true };
  const mandal = { id: 'mandal_pune_dagdusheth', name: 'Dagdusheth Halwai' };

  const res = cv.analyzeVisualScene(feed, mandal);
  assert.equal(res.available, true);
  assert.equal(res.status, 'LIVE');
  assert.ok(res.crowd.density_score >= 0 && res.crowd.density_score <= 100);
  assert.ok(res.crowd.estimated_people > 0);
  assert.ok(res.stage.idol_detected, 'Idol must be detected');
  assert.ok(Array.isArray(res.stage.detected_objects));
  assert.ok(res.stage.detected_objects.length >= 3);
  assert.ok(typeof res.stage.scene_summary === 'string');
  assert.ok(res.privacyGuarantees.length > 0);
});

test('CVEngine - detects mechanical props for applicable mandals', () => {
  const cv = new CVEngine();
  const feed = { id: 'f1', status: 'LIVE' };
  const mandal = { id: 'mandal_pune_dagdusheth', name: 'Dagdusheth Halwai' };

  const res = cv.analyzeVisualScene(feed, mandal);
  assert.ok(res.stage.mechanical_prop_detected, 'Dagdusheth should feature mechanical display detections');
  const propObj = res.stage.detected_objects.find((o) => o.label.includes('Mechanical Prop'));
  assert.ok(propObj, 'Mechanical Prop must be in detected_objects array');
});
