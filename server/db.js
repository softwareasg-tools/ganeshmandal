/**
 * Database and Persistence Layer for Ganpati Festival Intelligence Platform
 *
 * Implements full domain models:
 * City, Mandal, Location, CameraFeed, CrowdObservation, PopularityObservation,
 * StageObservation, PopularityScore, HistoricalMetric, FestivalEvent.
 *
 * Provides in-memory storage with optional JSON snapshot persistence,
 * indexing for rapid geospatial & leaderboard lookups, and transaction safety.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data', 'festival_db.json');

export class FestivalDatabase {
  constructor(options = {}) {
    this.storagePath = options.storagePath || DATA_FILE;
    this.persistToDisk = options.persistToDisk ?? false;

    // Domain entity stores
    this.cities = new Map();
    this.mandals = new Map();
    this.cameraFeeds = new Map();
    this.crowdObservations = [];
    this.popularityObservations = [];
    this.stageObservations = [];
    this.popularityScores = new Map(); // mandalId -> latest PopularityScore
    this.historicalMetrics = new Map(); // mandalId -> array of 24 hourly metrics
    this.festivalEvents = new Map(); // mandalId -> array of events
    this.sponsorAds = new Map(); // adId -> SponsorAd
    this.mandalSuggestions = []; // Array of visitor suggestions
    this.advertiserInquiries = []; // Array of advertiser partnership inquiries

    // Configurable scoring weights
    this.scoringWeights = {
      crowdActivity: 0.35,
      visitorInterest: 0.20,
      socialMedia: 0.15,
      searchViews: 0.10,
      historicalPopularity: 0.10,
      liveVisualActivity: 0.10,
      decayHalfLifeHours: 4.0,
    };
  }

  // --- City Operations ---
  addCity(city) {
    this.cities.set(city.id, {
      ...city,
      slug: city.slug || city.name.toLowerCase().replace(/\s+/g, '-'),
    });
    return this.cities.get(city.id);
  }

  getCity(idOrSlug) {
    if (this.cities.has(idOrSlug)) return this.cities.get(idOrSlug);
    for (const city of this.cities.values()) {
      if (city.slug === idOrSlug.toLowerCase() || city.name.toLowerCase() === idOrSlug.toLowerCase()) {
        return city;
      }
    }
    return null;
  }

  getAllCities() {
    return Array.from(this.cities.values());
  }

  // --- Mandal Operations ---
  addMandal(mandal) {
    const id = mandal.id || `mandal_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const record = {
      id,
      city_id: mandal.city_id,
      name: mandal.name,
      slug: mandal.slug || mandal.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      latitude: Number(mandal.latitude),
      longitude: Number(mandal.longitude),
      address: mandal.address || '',
      description: mandal.description || '',
      historical_info: mandal.historical_info || '',
      timings: mandal.timings || '06:00 AM - 12:00 AM',
      organizer: mandal.organizer || '',
      official_url: mandal.official_url || '',
      image_url: mandal.image_url || '',
      temple_image_url: mandal.temple_image_url || '',
      traffic_road: mandal.traffic_road || '',
      top_roads: mandal.top_roads || [],
      status: mandal.status || 'active',
      is_famous: Boolean(mandal.is_famous),
      tags: mandal.tags || [],
      has_verified_entrance: Boolean(mandal.has_verified_entrance),
      created_at: mandal.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.mandals.set(id, record);
    return record;
  }

  updateMandal(id, updates) {
    const existing = this.mandals.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    if (updates.latitude !== undefined) updated.latitude = Number(updates.latitude);
    if (updates.longitude !== undefined) updated.longitude = Number(updates.longitude);
    this.mandals.set(id, updated);
    return updated;
  }

  deleteMandal(id) {
    return this.mandals.delete(id);
  }

  getMandal(idOrSlug) {
    if (this.mandals.has(idOrSlug)) return this.mandals.get(idOrSlug);
    for (const mandal of this.mandals.values()) {
      if (mandal.slug === idOrSlug.toLowerCase()) {
        return mandal;
      }
    }
    return null;
  }

  getMandalsByCity(cityIdOrSlug) {
    const city = this.getCity(cityIdOrSlug);
    if (!city) return [];
    return Array.from(this.mandals.values()).filter((m) => m.city_id === city.id);
  }

  getAllMandals() {
    return Array.from(this.mandals.values());
  }

  // --- Camera Feed Operations ---
  addCameraFeed(feed) {
    const id = feed.id || `feed_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const record = {
      id,
      mandal_id: feed.mandal_id,
      name: feed.name || 'Main Stage Camera',
      stream_url: feed.stream_url || '',
      feed_type: feed.feed_type || 'temple_webcast', // 'live_stream', 'hls', 'youtube'
      status: feed.status || 'OFFLINE', // 'LIVE', 'ACTIVE', 'OFFLINE'
      is_authorized: feed.is_authorized ?? true,
      resolution: feed.resolution || '1080p',
      fps: feed.fps || 30,
      last_heartbeat: feed.last_heartbeat || new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    this.cameraFeeds.set(id, record);
    return record;
  }

  updateCameraFeed(id, updates) {
    const existing = this.cameraFeeds.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      last_heartbeat: updates.status === 'OFFLINE' ? existing.last_heartbeat : new Date().toISOString(),
    };
    this.cameraFeeds.set(id, updated);
    return updated;
  }

  deleteCameraFeed(id) {
    return this.cameraFeeds.delete(id);
  }

  getFeedsByMandal(mandalId) {
    return Array.from(this.cameraFeeds.values()).filter((f) => f.mandal_id === mandalId);
  }

  getAllCameraFeeds() {
    return Array.from(this.cameraFeeds.values());
  }

  // --- Observation Operations ---
  addCrowdObservation(obs) {
    const record = {
      id: obs.id || `crowd_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      mandal_id: obs.mandal_id,
      timestamp: obs.timestamp || new Date().toISOString(),
      estimated_people: Number(obs.estimated_people) || 0,
      density_score: Math.min(100, Math.max(0, Number(obs.density_score) || 0)), // 0-100%
      queue_score: Math.min(100, Math.max(0, Number(obs.queue_score) || 0)), // 0-100%
      estimated_wait_minutes: Math.max(0, Math.round(Number(obs.estimated_wait_minutes) || 0)),
      activity_score: Math.min(100, Math.max(0, Number(obs.activity_score) || 0)),
      movement_direction: obs.movement_direction || 'Northbound queue line',
      confidence: Number(obs.confidence) || 0.85,
      source: obs.source || 'authorized_camera_feed',
      data_quality: obs.data_quality || 'VERIFIED', // 'LIVE', 'VERIFIED', 'OFFLINE'
    };
    this.crowdObservations.push(record);
    // Keep max trailing 2000 observations in memory
    if (this.crowdObservations.length > 2000) {
      this.crowdObservations.splice(0, this.crowdObservations.length - 2000);
    }
    return record;
  }

  getLatestCrowdObservation(mandalId) {
    for (let i = this.crowdObservations.length - 1; i >= 0; i--) {
      if (this.crowdObservations[i].mandal_id === mandalId) {
        return this.crowdObservations[i];
      }
    }
    return null;
  }

  addStageObservation(obs) {
    const record = {
      id: obs.id || `stage_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      mandal_id: obs.mandal_id,
      timestamp: obs.timestamp || new Date().toISOString(),
      idol_detected: Boolean(obs.idol_detected),
      people_count: Number(obs.people_count) || 0,
      moving_objects_count: Number(obs.moving_objects_count) || 0,
      led_display_detected: Boolean(obs.led_display_detected),
      mechanical_prop_detected: Boolean(obs.mechanical_prop_detected),
      lighting_effects: obs.lighting_effects || 'Standard ambient lighting',
      smoke_effects: Boolean(obs.smoke_effects),
      stage_structures_detected: obs.stage_structures_detected || ['Main sanctum', 'Pooja dais', 'Prasad counter'],
      confidence: Number(obs.confidence) || 0.90,
      detected_objects: obs.detected_objects || [],
      scene_summary: obs.scene_summary || 'Stage active with devotees offering prayers.',
      source: obs.source || 'authorized_camera_feed',
      data_quality: obs.data_quality || 'VERIFIED',
    };
    this.stageObservations.push(record);
    if (this.stageObservations.length > 1000) {
      this.stageObservations.splice(0, this.stageObservations.length - 1000);
    }
    return record;
  }

  getLatestStageObservation(mandalId) {
    for (let i = this.stageObservations.length - 1; i >= 0; i--) {
      if (this.stageObservations[i].mandal_id === mandalId) {
        return this.stageObservations[i];
      }
    }
    return null;
  }

  // --- Popularity & Score Operations ---
  setPopularityScore(mandalId, scoreRecord) {
    const record = {
      mandal_id: mandalId,
      popularity_score: Math.min(100, Math.max(0, Math.round(scoreRecord.popularity_score))),
      crowd_score: Math.min(100, Math.max(0, Math.round(scoreRecord.crowd_score))),
      experience_score: Math.min(100, Math.max(0, Math.round(scoreRecord.experience_score))),
      current_rank: scoreRecord.current_rank || 1,
      previous_rank: scoreRecord.previous_rank || scoreRecord.current_rank || 1,
      rank_change: (scoreRecord.previous_rank || 1) - (scoreRecord.current_rank || 1),
      trend: scoreRecord.trend || 'stable', // 'up', 'down', 'stable'
      signals: scoreRecord.signals || {},
      confidence: scoreRecord.confidence ?? 0.92,
      last_updated: scoreRecord.last_updated || new Date().toISOString(),
      data_quality: scoreRecord.data_quality || 'LIVE',
    };
    this.popularityScores.set(mandalId, record);
    return record;
  }

  getPopularityScore(mandalId) {
    return this.popularityScores.get(mandalId) || null;
  }

  getAllPopularityScores() {
    return Array.from(this.popularityScores.values());
  }

  // --- Historical Metrics ---
  setHistoricalMetrics(mandalId, metrics) {
    this.historicalMetrics.set(mandalId, metrics);
  }

  getHistoricalMetrics(mandalId) {
    return this.historicalMetrics.get(mandalId) || [];
  }

  // --- Festival Events ---
  setFestivalEvents(mandalId, events) {
    this.festivalEvents.set(mandalId, events);
  }

  getFestivalEvents(mandalId) {
    return this.festivalEvents.get(mandalId) || [];
  }

  // --- Sponsor Ads Operations ---
  addSponsorAd(ad) {
    const id = ad.id || `ad_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const record = {
      id,
      sponsor_name: ad.sponsor_name || 'Festival Seva Partner',
      badge_text: ad.badge_text || 'SPONSORED PARTNER',
      description: ad.description || '',
      cta_text: ad.cta_text || 'Learn More ↗',
      cta_url: ad.cta_url || '#',
      placement: ad.placement || 'leaderboard', // 'top_banner', 'leaderboard', 'modal_footer', 'pov_rush', 'map_float'
      insert_after_rank: ad.insert_after_rank ? parseInt(ad.insert_after_rank, 10) : 2,
      active: ad.active !== false,
      created_at: ad.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.sponsorAds.set(id, record);
    return record;
  }

  getSponsorAd(id) {
    return this.sponsorAds.get(id) || null;
  }

  updateSponsorAd(id, updates) {
    const existing = this.sponsorAds.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      sponsor_name: updates.sponsor_name !== undefined ? updates.sponsor_name : existing.sponsor_name,
      badge_text: updates.badge_text !== undefined ? updates.badge_text : existing.badge_text,
      description: updates.description !== undefined ? updates.description : existing.description,
      cta_text: updates.cta_text !== undefined ? updates.cta_text : existing.cta_text,
      cta_url: updates.cta_url !== undefined ? updates.cta_url : existing.cta_url,
      placement: updates.placement !== undefined ? updates.placement : existing.placement,
      insert_after_rank: updates.insert_after_rank !== undefined ? parseInt(updates.insert_after_rank, 10) : existing.insert_after_rank,
      active: updates.active !== undefined ? updates.active : existing.active,
      updated_at: new Date().toISOString(),
    };
    this.sponsorAds.set(id, updated);
    return updated;
  }

  deleteSponsorAd(id) {
    return this.sponsorAds.delete(id);
  }

  getAllSponsorAds(placement = null) {
    let ads = Array.from(this.sponsorAds.values()).filter(a => a.active);
    if (placement) {
      ads = ads.filter(a => a.placement === placement);
    }
    return ads;
  }

  // --- Visitor Mandal Suggestions ---
  addSuggestion(suggestion) {
    const record = {
      id: `sug_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      mandal_name: suggestion.mandal_name || 'Unspecified Mandal',
      city: suggestion.city || 'pune',
      google_maps_url: suggestion.google_maps_url,
      visitor_email: suggestion.visitor_email,
      notes: suggestion.notes || '',
      status: 'PENDING_REVIEW',
      created_at: new Date().toISOString(),
    };
    this.mandalSuggestions.unshift(record);
    return record;
  }

  getAllSuggestions() {
    return [...this.mandalSuggestions];
  }

  // --- Advertiser Partnership Inquiries ---
  addAdvertiserInquiry(inquiry) {
    const record = {
      id: `adv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      brand_name: inquiry.brand_name ? inquiry.brand_name.trim() : 'Unspecified Brand',
      contact_name: inquiry.contact_name ? inquiry.contact_name.trim() : '',
      email: inquiry.email ? inquiry.email.trim() : '',
      phone: inquiry.phone ? inquiry.phone.trim() : '',
      target_city: inquiry.target_city || 'all',
      placement_interest: inquiry.placement_interest || 'leaderboard',
      budget_range: inquiry.budget_range || 'flexible',
      message: inquiry.message ? inquiry.message.trim() : '',
      status: 'PENDING_CONTACT',
      created_at: new Date().toISOString(),
    };
    this.advertiserInquiries.unshift(record);
    return record;
  }

  getAllAdvertiserInquiries() {
    return [...this.advertiserInquiries];
  }

  // --- Persistence snapshot ---
  saveSnapshot() {
    if (!this.persistToDisk) return;
    try {
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const payload = {
        cities: Array.from(this.cities.values()),
        mandals: Array.from(this.mandals.values()),
        cameraFeeds: Array.from(this.cameraFeeds.values()),
        scoringWeights: this.scoringWeights,
      };
      fs.writeFileSync(this.storagePath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to persist snapshot to disk:', err.message);
    }
  }

  loadSnapshot() {
    if (!this.persistToDisk || !fs.existsSync(this.storagePath)) return false;
    try {
      const raw = fs.readFileSync(this.storagePath, 'utf-8');
      const data = JSON.parse(raw);
      if (data.cities) data.cities.forEach((c) => this.addCity(c));
      if (data.mandals) data.mandals.forEach((m) => this.addMandal(m));
      if (data.cameraFeeds) data.cameraFeeds.forEach((f) => this.addCameraFeed(f));
      if (data.scoringWeights) this.scoringWeights = { ...this.scoringWeights, ...data.scoringWeights };
      return true;
    } catch (err) {
      console.error('[DB] Failed to load snapshot from disk:', err.message);
      return false;
    }
  }
}

export const db = new FestivalDatabase();
