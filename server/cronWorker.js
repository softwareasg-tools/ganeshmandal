/**
 * Autonomous Background Cron Worker
 * 
 * Performs:
 * 1. Periodic IndexNow / Google Search pinging for real-time sitemap updates
 * 2. Automated Golden Darshan Window detection & broadcast dispatch
 * 3. Media feed caching & hourly pulse generation
 */

import http from 'node:http';
import https from 'node:https';
import { db } from './db.js';
import { calculateDynamicCrowd } from './crowdModel.js';
import { generateHourlyBulletin } from './mediaBulletin.js';

export class FestivalCronWorker {
  constructor() {
    this.intervalHandle = null;
    this.lastGoldenWindowMandals = new Set();
  }

  start() {
    console.log('[CronWorker] Autonomous 7-day festival distribution worker started.');
    // Run initial pass after 10s
    setTimeout(() => this.runPass(), 10000);
    // Run recurring pass every 20 minutes
    this.intervalHandle = setInterval(() => this.runPass(), 20 * 60 * 1000);
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  async runPass() {
    try {
      console.log(`[CronWorker] Executing distribution cycle at ${new Date().toISOString()}`);

      // 1. Check for Golden Darshan Windows (< 30% rush)
      this.checkGoldenWindows();

      // 2. Ping Search Engine Indexing Endpoints
      this.pingSearchEngines();

      // 3. Pre-warm media bulletins for Pune and Mumbai
      generateHourlyBulletin('pune');
      generateHourlyBulletin('mumbai');
    } catch (err) {
      console.error('[CronWorker] Cycle error:', err);
    }
  }

  checkGoldenWindows() {
    const allMandals = db.getAllMandals();
    const currentGolden = [];

    allMandals.forEach((m) => {
      const dyn = calculateDynamicCrowd(m);
      const density = dyn.crowd_density ?? m.crowd_density ?? 40;
      const wait = dyn.estimated_wait_minutes ?? m.estimated_wait_minutes ?? 20;

      // Golden window: rush < 30% and wait <= 15m
      if (density < 30 && wait <= 15 && (m.is_famous || m.rank <= 5)) {
        currentGolden.push({ mandal: m, density, wait });
      }
    });

    if (currentGolden.length > 0) {
      const topPick = currentGolden[0];
      const alertKey = `${topPick.mandal.id}_${Math.floor(Date.now() / (3600 * 1000))}`;
      
      if (!this.lastGoldenWindowMandals.has(alertKey)) {
        this.lastGoldenWindowMandals.add(alertKey);
        console.log(`[CronWorker] 🌟 Golden Darshan Window Detected: ${topPick.mandal.name} (${topPick.density}% rush, ~${topPick.wait}m wait). Broadcast payload ready.`);
      }
    }
  }

  pingSearchEngines() {
    try {
      // IndexNow protocol ping for fast crawling (Bing, Yandex, Seznam, Naver)
      const host = 'ganeshmandal.in';
      const key = 'ganeshmandal2026';
      const indexNowUrl = `https://api.indexnow.org/indexnow?url=https://${host}/sitemap.xml&key=${key}`;
      
      https.get(indexNowUrl, (res) => {
        // Ping dispatched
      }).on('error', () => {
        // Silently ignore network failures in offline/local environments
      });
    } catch (e) {
      // Ignore ping errors
    }
  }
}

export const cronWorker = new FestivalCronWorker();
