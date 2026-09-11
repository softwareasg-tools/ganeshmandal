/**
 * Main Application Server for Ganpati Festival Intelligence Platform
 *
 * Bootstraps:
 * - In-memory Database with Authentic Pune & Mumbai Seeds
 * - Scoring and Computer Vision Pipelines
 * - Express REST API Router
 * - Real-Time WebSocket Telemetry Server
 * - Static Assets and Frontend UI Delivery
 */

import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import { initializeSeedData } from './seedData.js';
import { apiRouter } from './apiRouter.js';
import { festivalWs } from './websocketServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const PORT = Number(process.env.PORT) || 30000;
const HOST = process.env.HOST || '0.0.0.0';

export function createApp() {
  const app = express();

  // Basic security and parsing middleware
  app.use(cors());
  app.use(express.json());

  // Mount API
  app.use('/api', apiRouter);

  // Serve static assets
  app.use(express.static(path.join(ROOT_DIR, 'public')));
  app.use('/src', express.static(path.join(ROOT_DIR, 'src')));

  // Fallback to index.html for client-side routing
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(ROOT_DIR, 'public', 'index.html'));
  });

  return app;
}

export function startServer(port = PORT) {
  console.log('========================================================');
  console.log('  GANPATI FESTIVAL INTELLIGENCE & DISCOVERY PLATFORM   ');
  console.log('            Pune & Mumbai Live Operations             ');
  console.log('========================================================');

  // 1. Seed initial data
  initializeSeedData(db);
  console.log(`[DB] Seeded ${db.getAllCities().length} cities, ${db.getAllMandals().length} mandals, ${db.getAllCameraFeeds().length} camera feeds.`);

  // 2. Create Express app & HTTP Server
  const app = createApp();
  const server = http.createServer(app);

  // 3. Attach WebSocket Server
  festivalWs.attach(server);
  console.log('[WebSocket] Real-time stream attached to /api/live');

  // 4. Start listening
  server.listen(port, HOST, () => {
    console.log(`[Server] Live dashboard running at: http://localhost:${port}`);
    console.log(`[Server] REST API base: http://localhost:${port}/api`);
    console.log(`[Server] WebSocket live stream: ws://localhost:${port}/api/live?city=pune`);
    console.log('========================================================\n');
  });

  return { app, server };
}

// Direct execution guard
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}
