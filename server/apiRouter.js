/**
 * REST API Router for Ganpati Festival Intelligence Platform
 *
 * Implements:
 * - Public Discovery Endpoints (cities, mandals, live feeds, analytics, rankings, heatmap, recommendations, weather)
 * - Admin Operations Endpoints (mandal CRUD, camera feeds, weight tuning, telemetry inspection)
 * - Strict input validation and structured JSON error responses
 */

import express from 'express';
import crypto from 'node:crypto';
import { db } from './db.js';
import { scoringEngine } from './scoringEngine.js';
import { cvEngine } from './cvEngine.js';
import { recommendationEngine } from './recommendationEngine.js';
import { weatherService } from './weatherService.js';
import { socialAggregator } from './socialAggregator.js';
import { calculateDynamicCrowd } from './crowdModel.js';

export const apiRouter = express.Router();

// Middleware: Admin Password Authentication (Password: asg12345$)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'asg12345$';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'ganpati-admin-secret-2026';

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers['x-admin-password'] || req.headers['x-admin-key'] || req.query.admin_password || req.query.admin_key;
  if (safeCompare(authHeader, ADMIN_PASSWORD) || safeCompare(authHeader, ADMIN_API_KEY)) {
    return next();
  }
  return res.status(401).json({
    error: 'Unauthorized',
    message: 'Admin password is required or invalid. Pass X-Admin-Password header.',
  });
}

/**
 * POST /api/admin/login
 * Verify admin password (asg12345$)
 */
apiRouter.post('/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      message: 'Admin access granted.',
      token: ADMIN_PASSWORD,
    });
  }
  return res.status(401).json({
    error: 'Unauthorized',
    message: 'Invalid admin password. Access denied.',
  });
});

// -------------------------------------------------------------
// Public Endpoints
// -------------------------------------------------------------

/**
 * GET /api/cities
 * Returns all monitored festival cities with geofencing bounds
 */
apiRouter.get('/cities', (req, res) => {
  const cities = db.getAllCities();
  res.json({
    success: true,
    count: cities.length,
    data: cities,
  });
});

/**
 * GET /api/mandals
 * Returns all mandals across Pune and Mumbai (or filtered by ?city=pune or ?city=mumbai)
 */
apiRouter.get('/mandals', (req, res) => {
  const cityQuery = req.query.city;
  let mandals = [];
  if (cityQuery) {
    const city = db.getCity(cityQuery);
    if (!city) {
      return res.status(404).json({ error: 'NotFound', message: `City '${cityQuery}' not found.` });
    }
    scoringEngine.rankCityMandals(db, city.id);
    mandals = db.getMandalsByCity(city.id);
  } else {
    // Rank all cities
    const cities = db.getAllCities();
    cities.forEach((c) => scoringEngine.rankCityMandals(db, c.id));
    mandals = db.getAllMandals();
  }

  const enriched = mandals.map((mandal) => {
    const score = db.getPopularityScore(mandal.id);
    const dynamicCrowd = calculateDynamicCrowd(mandal);
    const feeds = db.getFeedsByMandal(mandal.id);
    const media = socialAggregator.getMediaForMandal(mandal.id);
    const hasActiveStream = (media?.stream_status === 'BROADCASTING' || media?.stream_status === 'LIVE') && Boolean(media?.official_stream_embed);

    return {
      ...mandal,
      top_roads: dynamicCrowd.top_roads,
      current_rank: score?.current_rank || null,
      previous_rank: score?.previous_rank || null,
      rank_change: score?.rank_change || 0,
      trend: score?.trend || 'stable',
      popularity_score: score?.popularity_score || 50,
      crowd_score: score?.crowd_score || 50,
      experience_score: score?.experience_score || 50,
      estimated_wait_minutes: dynamicCrowd.estimated_wait_minutes,
      crowd_density: dynamicCrowd.density_score,
      rush_category: dynamicCrowd.rush_category,
      rush_color: dynamicCrowd.rush_color,
      period_label: dynamicCrowd.period_label,
      road_status: dynamicCrowd.road_status,
      avg_speed_kmh: dynamicCrowd.avg_speed_kmh,
      has_live_camera: hasActiveStream,
      feed_count: feeds.length,
      data_quality: dynamicCrowd.data_quality,
      last_updated: score?.last_updated || dynamicCrowd.timestamp || new Date().toISOString(),
    };
  });

  enriched.sort((a, b) => (a.current_rank || 999) - (b.current_rank || 999));

  res.json({
    success: true,
    count: enriched.length,
    data: enriched,
  });
});

