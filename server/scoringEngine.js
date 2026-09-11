/**
 * Configurable Popularity & Experience Scoring Engine
 *
 * Implements:
 * - Dynamic crowd scoring
 * - Multi-signal weighted popularity scoring
 * - Composite experience scoring ("worth visiting right now")
 * - Exponential time decay on signals
 * - Outlier protection and signal normalization
 * - Real-time leaderboard ranking with trend calculation (↑, ↓, =)
 */

import { calculateDynamicCrowd } from './crowdModel.js';

export class ScoringEngine {
  constructor(weights = {}) {
    this.weights = {
      crowdActivity: 0.35,
      visitorInterest: 0.20,
      socialMedia: 0.15,
      searchViews: 0.10,
      historicalPopularity: 0.10,
      liveVisualActivity: 0.10,
      decayHalfLifeHours: 4.0, // Exponential decay half-life
      ...weights,
    };
    this.normalizeWeights();
  }

  updateWeights(newWeights) {
    this.weights = {
      ...this.weights,
      ...newWeights,
    };
    this.normalizeWeights();
    return this.weights;
  }

  getWeights() {
    return { ...this.weights };
  }

  normalizeWeights() {
    const sum =
      this.weights.crowdActivity +
      this.weights.visitorInterest +
      this.weights.socialMedia +
      this.weights.searchViews +
      this.weights.historicalPopularity +
      this.weights.liveVisualActivity;

    if (sum > 0) {
      this.normalizedWeights = {
        crowdActivity: this.weights.crowdActivity / sum,
        visitorInterest: this.weights.visitorInterest / sum,
        socialMedia: this.weights.socialMedia / sum,
        searchViews: this.weights.searchViews / sum,
        historicalPopularity: this.weights.historicalPopularity / sum,
        liveVisualActivity: this.weights.liveVisualActivity / sum,
      };
    } else {
      this.normalizedWeights = {
        crowdActivity: 0.35,
        visitorInterest: 0.20,
        socialMedia: 0.15,
        searchViews: 0.10,
        historicalPopularity: 0.10,
        liveVisualActivity: 0.10,
      };
    }
  }

  /**
   * Apply exponential time decay to stale signal values
   * Formula: V(t) = V0 * (0.5)^(delta_t / half_life)
   */
  applyTimeDecay(val, timestamp) {
    if (!timestamp) return val;
    const now = Date.now();
    const obsTime = new Date(timestamp).getTime();
    const elapsedHours = Math.max(0, (now - obsTime) / (1000 * 60 * 60));
    const halfLife = this.weights.decayHalfLifeHours || 4.0;
    const factor = Math.pow(0.5, elapsedHours / halfLife);
    return val * factor;
  }

  /**
   * Clamp and soft-saturate noisy inputs to [0, 100]
   */
  normalizeSignal(val, min = 0, max = 100) {
    if (val === undefined || val === null || isNaN(val)) return 50;
    const clamped = Math.min(max, Math.max(min, Number(val)));
    return ((clamped - min) / (max - min)) * 100;
  }

  /**
   * Calculate Crowd Score (0 - 100%)
   * Distinguishes physical crowd saturation from overall popularity.
   */
  calculateCrowdScore(crowdObservation) {
    if (!crowdObservation) return 50;
    const density = this.normalizeSignal(crowdObservation.density_score);
    const queue = this.normalizeSignal(crowdObservation.queue_score);
    const activity = this.normalizeSignal(crowdObservation.activity_score);

    // Weighted blend: 60% density, 25% queue length, 15% physical movement
    const rawCrowd = density * 0.6 + queue * 0.25 + activity * 0.15;
    return Math.round(Math.min(100, Math.max(0, rawCrowd)));
  }

  /**
   * Calculate Popularity Score based on transparent multi-signal weighting
   */
  calculatePopularityScore(mandal, crowdObservation, stageObservation, additionalSignals = {}) {
    const nw = this.normalizedWeights;

    // Signal 1: Current Crowd & Physical Activity
    const crowdRaw = crowdObservation ? crowdObservation.activity_score * 0.5 + crowdObservation.density_score * 0.5 : 50;
    const sCrowd = this.applyTimeDecay(this.normalizeSignal(crowdRaw), crowdObservation?.timestamp);

    // Signal 2: Recent Visitor Interest / Check-ins
    const visitorRaw = additionalSignals.visitorInterest ?? (mandal.is_famous ? 88 : 65);
    const sVisitor = this.applyTimeDecay(this.normalizeSignal(visitorRaw), additionalSignals.visitorTimestamp);

    // Signal 3: Social Media & Public Engagement
    const socialRaw = additionalSignals.socialMedia ?? (mandal.is_famous ? 92 : 60);
    const sSocial = this.applyTimeDecay(this.normalizeSignal(socialRaw), additionalSignals.socialTimestamp);

    // Signal 4: Search & Mandal Page Views
    const searchRaw = additionalSignals.searchViews ?? (mandal.is_famous ? 85 : 55);
    const sSearch = this.normalizeSignal(searchRaw);

    // Signal 5: Historical Festival Baseline
    const historicalRaw = additionalSignals.historicalPopularity ?? (mandal.is_famous ? 95 : 70);
    const sHistorical = this.normalizeSignal(historicalRaw);

    // Signal 6: Live Visual Activity (decorations, moving props, lighting, stage pooja)
    let visualRaw = 50;
    if (stageObservation) {
      let stagePoints = 40;
      if (stageObservation.idol_detected) stagePoints += 25;
      if (stageObservation.mechanical_prop_detected) stagePoints += 15;
      if (stageObservation.led_display_detected) stagePoints += 10;
      if (stageObservation.moving_objects_count > 0) stagePoints += 10;
      visualRaw = Math.min(100, stagePoints);
    }
    const sVisual = this.applyTimeDecay(visualRaw, stageObservation?.timestamp);

    // Composite Popularity
    const popularity =
      sCrowd * nw.crowdActivity +
      sVisitor * nw.visitorInterest +
      sSocial * nw.socialMedia +
      sSearch * nw.searchViews +
      sHistorical * nw.historicalPopularity +
      sVisual * nw.liveVisualActivity;

    return {
      popularityScore: Math.round(Math.min(100, Math.max(0, popularity))),
      signals: {
        crowdActivity: Math.round(sCrowd),
        visitorInterest: Math.round(sVisitor),
        socialMedia: Math.round(sSocial),
        searchViews: Math.round(sSearch),
        historicalPopularity: Math.round(sHistorical),
        liveVisualActivity: Math.round(sVisual),
      },
    };
  }

