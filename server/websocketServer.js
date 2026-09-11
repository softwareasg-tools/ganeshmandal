/**
 * Real-Time WebSocket Server for Ganpati Festival Intelligence
 *
 * Implements:
 * - Room/Channel subscription by city (`pune`, `mumbai`)
 * - Live crowd and stage observation broadcasts
 * - Continuous ranking shift and leaderboard telemetry
 * - Resilient heartbeat ping/pong with connection cleanup
 */

import { WebSocketServer, WebSocket } from 'ws';
import { db } from './db.js';
import { scoringEngine } from './scoringEngine.js';
import { cvEngine } from './cvEngine.js';

export class FestivalWebSocketServer {
  constructor() {
    this.wss = null;
    this.clientRooms = new Map(); // ws client -> citySlug
    this.simulationTimer = null;
  }

  attach(httpServer) {
    this.wss = new WebSocketServer({
      server: httpServer,
      path: '/api/live',
    });

    this.wss.on('connection', (ws, req) => {
      // Determine city from URL query, e.g. /api/live?city=pune or default to pune
      const url = new URL(req.url, 'http://localhost');
      let citySlug = (url.searchParams.get('city') || 'pune').toLowerCase();
      if (citySlug !== 'mumbai' && citySlug !== 'pune') citySlug = 'pune';

      this.clientRooms.set(ws, citySlug);
      ws.isAlive = true;

      // Send initial welcome & snapshot
      this.sendToClient(ws, {
        type: 'CONNECTED',
        city: citySlug,
        timestamp: new Date().toISOString(),
        message: `Subscribed to live intelligence stream for ${citySlug.toUpperCase()}`,
      });

      this.sendLeaderboardSnapshot(ws, citySlug);

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'SUBSCRIBE_CITY' && msg.city) {
            const newCity = msg.city.toLowerCase();
            this.clientRooms.set(ws, newCity);
            this.sendToClient(ws, {
              type: 'CITY_SWITCHED',
              city: newCity,
              timestamp: new Date().toISOString(),
            });
            this.sendLeaderboardSnapshot(ws, newCity);
          } else if (msg.type === 'PING') {
            this.sendToClient(ws, { type: 'PONG', timestamp: Date.now() });
          }
        } catch (e) {
          // ignore malformed payloads
        }
      });

      ws.on('close', () => {
        this.clientRooms.delete(ws);
      });

      ws.on('error', () => {
        this.clientRooms.delete(ws);
      });
    });

    // Heartbeat audit every 30 seconds
    this.heartbeatTimer = setInterval(() => {
      if (!this.wss) return;
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
    this.heartbeatTimer.unref();

    // Start Real-Time Ingestion / Simulation Heartbeat (Runs every 4 seconds)
    this.startLiveSimulation();
  }

  sendToClient(ws, payload) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }

  broadcastToCity(citySlug, payload) {
    const raw = JSON.stringify(payload);
    for (const [ws, roomCity] of this.clientRooms.entries()) {
      if (roomCity === citySlug && ws.readyState === WebSocket.OPEN) {
        ws.send(raw);
      }
    }
  }

  sendLeaderboardSnapshot(ws, citySlug) {
    const city = db.getCity(citySlug);
    if (!city) return;

    const ranked = scoringEngine.rankCityMandals(db, city.id);
    const leaderboard = ranked.map((item) => ({
      rank: item.currentRank,
      previous_rank: item.previousRank,
      rank_change: item.rankDelta,
      trend: item.trend,
      mandal_id: item.mandal.id,
      name: item.mandal.name,
      crowd_score: item.crowdScore,
      popularity_score: item.popularityScore,
      experience_score: item.experienceScore,
      estimated_wait_minutes: item.estimatedWaitMins,
      data_quality: item.dataQuality,
      last_updated: item.scoreRecord.last_updated,
    }));

    this.sendToClient(ws, {
      type: 'LEADERBOARD_UPDATE',
      city: city.slug,
      cityName: city.name,
      timestamp: new Date().toISOString(),
      leaderboard,
    });
  }

  /**
   * Continuous background processing loop:
   * Simulates real-time sensor & video arrivals, updates CV observations,
   * recomputes rankings, and emits delta updates.
   */
  startLiveSimulation() {
    if (this.simulationTimer) clearInterval(this.simulationTimer);

    this.simulationTimer = setInterval(() => {
      try {
        const cities = db.getAllCities();
        for (const city of cities) {
          const mandals = db.getMandalsByCity(city.id);
          if (!mandals.length) continue;

          // Pick 1-2 random mandals in this city to receive incoming telemetry
          const mandal = mandals[Math.floor(Math.random() * mandals.length)];
          const feeds = db.getFeedsByMandal(mandal.id);
          const primaryFeed = feeds[0] || { status: 'VERIFIED' };

          // Run CV scene analysis
          const visualResult = cvEngine.analyzeVisualScene(primaryFeed, mandal);
          if (visualResult.available) {
            db.addCrowdObservation(visualResult.crowd);
            db.addStageObservation(visualResult.stage);

            // Broadcast observation event
            this.broadcastToCity(city.slug, {
              type: 'MANDAL_TELEMETRY',
              city: city.slug,
              mandal_id: mandal.id,
              mandal_name: mandal.name,
              crowd: visualResult.crowd,
              stage: visualResult.stage,
              timestamp: new Date().toISOString(),
            });
          }

          // Re-rank city
          const ranked = scoringEngine.rankCityMandals(db, city.id);
          const leaderboard = ranked.map((item) => ({
            rank: item.currentRank,
            previous_rank: item.previousRank,
            rank_change: item.rankDelta,
            trend: item.trend,
            mandal_id: item.mandal.id,
            name: item.mandal.name,
            crowd_score: item.crowdScore,
            popularity_score: item.popularityScore,
            experience_score: item.experienceScore,
            estimated_wait_minutes: item.estimatedWaitMins,
            data_quality: item.dataQuality,
            last_updated: item.scoreRecord.last_updated,
          }));

          // Broadcast leaderboard update
          this.broadcastToCity(city.slug, {
            type: 'LEADERBOARD_UPDATE',
            city: city.slug,
            cityName: city.name,
            timestamp: new Date().toISOString(),
            leaderboard,
          });
        }
      } catch (err) {
        console.error('[WebSocketServer] Error in simulation cycle:', err.message);
      }
    }, 4000);
    this.simulationTimer.unref();
  }

  stop() {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.wss) {
      for (const client of this.wss.clients) {
        client.terminate();
      }
      this.wss.close();
      this.wss = null;
    }
  }
}

export const festivalWs = new FestivalWebSocketServer();