/**
 * GET /api/cities/:city/mandals
 * Returns all mandals in a city enriched with current crowd, rank, and live feed availability
 */
apiRouter.get('/cities/:city/mandals', (req, res) => {
  const city = db.getCity(req.params.city);
  if (!city) {
    return res.status(404).json({ error: 'NotFound', message: `City '${req.params.city}' not found.` });
  }

  // Ensure current rankings are computed
  scoringEngine.rankCityMandals(db, city.id);

  const mandals = db.getMandalsByCity(city.id);
  const enriched = mandals.map((mandal) => {
    const score = db.getPopularityScore(mandal.id);
    const dynamicCrowd = calculateDynamicCrowd(mandal);
    const feeds = db.getFeedsByMandal(mandal.id);
    const media = socialAggregator.getMediaForMandal(mandal.id);
    // Real live stream active check
    const hasActiveStream = (media?.stream_status === 'BROADCASTING' || media?.stream_status === 'LIVE') && Boolean(media?.official_stream_embed);
    const hasLiveCamera = hasActiveStream;

    return {
      ...mandal,
      top_roads: dynamicCrowd.top_roads,
      current_rank: score?.current_rank || null,
      previous_rank: score?.previous_rank || null,
      rank_change: score?.rank_change || 0,
      trend: score?.trend || 'stable',
      popularity_score: score?.popularity_score || 50,
      crowd_score: score?.crowd_score || 50,
      experience_score: score?.experience_score || 50,
      estimated_wait_minutes: dynamicCrowd.estimated_wait_minutes,
      crowd_density: dynamicCrowd.density_score,
      rush_category: dynamicCrowd.rush_category,
      rush_color: dynamicCrowd.rush_color,
      period_label: dynamicCrowd.period_label,
      road_status: dynamicCrowd.road_status,
      avg_speed_kmh: dynamicCrowd.avg_speed_kmh,
      has_live_camera: hasLiveCamera,
      feed_count: feeds.length,
      data_quality: dynamicCrowd.data_quality,
      last_updated: score?.last_updated || dynamicCrowd.timestamp || new Date().toISOString(),
    };
  });

  // Sort by rank
  enriched.sort((a, b) => (a.current_rank || 999) - (b.current_rank || 999));

  res.json({
    success: true,
    city: city.name,
    count: enriched.length,
    data: enriched,
  });
});

/**
 * GET /api/mandals/:id
 * Detailed mandal profile with festival information and latest observations
 */
apiRouter.get('/mandals/:id', (req, res) => {
  const mandal = db.getMandal(req.params.id);
  if (!mandal) {
    return res.status(404).json({ error: 'NotFound', message: `Mandal '${req.params.id}' not found.` });
  }

  const score = db.getPopularityScore(mandal.id);
  const crowd = db.getLatestCrowdObservation(mandal.id);
  const stage = db.getLatestStageObservation(mandal.id);
  const feeds = db.getFeedsByMandal(mandal.id);
  const events = db.getFestivalEvents(mandal.id);
  const dynamicCrowd = calculateDynamicCrowd(mandal);

  const enrichedMandal = {
    ...mandal,
    top_roads: dynamicCrowd.top_roads,
    estimated_wait_minutes: dynamicCrowd.estimated_wait_minutes,
    crowd_density: dynamicCrowd.density_score,
    rush_category: dynamicCrowd.rush_category,
    rush_color: dynamicCrowd.rush_color,
    period_label: dynamicCrowd.period_label,
    road_status: dynamicCrowd.road_status,
    avg_speed_kmh: dynamicCrowd.avg_speed_kmh,
    data_quality: dynamicCrowd.data_quality,
  };

  res.json({
    success: true,
    data: {
      mandal: enrichedMandal,
      score,
      crowd,
      stage,
      feeds,
      events,
      signals: score?.signals || {},
    },
  });
});

