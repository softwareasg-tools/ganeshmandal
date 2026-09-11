import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { WebSocket } from 'ws';
import { createApp } from '../server/index.js';
import { db } from '../server/db.js';
import { initializeSeedData } from '../server/seedData.js';
import { festivalWs } from '../server/websocketServer.js';

let server;
let wsUrl;

test.before(async () => {
  initializeSeedData(db);
  const app = createApp();
  server = http.createServer(app);
  festivalWs.attach(server);

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      wsUrl = `ws://127.0.0.1:${port}/api/live?city=pune`;
      resolve();
    });
  });
});

test.after(async () => {
  festivalWs.stop();
  await new Promise((resolve) => server.close(resolve));
});

test('WebSocket - connects and receives welcome & leaderboard snapshot', async () => {
  const ws = new WebSocket(wsUrl);

  const messages = [];
  await new Promise((resolve, reject) => {
    ws.on('open', () => {});
    ws.on('message', (data) => {
      const parsed = JSON.parse(data.toString());
      messages.push(parsed);
      if (messages.length >= 2) {
        ws.close();
        resolve();
      }
    });
    ws.on('error', reject);
    setTimeout(() => reject(new Error('WebSocket timeout waiting for messages')), 4000);
  });

  const welcome = messages.find((m) => m.type === 'CONNECTED');
  const snapshot = messages.find((m) => m.type === 'LEADERBOARD_UPDATE');

  assert.ok(welcome, 'Must receive CONNECTED event');
  assert.equal(welcome.city, 'pune');
  assert.ok(snapshot, 'Must receive LEADERBOARD_UPDATE snapshot');
  assert.ok(snapshot.leaderboard.length > 0);
  assert.equal(snapshot.leaderboard[0].rank, 1);
});
