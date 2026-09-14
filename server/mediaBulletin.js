/**
 * Media & Radio RJ Press Bulletin Engine
 * 
 * Automatically synthesizes hourly crowd, wait time, and traffic data
 * into ready-to-broadcast Marathi & English news bulletins for radio RJs,
 * journalists, and digital newsrooms.
 */

import { db } from './db.js';
import { calculateDynamicCrowd } from './crowdModel.js';

export function generateHourlyBulletin(city = 'pune') {
  const cityObj = db.getCity(city);
  const mandals = (cityObj ? db.getMandalsByCity(cityObj.id) : null) || db.getMandalsByCity(city) || db.getAllMandals();
  const scoredMandals = mandals.map(m => {
    const dyn = calculateDynamicCrowd(m);
    const topRoadObj = dyn.top_roads?.[0] || m.top_roads?.[0];
    return {
      id: m.id,
      name: m.name,
      address: m.address,
      crowd_density: dyn.density_score ?? 35,
      estimated_wait_minutes: dyn.estimated_wait_minutes ?? 15,
      rush_category: dyn.rush_category || (dyn.density_score >= 85 ? 'Jam-Packed' : dyn.density_score >= 65 ? 'Full Rush' : dyn.density_score >= 45 ? 'Thoda Rush' : 'Khali'),
      rush_color: dyn.rush_color || (dyn.density_score >= 85 ? '#9333ea' : dyn.density_score >= 65 ? '#ef4444' : dyn.density_score >= 45 ? '#f59e0b' : '#10b981'),
      top_road: topRoadObj?.name || 'Main Corridor',
      top_road_speed: topRoadObj?.avg_speed || `${dyn.avg_speed_kmh || 24} km/h`,
      top_road_status: topRoadObj?.status || dyn.road_status || 'Normal Flow',
    };
  });

  // Sort by crowd
  const sortedByRush = [...scoredMandals].sort((a, b) => b.crowd_density - a.crowd_density);
  const highestRush = sortedByRush.slice(0, 3);
  const lowestWait = [...scoredMandals].sort((a, b) => a.estimated_wait_minutes - b.estimated_wait_minutes).slice(0, 3);

  const now = new Date();
  const timeFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const istTimeStr = timeFormatter.format(now);

  const cityName = city.toLowerCase().includes('mumbai') ? 'मुंबई' : 'पुणे';
  const cityUpper = city.toUpperCase();

  // Ready-to-broadcast radio RJ scripts
  const rushListMr = highestRush.map(m => `${m.name} (${m.crowd_density}% गर्दी, रांग ~${m.estimated_wait_minutes} मि., रस्ता: ${m.top_road})`).join('; ');
  const goldenListMr = lowestWait.map(m => `${m.name} (केवळ ~${m.estimated_wait_minutes} मि.)`).join(', ');

  const rushListEn = highestRush.map(m => `${m.name} (${m.crowd_density}% rush, ~${m.estimated_wait_minutes}m wait via ${m.top_road})`).join('; ');
  const goldenListEn = lowestWait.map(m => `${m.name} (~${m.estimated_wait_minutes}m queue)`).join(', ');

  const radioScriptMr = `📻 गणेश दर्शन बुलेटिन (${istTimeStr}): ${cityName} शहरातील प्रमुख गणपती मंडळांमध्ये थेट गर्दीची स्थिती: ` +
    `${rushListMr}. भाविक, ज्येष्ठ नागरिक व कुटुंबांसाठी सुवर्ण दर्शन संधी (कमीत कमी प्रतीक्षा): ${goldenListMr}. ` +
    `रस्त्यांवरील वाहतूक व थेट दर्शन रांग पाहण्यासाठी ganeshmandal.in ला भेट द्या.`;

  const radioScriptEn = `📻 Ganesh Darshan Bulletin (${istTimeStr}): Live telemetry across ${cityUpper}: ` +
    `High density at ${rushListEn}. Devotee Golden Window (fastest darshan queue): ${goldenListEn}. ` +
    `Check live approach corridor speeds and queue wait times at ganeshmandal.in.`;

  return {
    success: true,
    city,
    timestamp: now.toISOString(),
    ist_time: istTimeStr,
    headline_mr: `${cityName} गणेशोत्सव थेट गर्दी बुलेटिन — ${istTimeStr}`,
    headline_en: `${cityUpper} Ganeshotsav Live Crowd & Wait Time Bulletin — ${istTimeStr}`,
    radio_script_mr: radioScriptMr,
    radio_script_en: radioScriptEn,
    highest_rush_mandals: highestRush,
    golden_window_mandals: lowestWait,
    all_mandals_count: scoredMandals.length,
    source: 'https://ganeshmandal.in',
    attribution: 'Verified Telemetry via GaneshMandal.in Devotee Intelligence'
  };
}