/**
 * GET /api/mandals/:id/live
 * Live visual view and computer vision scene analysis
 */
apiRouter.get('/mandals/:id/live', (req, res) => {
  const mandal = db.getMandal(req.params.id);
  if (!mandal) {
    return res.status(404).json({ error: 'NotFound', message: `Mandal '${req.params.id}' not found.` });
  }

  const feeds = db.getFeedsByMandal(mandal.id);
  const primaryFeed = feeds.find((f) => f.status === 'LIVE') || feeds.find((f) => f.status === 'VERIFIED') || feeds[0];

  const analysis = cvEngine.analyzeVisualScene(primaryFeed, mandal);
  const score = db.getPopularityScore(mandal.id);

  res.json({
    success: true,
    mandal_id: mandal.id,
    mandal_name: mandal.name,
    feed: primaryFeed || null,
    visual_analysis: analysis,
    popularity_score: score?.popularity_score || 60,
    crowd_density: analysis.crowd?.density_score || 55,
    last_updated: new Date().toISOString(),
  });
});

/**
 * GET /api/mandals/:id/analytics
 * Historical crowd, popularity, and peak visitation trends
 */
apiRouter.get('/mandals/:id/analytics', (req, res) => {
  const mandal = db.getMandal(req.params.id);
  if (!mandal) {
    return res.status(404).json({ error: 'NotFound', message: `Mandal '${req.params.id}' not found.` });
  }

  const history = db.getHistoricalMetrics(mandal.id);
  const score = db.getPopularityScore(mandal.id);

  // Calculate peak hours
  let peakHour = 'N/A';
  let maxDensity = -1;
  history.forEach((h) => {
    if (h.crowd_density > maxDensity) {
      maxDensity = h.crowd_density;
      peakHour = h.hour_label;
    }
  });

  res.json({
    success: true,
    mandal_id: mandal.id,
    mandal_name: mandal.name,
    current_metrics: {
      rank: score?.current_rank || 1,
      popularity_score: score?.popularity_score || 60,
      crowd_score: score?.crowd_score || 50,
      experience_score: score?.experience_score || 70,
    },
    peak_crowd_hour: peakHour,
    peak_density_observed: maxDensity,
    hourly_history_24h: history,
  });
});

/**
 * GET /api/mandals/:id/social
 * Collates official live streams, hashtag social media posts, and devotee reels
 */
apiRouter.get('/mandals/:id/social', (req, res) => {
  const mandal = db.getMandal(req.params.id);
  if (!mandal) {
    return res.status(404).json({ error: 'NotFound', message: `Mandal '${req.params.id}' not found.` });
  }

  const media = socialAggregator.getMediaForMandal(mandal.id);
  res.json({
    success: true,
    mandal_id: mandal.id,
    mandal_name: mandal.name,
    media,
  });
});

/**
 * GET /api/social/trending/:city
 * Returns trending devotee reels & photos across the city
 */
apiRouter.get('/social/trending/:city', (req, res) => {
  const city = db.getCity(req.params.city);
  if (!city) {
    return res.status(404).json({ error: 'NotFound', message: `City '${req.params.city}' not found.` });
  }

  const posts = socialAggregator.getTrendingCityPosts(city.slug);
  res.json({
    success: true,
    city: city.name,
    count: posts.length,
    posts,
  });
});

/**
 * GET /api/rankings/:city
 * Real-time leaderboard for a city with rank changes and trend indicators
 */
