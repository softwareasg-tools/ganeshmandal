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
  const mandals = db.getMandalsByCity(city) || db.getAllMandals();
  const scoredMandals = mandals.map(m => {
    const dyn = calculateDynamicCrowd(m);
    return {
      id: m.id,
      name: m.name,
      address: m.address,
      crowd_density: dyn.crowd_density ?? m.crowd_density ?? 35,
      estimated_wait_minutes: dyn.estimated_wait_minutes ?? m.estimated_wait_minutes ?? 15,
      top_road: m.top_roads?.[0]?.name || 'Main Corridor',
      top_road_speed: m.top_roads?.[0]?.avg_speed || '24 km/h',
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

  const cityUpper = city.toUpperCase();

  // Ready-to-broadcast radio RJ scripts
  const radioScriptMr = `📻 गणेश दर्शन बुलेटिन (${istTimeStr}): ${cityUpper === 'PUNE' ? 'पुण्यातील' : 'मुंबईतील'} प्रमुख गणपती मंडळांमध्ये सध्याचे गर्दी अपडेट: ` +
    highestRush.map(m => `${m.name} येथे गर्दी ${m.crowd_density}% असून प्रतीक्षा वेळ ~${m.estimated_wait_minutes} मिनिटे आहे`).join('; ') +
    `. भाविकांसाठी सुवर्ण दर्शन संधी: ${lowestWait[0]?.name} येथे प्रतीक्षा वेळ केवळ ${lowestWait[0]?.estimated_wait_minutes} मिनिटे आहे. अधिक लाईव्ह अपडेट्ससाठी ganeshmandal.in तपासा.`;

  const radioScriptEn = `📻 Ganesh Darshan Bulletin (${istTimeStr}): Live telemetry across ${cityUpper}: ` +
    highestRush.map(m => `${m.name} reporting ${m.crowd_density}% rush with ~${m.estimated_wait_minutes} min queue`).join('; ') +
    `. Golden window: ${lowestWait[0]?.name} wait time is only ~${lowestWait[0]?.estimated_wait_minutes} mins. Full telemetry at ganeshmandal.in.`;

  return {
    success: true,
    city,
    timestamp: now.toISOString(),
    ist_time: istTimeStr,
    headline_mr: `${cityUpper} गणेशोत्सव थेट गर्दी बुलेटिन — ${istTimeStr}`,
    headline_en: `${cityUpper} Ganeshotsav Live Crowd & Wait Time Bulletin — ${istTimeStr}`,
    radio_script_mr: radioScriptMr,
    radio_script_en: radioScriptEn,
    highest_rush_mandals: highestRush,
    golden_window_mandals: lowestWait,
    source: 'https://ganeshmandal.in',
    attribution: 'Verified Telemetry via GaneshMandal.in Devotee Intelligence'
  };
}
