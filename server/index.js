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

  // 1. HTTP Security Headers (InfoSec Vibecoded Apps Framework)
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=()');
    
    // Strict Content-Security-Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https: http:",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
      "connect-src 'self' ws: wss: https://api.open-meteo.com https://*.tile.openstreetmap.org"
    ].join('; ');
    res.setHeader('Content-Security-Policy', csp);
    next();
  });

  // 2. In-Memory Rate Limiter for API protection (DoS Mitigation)
  const rateLimitWindowMs = 60 * 1000;
  const maxRequestsPerWindow = 180;
  const ipHits = new Map();

  app.use('/api', (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const now = Date.now();
    let record = ipHits.get(ip);
    if (!record || now - record.startTime > rateLimitWindowMs) {
      record = { count: 1, startTime: now };
      ipHits.set(ip, record);
    } else {
      record.count++;
      if (record.count > maxRequestsPerWindow) {
        return res.status(429).json({
          error: 'TooManyRequests',
          message: 'Rate limit exceeded. Please wait a moment before retrying.'
        });
      }
    }
    next();
  });

  // 3. Input Sanitization & Anti-Prototype Pollution
  app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      delete req.body.__proto__;
      delete req.body.constructor;
      delete req.body.prototype;
    }
    next();
  });

  // Basic security and parsing middleware
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

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

  // Production Error Shielding
  app.use((err, req, res, next) => {
    console.error('[ServerError]', err);
    if (res.headersSent) return next(err);
    res.status(500).json({
      error: 'InternalServerError',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : err.message
    });
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