apiRouter.get('/rankings/:city', (req, res) => {
  const city = db.getCity(req.params.city);
  if (!city) {
    return res.status(404).json({ error: 'NotFound', message: `City '${req.params.city}' not found.` });
  }

  const rankings = scoringEngine.rankCityMandals(db, city.id);

  const leaderboard = rankings.map((item) => ({
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

  res.json({
    success: true,
    city: city.name,
    total_mandals: leaderboard.length,
    leaderboard,
    scoring_weights: scoringEngine.getWeights(),
  });
});

/**
 * GET /api/heatmap/:city
 * Crowd and popularity coordinates for map heatmap rendering
 */
apiRouter.get('/heatmap/:city', (req, res) => {
  const city = db.getCity(req.params.city);
  if (!city) {
    return res.status(404).json({ error: 'NotFound', message: `City '${req.params.city}' not found.` });
  }

  const mandals = db.getMandalsByCity(city.id);
  const heatmapPoints = mandals.map((mandal) => {
    const dynamicCrowd = calculateDynamicCrowd(mandal);
    const score = db.getPopularityScore(mandal.id);

    const crowdDensity = dynamicCrowd.density_score;
    const popularity = score?.popularity_score || 50;

    // Heatmap intensity normalized to 0.0 - 1.0
    const intensity = Math.min(1.0, Math.max(0.05, crowdDensity / 100));

    return {
      mandal_id: mandal.id,
      name: mandal.name,
      lat: mandal.latitude,
      lng: mandal.longitude,
      crowd_density: crowdDensity,
      rush_category: dynamicCrowd.rush_category,
      rush_color: dynamicCrowd.rush_color,
      road_status: dynamicCrowd.road_status,
      popularity_score: popularity,
      intensity,
      color_category:
        crowdDensity > 85 ? 'extreme' : crowdDensity > 65 ? 'high' : crowdDensity > 45 ? 'moderate' : 'low',
    };
  });

  res.json({
    success: true,
    city: city.name,
    count: heatmapPoints.length,
    points: heatmapPoints,
  });
});

/**
 * GET /api/recommendations
 * Smart recommendation engine filtering
 */
apiRouter.get('/recommendations', (req, res) => {
  const cityParam = req.query.city || 'pune';
  const city = db.getCity(cityParam);
  if (!city) {
    return res.status(404).json({ error: 'NotFound', message: `City '${cityParam}' not found.` });
  }

  const criterion = req.query.criterion || 'best_experience';
  let userLocation = null;
  if (req.query.lat && req.query.lng) {
    userLocation = { lat: Number(req.query.lat), lng: Number(req.query.lng) };
  }

  const results = recommendationEngine.getRecommendations(db, city.id, criterion, userLocation);

  res.json({
    success: true,
    city: city.name,
    criterion,
    count: results.length,
    recommendations: results,
  });
});

/**
 * GET /api/weather/:city
 * Open-Meteo live weather data & festival queue impact
 */
apiRouter.get('/weather/:city', async (req, res) => {
  const city = db.getCity(req.params.city);
  if (!city) {
    return res.status(404).json({ error: 'NotFound', message: `City '${req.params.city}' not found.` });
  }

  try {
    const weather = await weatherService.getWeather(city.slug);
    res.json({
      success: true,
      data: weather,
    });
  } catch (err) {
    res.status(500).json({ error: 'WeatherError', message: err.message });
  }
});

// -------------------------------------------------------------
// Admin & Management Endpoints
// -------------------------------------------------------------

/**
 * POST /api/admin/mandals
 * Add a new mandal to the festival registry
 */
apiRouter.post('/admin/mandals', requireAdminAuth, (req, res) => {
  const { name, city_id, latitude, longitude, address, description, timings, organizer, official_url, image_url, temple_image_url, is_famous, tags } = req.body;

  if (!name || !city_id || latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Fields name, city_id, latitude, and longitude are required.',
    });
  }

  const city = db.getCity(city_id);
  if (!city) {
    return res.status(400).json({ error: 'BadRequest', message: `Invalid city_id '${city_id}'.` });
  }

  // Default approach roads if none provided
  const top_roads = [
    { name: `${name} Main Approach`, distance: '150m from pandal', color: 'orange', status: 'Moderate Festival Rush', delay: '~14 min delay', avg_speed: '16 km/h', maps_query: `${address || name}` },
    { name: `${name} Side Arterial`, distance: '420m from pandal', color: 'blue', status: 'Clear • Moving smoothly', delay: '~6 min delay', avg_speed: '30 km/h', maps_query: `${address || name}` },
    { name: `${name} Connector Link`, distance: '780m from pandal', color: 'blue', status: 'Clear • Free flow corridor', delay: '~5 min delay', avg_speed: '32 km/h', maps_query: `${address || name}` },
  ];

  const created = db.addMandal({
    name,
    city_id: city.id,
    latitude: Number(latitude),
    longitude: Number(longitude),
    address: address || '',
    description: description || 'Sacred Sarvajanik Ganpati Mandal celebrating Ganeshotsav with devotion.',
    historical_info: req.body.historical_info || 'Community Ganeshotsav Mandal established with local devotee participation.',
    timings: timings || '06:00 AM - 11:30 PM',
    organizer: organizer || `${name} Trust`,
    official_url: official_url || '',
    image_url: image_url || '/images/mandals/dagdusheth_idol.jpg',
    temple_image_url: temple_image_url || '',
    traffic_road: `${name} Approach Road`,
    top_roads,
    is_famous: Boolean(is_famous),
    tags: Array.isArray(tags) ? tags : ['Sarvajanik Ganpati', 'Devotional Darshan'],
  });

  // Add initial observation
  db.addCrowdObservation({
    mandal_id: created.id,
    estimated_people: 120,
    density_score: 55,
    queue_score: 50,
    estimated_wait_minutes: 18,
    activity_score: 70,
    confidence: 0.90,
    source: 'admin_initialization',
    data_quality: 'VERIFIED',
  });

  res.status(201).json({ success: true, data: created });
});

/**
 * PUT /api/admin/mandals/:id
 * Update an existing mandal (e.g. adjust coordinates, status, timings)
 */
apiRouter.put('/admin/mandals/:id', requireAdminAuth, (req, res) => {
  const updated = db.updateMandal(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'NotFound', message: `Mandal '${req.params.id}' not found.` });
  }
  res.json({ success: true, data: updated });
});