  /**
   * Experience Score:
   * "Is this mandal worth visiting right now?"
   * High popularity + active/beautiful stage + manageable wait = high experience score!
   * Extreme crowd bottleneck (>95% crowd & 3-hour wait) degrades visitor experience.
   */
  calculateExperienceScore(popularityScore, crowdScore, stageObservation, estimatedWaitMins = 0) {
    let stageBoost = 0;
    if (stageObservation) {
      if (stageObservation.mechanical_prop_detected) stageBoost += 15;
      if (stageObservation.led_display_detected) stageBoost += 10;
      if (stageObservation.lighting_effects?.includes('Hyper-bright')) stageBoost += 10;
    }

    // Penalize long queue times gracefully
    let queuePenalty = 0;
    if (estimatedWaitMins > 120) queuePenalty = 30;
    else if (estimatedWaitMins > 60) queuePenalty = 18;
    else if (estimatedWaitMins > 30) queuePenalty = 8;

    // Sweet spot: popularity provides 40%, stage quality provides 30%, comfortable density provides 30%
    const comfortScore = Math.max(0, 100 - crowdScore * 0.6 - queuePenalty);
    const stageQuality = Math.min(100, 60 + stageBoost);

    const experience = popularityScore * 0.40 + stageQuality * 0.30 + comfortScore * 0.30;
    return Math.round(Math.min(100, Math.max(10, experience)));
  }

  /**
   * Compute full rankings for a city's mandals and determine trend arrows
   */
  rankCityMandals(db, cityId) {
    const mandals = db.getMandalsByCity(cityId);
    if (!mandals.length) return [];

    const scored = mandals.map((mandal) => {
      const dynamicCrowd = calculateDynamicCrowd(mandal);
      const latestStage = db.getLatestStageObservation(mandal.id);
      const existingScore = db.getPopularityScore(mandal.id);

      const crowdScore = this.calculateCrowdScore(dynamicCrowd);
      const { popularityScore, signals } = this.calculatePopularityScore(mandal, dynamicCrowd, latestStage);
      const waitMins = dynamicCrowd.estimated_wait_minutes;
      const experienceScore = this.calculateExperienceScore(popularityScore, crowdScore, latestStage, waitMins);

      return {
        mandal,
        crowdScore,
        popularityScore,
        experienceScore,
        estimatedWaitMins: waitMins,
        latestCrowd: dynamicCrowd,
        latestStage,
        previousRank: existingScore?.current_rank || 0,
        signals,
        dataQuality: dynamicCrowd.data_quality,
      };
    });

    // Sort descending by Popularity Score (tiebreak by Experience Score, then name)
    scored.sort((a, b) => {
      if (b.popularityScore !== a.popularityScore) {
        return b.popularityScore - a.popularityScore;
      }
      if (b.experienceScore !== a.experienceScore) {
        return b.experienceScore - a.experienceScore;
      }
      return a.mandal.name.localeCompare(b.mandal.name);
    });

    // Assign current rank and compute rank change & trend
    const rankedRecords = scored.map((item, index) => {
      const currentRank = index + 1;
      const previousRank = item.previousRank > 0 ? item.previousRank : currentRank;
      const rankDelta = previousRank - currentRank; // positive means moved up (e.g. was 3, now 1 -> +2)

      let trend = 'stable';
      if (rankDelta > 0) trend = 'up';
      else if (rankDelta < 0) trend = 'down';

      const scoreRecord = {
        mandal_id: item.mandal.id,
        popularity_score: item.popularityScore,
        crowd_score: item.crowdScore,
        experience_score: item.experienceScore,
        current_rank: currentRank,
        previous_rank: previousRank,
        rank_change: rankDelta,
        trend,
        signals: item.signals,
        confidence: item.latestCrowd?.confidence || 0.90,
        last_updated: new Date().toISOString(),
        data_quality: item.dataQuality,
      };

      db.setPopularityScore(item.mandal.id, scoreRecord);

      return {
        ...item,
        currentRank,
        rankDelta,
        trend,
        scoreRecord,
      };
    });

    return rankedRecords;
  }
}

export const scoringEngine = new ScoringEngine();
