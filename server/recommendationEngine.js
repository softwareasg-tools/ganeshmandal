/**
 * Smart Recommendation Engine for Ganpati Mandals
 *
 * Implements recommendation criteria:
 * - "least crowded"
 * - "most popular"
 * - "best decorations"
 * - "most active right now"
 * - "near me"
 * - "family friendly"
 * - "shortest estimated wait"
 * - "best overall experience"
 */

export class RecommendationEngine {
  /**
   * Haversine distance in kilometers
   */
  calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  getRecommendations(db, cityId, criterion = 'best_experience', userLocation = null) {
    const mandals = db.getMandalsByCity(cityId);
    if (!mandals.length) return [];

    const enriched = mandals.map((mandal) => {
      const crowd = db.getLatestCrowdObservation(mandal.id);
      const stage = db.getLatestStageObservation(mandal.id);
      const score = db.getPopularityScore(mandal.id);

      const distanceKm = userLocation
        ? this.calculateDistanceKm(userLocation.lat, userLocation.lng, mandal.latitude, mandal.longitude)
        : null;

      const waitMins = crowd?.estimated_wait_minutes || 20;
      const density = crowd?.density_score || 50;
      const popularity = score?.popularity_score || 60;
      const experience = score?.experience_score || 70;
      const activity = crowd?.activity_score || 60;

      return {
        mandal,
        crowd,
        stage,
        score,
        metrics: {
          popularity,
          density,
          experience,
          activity,
          waitMinutes: waitMins,
          distanceKm,
        },
      };
    });

    let sorted = [...enriched];
    let badgeText = '';

    switch (criterion) {
      case 'least_crowded':
        sorted.sort((a, b) => a.metrics.density - b.metrics.density || a.metrics.waitMinutes - b.metrics.waitMinutes);
        badgeText = 'Lowest Crowd Density';
        break;

      case 'most_popular':
        sorted.sort((a, b) => b.metrics.popularity - a.metrics.popularity);
        badgeText = 'Top Trending Mandal';
        break;

      case 'best_decorations':
        sorted.sort((a, b) => {
          const aProp = (a.stage?.mechanical_prop_detected ? 20 : 0) + (a.mandal.tags?.includes('Temple Replica') ? 15 : 0);
          const bProp = (b.stage?.mechanical_prop_detected ? 20 : 0) + (b.mandal.tags?.includes('Temple Replica') ? 15 : 0);
          return bProp + b.metrics.popularity * 0.5 - (aProp + a.metrics.popularity * 0.5);
        });
        badgeText = 'Spectacular Sets & Idols';
        break;

      case 'most_active':
        sorted.sort((a, b) => b.metrics.activity - a.metrics.activity || b.metrics.popularity - a.metrics.popularity);
        badgeText = 'High Energy & Live Aarti';
        break;

      case 'near_me':
        if (userLocation) {
          sorted.sort((a, b) => (a.metrics.distanceKm || 999) - (b.metrics.distanceKm || 999));
          badgeText = 'Nearest to Your Location';
        } else {
          sorted.sort((a, b) => b.metrics.experience - a.metrics.experience);
          badgeText = 'Optimal Location';
        }
        break;

      case 'family_friendly':
        // Filter out extreme wait queues (>60 mins) and prioritize comfort
        sorted.sort((a, b) => {
          const aPenalty = a.metrics.waitMinutes > 45 ? 50 : a.metrics.waitMinutes;
          const bPenalty = b.metrics.waitMinutes > 45 ? 50 : b.metrics.waitMinutes;
          return aPenalty - bPenalty || b.metrics.experience - a.metrics.experience;
        });
        badgeText = 'Comfortable Queue & Spacious Mandap';
        break;

      case 'shortest_wait':
        sorted.sort((a, b) => a.metrics.waitMinutes - b.metrics.waitMinutes);
        badgeText = 'Shortest Queue Time';
        break;

      case 'best_experience':
      default:
        sorted.sort((a, b) => b.metrics.experience - a.metrics.experience);
        badgeText = 'Best Overall Experience Right Now';
        break;
    }

    return sorted.slice(0, 6).map((item, idx) => {
      const wait = item.metrics.waitMinutes;
      let crowdStatus = 'Low';
      if (item.metrics.density > 80) crowdStatus = 'Heavy';
      else if (item.metrics.density > 55) crowdStatus = 'Moderate';

      let reason = '';
      if (criterion === 'least_crowded') reason = `Only ${item.metrics.density}% crowd saturation with ${wait} min wait.`;
      else if (criterion === 'shortest_wait') reason = `Quick entry: ~${wait} minutes estimated wait.`;
      else if (criterion === 'best_decorations') reason = 'Elaborate mythological theme sets and moving mechanical displays.';
      else if (criterion === 'most_popular') reason = `Ranked #${item.score?.current_rank || idx + 1} with ${item.metrics.popularity} popularity score.`;
      else if (criterion === 'family_friendly') reason = `Calm walking pace, good devotee facilities, and manageable wait of ${wait} mins.`;
      else reason = `Optimal blend: ${item.metrics.popularity} popularity, ${crowdStatus.toLowerCase()} crowd, and active stage darshan.`;

      return {
        mandal_id: item.mandal.id,
        name: item.mandal.name,
        slug: item.mandal.slug,
        address: item.mandal.address,
        rank: item.score?.current_rank || idx + 1,
        popularity_score: item.metrics.popularity,
        crowd_density: item.metrics.density,
        crowd_status: crowdStatus,
        experience_score: item.metrics.experience,
        estimated_wait_minutes: wait,
        stage_activity: item.metrics.activity > 80 ? 'High' : 'Moderate',
        distance_km: item.metrics.distanceKm,
        recommendation_badge: badgeText,
        reason,
        has_live_feed: Boolean(item.mandal.is_famous),
      };
    });
  }
}

export const recommendationEngine = new RecommendationEngine();