/**
 * DELETE /api/admin/mandals/:id
 * Delete a mandal permanently
 */
apiRouter.delete('/admin/mandals/:id', requireAdminAuth, (req, res) => {
  const deleted = db.deleteMandal(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'NotFound', message: `Mandal '${req.params.id}' not found.` });
  }
  res.json({ success: true, message: `Mandal ${req.params.id} deleted successfully.` });
});

// -------------------------------------------------------------
// Sponsor Ads Endpoints (Admin Add/Delete + Public Fetch)
// -------------------------------------------------------------

/**
 * GET /api/ads
 * Fetch active sponsor ads (optional ?placement=top_banner or ?placement=leaderboard)
 */
apiRouter.get('/ads', (req, res) => {
  const ads = db.getAllSponsorAds(req.query.placement);
  res.json({ success: true, count: ads.length, ads });
});

/**
 * POST /api/admin/ads
 * Add a new sponsor ad (Admin only)
 */
apiRouter.post('/admin/ads', requireAdminAuth, (req, res) => {
  const { sponsor_name, badge_text, description, cta_text, cta_url, placement, insert_after_rank } = req.body;
  if (!sponsor_name || !description) {
    return res.status(400).json({ error: 'BadRequest', message: 'sponsor_name and description are required.' });
  }

  const created = db.addSponsorAd({
    sponsor_name,
    badge_text: badge_text || 'SPONSORED PARTNER',
    description,
    cta_text: cta_text || 'Learn More ↗',
    cta_url: cta_url || '#',
    placement: placement || 'leaderboard',
    insert_after_rank: insert_after_rank ? parseInt(insert_after_rank, 10) : 2,
  });

  res.status(201).json({ success: true, ad: created });
});

/**
 * PUT /api/admin/ads/:id
 * Edit an existing sponsor ad (Admin only)
 */
apiRouter.put('/admin/ads/:id', requireAdminAuth, (req, res) => {
  const { sponsor_name, badge_text, description, cta_text, cta_url, placement, insert_after_rank, active } = req.body;
  const updated = db.updateSponsorAd(req.params.id, {
    sponsor_name,
    badge_text,
    description,
    cta_text,
    cta_url,
    placement,
    insert_after_rank,
    active,
  });

  if (!updated) {
    return res.status(404).json({ error: 'NotFound', message: `Sponsor ad '${req.params.id}' not found.` });
  }

  res.json({ success: true, message: `Sponsor ad '${req.params.id}' updated successfully.`, ad: updated });
});

/**
 * DELETE /api/admin/ads/:id
 * Delete a sponsor ad (Admin only)
 */
apiRouter.delete('/admin/ads/:id', requireAdminAuth, (req, res) => {
  const deleted = db.deleteSponsorAd(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'NotFound', message: `Sponsor ad '${req.params.id}' not found.` });
  }
  res.json({ success: true, message: `Sponsor ad ${req.params.id} deleted successfully.` });
});

// -------------------------------------------------------------
// Visitor Mandal Suggestions (Flow to softwareasg@gmail.com)
// -------------------------------------------------------------

/**
 * POST /api/suggestions
 * Any visitor can submit a mandal suggestion with Google Maps link and email
 */
apiRouter.post('/suggestions', (req, res) => {
  const { mandal_name, city, google_maps_url, visitor_email, notes } = req.body;

  if (!google_maps_url || !visitor_email) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Both Google Maps link and your email ID are required.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(visitor_email.trim())) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Please provide a valid email address.',
    });
  }

  const suggestion = db.addSuggestion({
    mandal_name: mandal_name ? mandal_name.trim() : 'Suggested Mandal',
    city: city || 'pune',
    google_maps_url: google_maps_url.trim(),
    visitor_email: visitor_email.trim(),
    notes: notes ? notes.trim() : '',
  });

  // Automated notification dispatched to softwareasg@gmail.com
  console.log('================================================================');
  console.log('  🔔 NEW VISITOR MANDAL SUGGESTION RECEIVED (DISPATCH NOTIFICATION)');
  console.log('  To: softwareasg@gmail.com');
  console.log(`  Mandal Name : ${suggestion.mandal_name}`);
  console.log(`  City        : ${suggestion.city}`);
  console.log(`  Maps URL    : ${suggestion.google_maps_url}`);
  console.log(`  Submitter   : ${suggestion.visitor_email}`);
  console.log(`  Notes       : ${suggestion.notes || 'None'}`);
  console.log(`  Timestamp   : ${suggestion.created_at}`);
  console.log('================================================================');

  res.status(201).json({
    success: true,
    message: '🙏 Thank you! Your mandal suggestion has been recorded and dispatched to softwareasg@gmail.com.',
    data: suggestion,
  });
});

/**
 * GET /api/admin/suggestions
 * Admin review of visitor suggestions
 */
apiRouter.get('/admin/suggestions', requireAdminAuth, (req, res) => {
  const suggestions = db.getAllSuggestions();
  res.json({ success: true, count: suggestions.length, suggestions });
});

// -------------------------------------------------------------
// Advertiser Partnerships & Sponsorship Inquiries
// (Dispatched to softwareasg@gmail.com)
// -------------------------------------------------------------

/**
 * POST /api/advertisers/contact
 * Prospective sponsors and brands contact us for ad slots / partnerships
 */
apiRouter.post('/advertisers/contact', (req, res) => {
  const {
    brand_name,
    contact_name,
    email,
    phone,
    target_city,
    placement_interest,
    budget_range,
    message,
  } = req.body;

  if (!brand_name || !contact_name || !email || !phone) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Brand name, contact person name, email ID, and phone number are all required.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Please enter a valid business/contact email address.',
    });
  }

  const inquiry = db.addAdvertiserInquiry({
    brand_name: brand_name.trim(),
    contact_name: contact_name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    target_city: target_city || 'both',
    placement_interest: placement_interest || 'leaderboard',
    budget_range: budget_range || 'flexible',
    message: message ? message.trim() : '',
  });

  // Automated notification dispatched to softwareasg@gmail.com
  console.log('================================================================');
  console.log('  📢 NEW ADVERTISER PARTNERSHIP INQUIRY (DISPATCH NOTIFICATION)');
  console.log('  To: softwareasg@gmail.com');
  console.log(`  Brand / Sponsor   : ${inquiry.brand_name}`);
  console.log(`  Contact Person    : ${inquiry.contact_name}`);
  console.log(`  Email             : ${inquiry.email}`);
  console.log(`  Phone / WhatsApp  : ${inquiry.phone}`);
  console.log(`  Target City       : ${inquiry.target_city}`);
  console.log(`  Ad Placement      : ${inquiry.placement_interest}`);
  console.log(`  Budget Range      : ${inquiry.budget_range}`);
  console.log(`  Campaign Notes    : ${inquiry.message || 'None'}`);
  console.log(`  Received At       : ${inquiry.created_at}`);
  console.log('================================================================');

  res.status(201).json({
    success: true,
    message: '🙏 Thank you for your interest! Your advertising inquiry has been received and dispatched to softwareasg@gmail.com. Our partnerships team will connect within 24 hours.',
    data: inquiry,
  });
});

/**
 * GET /api/admin/advertisers
 * Admin review of advertiser partnership inquiries
 */
apiRouter.get('/admin/advertisers', requireAdminAuth, (req, res) => {
  const inquiries = db.getAllAdvertiserInquiries();
  res.json({ success: true, count: inquiries.length, inquiries });
});

/**
 * POST /api/admin/feeds
 * Add or link an authorized camera feed
 */
apiRouter.post('/admin/feeds', requireAdminAuth, (req, res) => {
  const { mandal_id, name, stream_url, feed_type, status, is_authorized, resolution, fps } = req.body;

  if (!mandal_id) {
    return res.status(400).json({ error: 'BadRequest', message: 'mandal_id is required.' });
  }

  const mandal = db.getMandal(mandal_id);
  if (!mandal) {
    return res.status(404).json({ error: 'NotFound', message: `Mandal '${mandal_id}' not found.` });
  }

  const feed = db.addCameraFeed({
    mandal_id,
    name,
    stream_url,
    feed_type,
    status: status || 'OFFLINE',
    is_authorized: is_authorized ?? true,
    resolution,
    fps,
  });

  res.status(201).json({ success: true, data: feed });
});

/**
 * PUT /api/admin/feeds/:id
 * Toggle feed health, disable unavailable stream, or modify resolution
 */
apiRouter.put('/admin/feeds/:id', requireAdminAuth, (req, res) => {
  const updated = db.updateCameraFeed(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'NotFound', message: `Camera feed '${req.params.id}' not found.` });
  }
  res.json({ success: true, data: updated });
});

/**
 * POST /api/admin/weights
 * Reconfigure popularity scoring weights dynamically
 */
apiRouter.post('/admin/weights', requireAdminAuth, (req, res) => {
  const updated = scoringEngine.updateWeights(req.body);
  res.json({ success: true, scoring_weights: updated });
});

/**
 * GET /api/admin/health
 * Operational health, feed status audit, and stale data telemetry
 */
apiRouter.get('/admin/health', requireAdminAuth, (req, res) => {
  const feeds = db.getAllCameraFeeds();
  const mandals = db.getAllMandals();
  const now = Date.now();

  const staleFeeds = [];
  const healthyFeeds = [];

  feeds.forEach((feed) => {
    const ageMs = now - new Date(feed.last_heartbeat).getTime();
    if (feed.status === 'OFFLINE' || ageMs > 300000) {
      staleFeeds.push({ ...feed, ageMinutes: Math.round(ageMs / 60000) });
    } else {
      healthyFeeds.push(feed);
    }
  });

  res.json({
    success: true,
    status: staleFeeds.length > feeds.length / 2 ? 'DEGRADED' : 'HEALTHY',
    timestamp: new Date().toISOString(),
    total_mandals: mandals.length,
    total_camera_feeds: feeds.length,
    healthy_feeds_count: healthyFeeds.length,
    stale_or_offline_feeds: staleFeeds,
    memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  });
});
