/**
 * Front-end Application Controller for Ganpati Festival Intelligence Platform
 *
 * Theme & Features:
 * - Devotional Warmth & Spiritual Minimalism (No confusing geometric wireframes)
 * - Authentic Verified Darshan Idol & Temple Photography
 * - Live Verified Darshan Road Traffic & Approach Navigation
 * - Strictly Last 5 Devotee Social Snaps & Reels in Latest Order
 * - Mobile-First Responsive Architecture with Sticky Bottom Nav
 * - Tasteful Ad-Friendly Monetization Slots (Devotional Partners)
 * - Top Navigation Live Feed Sync with Feedback Animation
 * - Privacy-Preserving Crowd Telemetry & 24-Hour Analytics
 */

const CITY_COORDS = {
  pune: { lat: 18.5167, lng: 73.8562, zoom: 14, name: 'Pune' },
  mumbai: { lat: 18.9904, lng: 72.8369, zoom: 13, name: 'Mumbai' },
};

class FestivalApp {
  constructor() {
    this.currentCity = 'pune';
    this.mandals = [];
    this.selectedMandal = null;
    this.heatmapVisible = true;
    this.filters = { quickOnly: false, famousOnly: false, manacheOnly: false, search: '' };
    this.map = null;
    this.markerLayerGroup = null;
    this.heatLayer = null;
    this.currentTileMode = 'dark';
    this.darkTileLayer = null;
    this.satelliteTileLayer = null;
    this.ws = null;

    // First-Person Devotee Eye-Level State
    this.povMandal = null;
    this.povAngle = 'sanctum';
    this.darshanZoomIndex = 0;
    this.darshanZooms = [
      { class: 'zoom-1x', label: '1.0x' },
      { class: 'zoom-1-5x', label: '1.5x' },
      { class: 'zoom-2x', label: '2.0x' },
    ];

    // Temple Aarti & Bells Audio State
    this.audioPlaying = false;
    this.audioTimer = null;
    this.audioCtx = null;

    // Live Rush & Devotee Guidance State
    this.rushIntel = null;

    // Admin & Sponsor Ads State
    this.adminToken = sessionStorage.getItem('asg_admin_token') || null;
    this.sponsorAds = [];

    this.init();
  }

  async init() {
    // 0. Auto Geo-IP Detection: If visitor arrives from Mumbai, default to Mumbai tab first
    try {
      const savedCity = localStorage.getItem('gm_preferred_city');
      if (savedCity === 'mumbai' || savedCity === 'pune') {
        this.currentCity = savedCity;
      } else {
        const geoRes = await fetch('/api/geo/detect-city');
        if (geoRes.ok) {
          const geoJson = await geoRes.json();
          if (geoJson.detected_city === 'mumbai') {
            this.currentCity = 'mumbai';
          }
        }
      }
    } catch (_) {}

    // Update active city switcher tab UI
    const puneBtn = document.getElementById('btn-city-pune');
    const mumbaiBtn = document.getElementById('btn-city-mumbai');
    if (this.currentCity === 'mumbai') {
      if (puneBtn) puneBtn.classList.remove('active');
      if (mumbaiBtn) mumbaiBtn.classList.add('active');
    } else {
      if (mumbaiBtn) mumbaiBtn.classList.remove('active');
      if (puneBtn) puneBtn.classList.add('active');
    }

    const taglineEl = document.getElementById('brand-tagline');
    if (taglineEl) {
      taglineEl.textContent = this.currentCity === 'pune'
        ? "Pune's most popular ganesh mandal's website"
        : "Mumbai's most popular ganesh mandal's website";
    }
    this.initMap();
    this.bindEvents();
    this.bindMobileNavigation();
    this.bindPullToRefresh();
    this.bindPOVControls();
    this.bindAdminControls();
    this.bindSuggestControls();
    this.trackPageView();
    this.connectWebSocket();
    await Promise.all([
      this.loadCityData(this.currentCity),
      this.loadSponsorAds(),
    ]);
    this.fetchWeather(this.currentCity);
    this.initVisitorCounter();

    // Auto-open mandal if user arrived via WhatsApp forward or deep-link
    const targetMandalId = window._INITIAL_MANDAL_ID || new URLSearchParams(window.location.search).get('mandal');
    if (targetMandalId) {
      setTimeout(() => {
        this.openPOVModal(targetMandalId, 'crowd');
      }, 400);
    }

    // Register Service Worker for anonymous golden window alerts
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }

  // -------------------------------------------------------------
  // Map Initialization & Rendering
  // -------------------------------------------------------------
  initMap() {
    const defaultCoords = CITY_COORDS[this.currentCity];
    this.map = L.map('festival-map', {
      center: [defaultCoords.lat, defaultCoords.lng],
      zoom: defaultCoords.zoom,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // Tactical Dark OpenStreetMap Tiles with CSS Inverter
    this.darkTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      className: 'dark-tactical-tile',
      maxZoom: 19,
    }).addTo(this.map);

    // High-Resolution Satellite Tiles (Esri World Imagery)
    this.satelliteTileLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; Esri, Maxar, Earthstar Geographics',
        maxZoom: 19,
      }
    );

    this.markerLayerGroup = L.layerGroup().addTo(this.map);
  }

  toggleMapTileMode() {
    const btn = document.getElementById('btn-toggle-tiles');
    if (this.currentTileMode === 'dark') {
      this.map.removeLayer(this.darkTileLayer);
      this.satelliteTileLayer.addTo(this.map);
      this.currentTileMode = 'satellite';
      if (btn) btn.querySelector('span').textContent = '🗺️ Dark Map View';
    } else {
      this.map.removeLayer(this.satelliteTileLayer);
      this.darkTileLayer.addTo(this.map);
      this.currentTileMode = 'dark';
      if (btn) btn.querySelector('span').textContent = '🗺️ Satellite View';
    }
  }

  safeMapFlyTo(lat, lng, zoom, duration = 1.0) {
    if (!this.map) return;
    try {
      const mapEl = document.getElementById('festival-map');
      if (mapEl && mapEl.offsetWidth > 0 && mapEl.offsetHeight > 0) {
        this.map.flyTo([lat, lng], zoom, { duration });
      } else {
        // Map container is hidden on mobile rankings scroll.
        // Store target coords safely without calling Leaflet methods on hidden DOM.
        this._pendingMapCenter = { lat, lng, zoom };
      }
    } catch (err) {
      console.warn('[Map] safeMapFlyTo bypassed map error:', err);
    }
  }

  async loadCityData(citySlug) {
    try {
      const res = await fetch(`/api/cities/${citySlug}/mandals`);
      const data = await res.json();
      if (data.success) {
        this.mandals = data.data;
        this.renderMapMarkers();
        this.renderLeaderboard();
        this.renderMobileMapCarousel();
        this.updateCityStats();
      }
      this.refreshHeatmap(citySlug);
    } catch (err) {
      console.error('[App] Failed to load city data:', err);
    }
  }

  async refreshHeatmap(citySlug) {
    try {
      const res = await fetch(`/api/heatmap/${citySlug}`);
      const data = await res.json();
      if (!data.success || !window.L || !window.L.heatLayer) return;

      if (this.heatLayer) {
        this.map.removeLayer(this.heatLayer);
        this.heatLayer = null;
      }

      if (!this.heatmapVisible) return;

      const heatPoints = data.points.map((p) => [p.lat, p.lng, p.intensity]);
      this.heatLayer = L.heatLayer(heatPoints, {
        radius: 35,
        blur: 24,
        maxZoom: 17,
        gradient: {
          0.2: '#10b981',
          0.45: '#f59e0b',
          0.70: '#dc2626',
          0.90: '#9333ea',
        },
      }).addTo(this.map);
    } catch (err) {
      console.error('[App] Failed to load heatmap:', err);
    }
  }

  isManacheMandal(m) {
    if (!m) return false;
    if (m.is_manache === true || m.is_manache_5 === true) return true;
    const manacheIds = [
      'mandal_pune_kasba',
      'mandal_pune_tambdi',
      'mandal_pune_guruji',
      'mandal_pune_tulshibaug',
      'mandal_pune_kesariwada'
    ];
    if (manacheIds.includes(m.id)) return true;
    if (Array.isArray(m.tags) && m.tags.some((t) => /manache/i.test(t))) return true;
    if (m.name && /manache/i.test(m.name)) return true;
    return false;
  }

  renderMapMarkers() {
    this.markerLayerGroup.clearLayers();

    const filtered = this.mandals.filter((m) => {
      if (this.filters.quickOnly && (m.crowd_density >= 45 && (m.estimated_wait_minutes || 25) > 20)) return false;
      if (this.filters.famousOnly && !m.is_famous) return false;
      if (this.filters.manacheOnly && !this.isManacheMandal(m)) return false;
      if (this.filters.search) {
        const query = this.filters.search.toLowerCase();
        return (
          m.name.toLowerCase().includes(query) ||
          m.address.toLowerCase().includes(query) ||
          (m.tags && m.tags.some((t) => t.toLowerCase().includes(query)))
        );
      }
      return true;
    });

    // Auto-fit bounds if filtering specifically to Manache 5 so all 5 are in view
    if (this.filters.manacheOnly && filtered.length > 0 && this.map) {
      try {
        const bounds = L.latLngBounds(filtered.map((m) => [m.latitude, m.longitude]));
        this.map.fitBounds(bounds.pad(0.35), { maxZoom: 16 });
      } catch (_) {}
    }

    filtered.forEach((mandal) => {
      const density = mandal.crowd_density ?? 15;
      const isFamous = mandal.is_famous;

      let statusClass = 'status-khali';
      let statusColor = '#10b981';
      if (density >= 85) {
        statusClass = 'status-jam-packed';
        statusColor = '#9333ea';
      } else if (density >= 65) {
        statusClass = 'status-full-rush';
        statusColor = '#ef4444';
      } else if (density >= 45) {
        statusClass = 'status-thoda-rush';
        statusColor = '#f59e0b';
      } else {
        statusClass = 'status-khali';
        statusColor = '#10b981';
      }

      const roads = mandal.top_roads || [];
      const entryRoad = roads[0];
      const roadSpeed = entryRoad?.avg_speed || (mandal.avg_speed_kmh ? `${mandal.avg_speed_kmh} km/h` : '24 km/h');
      const roadNameShort = entryRoad?.name ? entryRoad.name.split('(')[0].trim() : 'Approach Corridor';
      const roadStatusText = entryRoad?.status || mandal.road_status || 'Live movement';

      const customIcon = L.divIcon({
        className: 'custom-mandal-marker',
        html: `
          <div class="marker-beacon-wrap ${statusClass}">
            <div class="marker-pulse-ring" style="border-color: ${statusColor}; box-shadow: 0 0 14px ${statusColor}88;"></div>
            <div class="marker-core ${isFamous ? 'famous' : ''}" style="border-color: ${statusColor};" title="${mandal.name}">
              🪔
            </div>
            <div class="marker-rank-badge" style="background: ${statusColor};">#${mandal.current_rank || '-'}</div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([mandal.latitude, mandal.longitude], { icon: customIcon });

      // Devotional & Action-Oriented Popup
      const popupHtml = `
        <div style="font-family:var(--font-sans); font-size:12px; color:var(--text-main); background:#171512; padding:12px; border-radius:10px; border:1px solid rgba(245,158,11,0.4); min-width:240px; box-shadow:0 8px 24px rgba(0,0,0,0.7);">
          <div style="font-weight:700; color:var(--text-cream); font-size:13px; margin-bottom:4px;">${mandal.name}</div>
          <div style="color:var(--text-muted); font-size:11px; margin-bottom:8px;">${mandal.address}</div>
          <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-family:var(--font-mono); font-size:11px;">
            <span>Rush: <strong style="color:${statusColor};">${density}%</strong> (${mandal.rush_category || 'Active'})</span>
            <span>Wait: <strong style="color:var(--accent-saffron);">~${mandal.estimated_wait_minutes || 15} min</strong></span>
          </div>
          <div style="margin-bottom:10px; padding:6px 9px; border-radius:6px; background:rgba(255,255,255,0.04); border:1px solid ${statusColor}40; font-size:11px;">
            <div style="color:${statusColor}; font-weight:700;">🚗 Corridor: ${roadNameShort} (${roadSpeed})</div>
            <div style="color:var(--text-dim); font-size:10px; margin-top:2px;">${roadStatusText}</div>
          </div>
          <button id="pop-btn-pov-${mandal.id}" style="width:100%; background:linear-gradient(135deg,#c2410c,#ea580c); color:#fff; font-weight:700; border:none; padding:7px 10px; border-radius:4px; cursor:pointer; font-size:11px; display:flex; align-items:center; justify-content:center; gap:6px; margin-bottom:5px; box-shadow:0 0 12px rgba(234,88,12,0.4);">
            <span>👁️ Stand in Front of Bappa</span>
          </button>
          <button id="pop-btn-traffic-${mandal.id}" style="width:100%; background:rgba(245,158,11,0.15); color:var(--accent-gold); border:1px solid rgba(245,158,11,0.35); padding:5px 10px; border-radius:4px; cursor:pointer; font-size:11px; margin-bottom:5px;">
            <span>🚦 Check Road Traffic</span>
          </button>
          <button id="pop-btn-intel-${mandal.id}" style="width:100%; background:rgba(255,255,255,0.06); color:var(--text-muted); border:1px solid var(--border-subtle); padding:4px 10px; border-radius:4px; cursor:pointer; font-size:10px;">
            <span>ℹ️ Mandal History & Darshan Timings</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { offset: [0, -14], closeButton: true });

      marker.on('popupopen', () => {
        const btnPov = document.getElementById(`pop-btn-pov-${mandal.id}`);
        const btnTraffic = document.getElementById(`pop-btn-traffic-${mandal.id}`);
        const btnIntel = document.getElementById(`pop-btn-intel-${mandal.id}`);

        if (btnPov) {
          btnPov.addEventListener('click', () => {
            this.map.closePopup();
            this.openPOVModal(mandal.id, 'crowd');
          });
        }
        if (btnTraffic) {
          btnTraffic.addEventListener('click', () => {
            this.map.closePopup();
            this.openPOVModal(mandal.id, 'traffic');
          });
        }
        if (btnIntel) {
          btnIntel.addEventListener('click', () => {
            this.map.closePopup();
            this.openPOVModal(mandal.id, 'crowd');
          });
        }
      });

      marker.on('click', () => {
        const carouselCard = document.getElementById(`carousel-card-${mandal.id}`);
        if (carouselCard) {
          document.querySelectorAll('.carousel-mandal-card').forEach((c) => c.classList.remove('active-card'));
          carouselCard.classList.add('active-card');
          carouselCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });

      this.markerLayerGroup.addLayer(marker);
    });
  }

  updateCityStats() {
    const cityNameEl = document.getElementById('stat-city-name');
    const totalEl = document.getElementById('stat-total-mandals');
    const avgDensityEl = document.getElementById('stat-avg-density');
    const peekCountEl = document.getElementById('sheet-peek-count');

    if (cityNameEl) cityNameEl.textContent = this.currentCity === 'pune' ? 'Pune' : 'Mumbai';
    if (totalEl) totalEl.textContent = filtered.length;
    if (peekCountEl) peekCountEl.textContent = `${filtered.length} Mandals`;

    this.renderMobileMapCarousel(null, filtered);

    if (this.mandals.length && avgDensityEl) {
      const avg = Math.round(this.mandals.reduce((sum, m) => sum + (m.crowd_density || 0), 0) / this.mandals.length);
      const rushLabel = avg >= 85 ? 'Jam-Packed' : avg >= 65 ? 'Full Rush' : avg >= 45 ? 'Thoda Rush' : 'Khali';
      avgDensityEl.textContent = `${avg}% (${rushLabel})`;
      avgDensityEl.style.color = avg >= 85 ? '#c084fc' : avg >= 65 ? '#ef4444' : avg >= 45 ? '#f59e0b' : '#10b981';

      const statusEl = document.querySelector('#map-city-stats strong[style*="color"]');
      if (statusEl) {
        if (avg >= 85) {
          statusEl.textContent = 'Jam-Packed • Peak Darshan';
          statusEl.style.color = '#c084fc';
        } else if (avg >= 65) {
          statusEl.textContent = 'Full Rush • Peak Hours';
          statusEl.style.color = '#ef4444';
        } else if (avg >= 45) {
          statusEl.textContent = 'Thoda Rush • Darshan Open';
          statusEl.style.color = '#f59e0b';
        } else {
          statusEl.textContent = 'Khali • Peaceful Flow';
          statusEl.style.color = '#10b981';
        }
      }
    }
  }

  // -------------------------------------------------------------
  // Real-Time Leaderboard with Devotional Sponsor Card
  // -------------------------------------------------------------
  renderLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    container.innerHTML = '';

    const query = (this.filters.search || '').toLowerCase();
    const sorted = [...this.mandals]
      .filter((m) => {
        if (this.filters.quickOnly && (m.crowd_density >= 45 && (m.estimated_wait_minutes || 25) > 20)) return false;
        if (this.filters.famousOnly && !m.is_famous) return false;
        if (this.filters.manacheOnly && !this.isManacheMandal(m)) return false;
        if (!query) return true;
        return (
          m.name.toLowerCase().includes(query) ||
          m.address.toLowerCase().includes(query) ||
          (m.tags && m.tags.some((t) => t.toLowerCase().includes(query)))
        );
      })
      .sort((a, b) => (a.current_rank || 999) - (b.current_rank || 999));

    if (sorted.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'leaderboard-empty-state';
      emptyDiv.style.cssText = 'text-align:center; padding:36px 16px; color:var(--text-muted);';
      emptyDiv.innerHTML = `
        <div style="font-size:36px; margin-bottom:10px;">🕉️</div>
        <div style="font-weight:700; color:var(--text-cream); font-size:15px; margin-bottom:6px;">No Mandals Match Selected Filter</div>
        <div style="font-size:12.5px; line-height:1.5; color:var(--text-dim); max-width:320px; margin:0 auto;">
          ${this.filters.manacheOnly && this.currentCity === 'mumbai'
            ? 'The historic <strong>"Manache 5 Ganpati"</strong> are situated in Pune (Kasba, Tambdi Jogeshwari, Guruji Talim, Tulshibaug, Kesariwada). Switch city to Pune to view them!'
            : 'Try selecting "All Mandals" or clearing your search filter.'}
        </div>
      `;
      container.appendChild(emptyDiv);
      return;
    }

    sorted.forEach((mandal, index) => {
      const card = document.createElement('div');
      card.className = 'ranking-card';
      if (this.selectedMandal && this.selectedMandal.id === mandal.id) {
        card.classList.add('selected');
      }

      let trendIcon = '•';
      let trendClass = 'trend-stable';
      if (mandal.trend === 'up') {
        trendIcon = `↑ ${mandal.rank_change || 1}`;
        trendClass = 'trend-up';
      } else if (mandal.trend === 'down') {
        trendIcon = `↓ ${Math.abs(mandal.rank_change || 1)}`;
        trendClass = 'trend-down';
      }

      const density = mandal.crowd_density ?? 10;
      const waitMins = mandal.estimated_wait_minutes ?? 2;

      let rushText = mandal.rush_category || 'Khali';
      let rushColor = '#10b981';
      let rushBg = 'rgba(16, 185, 129, 0.18)';
      let fillClass = 'crowd-bar-green';

      if (density >= 85) {
        rushText = 'Jam-Packed';
        rushColor = '#c084fc';
        rushBg = 'rgba(147, 51, 234, 0.22)';
        fillClass = 'crowd-bar-purple';
      } else if (density >= 65) {
        rushText = 'Full Rush';
        rushColor = '#ef4444';
        rushBg = 'rgba(239, 68, 68, 0.18)';
        fillClass = 'crowd-bar-red';
      } else if (density >= 45) {
        rushText = 'Thoda Rush';
        rushColor = '#f59e0b';
        rushBg = 'rgba(245, 158, 11, 0.18)';
        fillClass = 'crowd-bar-orange';
      } else {
        rushText = 'Khali';
        rushColor = '#10b981';
        rushBg = 'rgba(16, 185, 129, 0.18)';
        fillClass = 'crowd-bar-green';
      }
      const roads = mandal.top_roads || [];
      const entryRoad = roads[0];
      const roadSpeed = entryRoad?.avg_speed || (mandal.avg_speed_kmh ? `${mandal.avg_speed_kmh} km/h` : '24 km/h');
      const roadNameShort = entryRoad?.name ? entryRoad.name.split('(')[0].trim() : 'Approach';
      const roadStatusShort = density >= 85 ? 'Gridlock' : density >= 65 ? 'Heavy Jam' : density >= 45 ? 'Slow' : 'Clear Flow';
      const roadBadgeColor = density >= 85 ? '#c084fc' : density >= 65 ? '#ef4444' : density >= 45 ? '#f59e0b' : '#10b981';
      const periodLabel = mandal.period_label || (density < 20 ? 'Aarti Closed for Night' : 'Active Queue');

      card.innerHTML = `
        <div class="card-top-row">
          <div class="rank-number">#${mandal.current_rank || index + 1}</div>
          <div class="mandal-card-info">
            <div class="card-title-row">
              <div class="mandal-card-name" title="${mandal.name}">${mandal.name}</div>
              ${this.isManacheMandal(mandal) ? '<span class="brand-tag" style="background:rgba(245,158,11,0.22); color:var(--accent-gold); border-color:var(--accent-gold); font-size:9.5px; padding:1px 6px;">MANACHE</span>' : ''}
              <span class="quality-badge quality-VERIFIED">VERIFIED</span>
            </div>
            <div class="mandal-card-meta">
              <span class="trend-badge ${trendClass}">${trendIcon}</span>
              <span>📍 ${mandal.address.split(',')[0]}</span>
            </div>
          </div>
        </div>

        <div class="card-cred-status-row">
          <div class="cred-rush-pill" style="background:${rushBg}; color:${rushColor};">
            <span class="cred-pulse-dot" style="background:${rushColor};"></span>
            <strong>${rushText} (${density}%)</strong>
            <span class="cred-wait-tag">• ~${waitMins}m wait</span>
          </div>
          <div class="cred-road-pill card-traffic-quick-btn" style="border-color:${roadBadgeColor}44; color:${roadBadgeColor}; cursor:pointer;" title="Click to view approach traffic on ${entryRoad?.name || 'Main Corridor'} (${roadSpeed})">
            <span>🚗 ${roadNameShort}: <strong>${roadSpeed}</strong> (${roadStatusShort})</span>
          </div>
        </div>

        <div class="card-action-row">
          <button class="btn-card-action btn-stand-front card-pov-btn" type="button" title="Stand in front of Bappa">
            <span>👁️ Stand in Front</span>
          </button>
          <button class="btn-card-action card-wa-share-btn" type="button" title="Share live queue on WhatsApp" aria-label="Share status on WhatsApp">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M17.507 14.307l-.009.075c-.238-.12-1.406-.694-1.624-.774-.219-.08-.378-.12-.538.12-.16.24-.617.774-.757.934-.14.16-.279.18-.518.06-.239-.12-1.01-.372-1.925-1.188-.711-.635-1.191-1.42-1.33-1.66-.14-.24-.015-.37.105-.489.108-.107.24-.279.36-.419.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.538-1.298-.738-1.778-.195-.468-.393-.404-.54-.412l-.46-.008c-.16 0-.418.06-.637.3-.219.24-.837.818-.837 1.996 0 1.177.857 2.315.977 2.475.12.16 1.687 2.576 4.088 3.612.57.247 1.016.395 1.363.506.573.182 1.094.156 1.506.095.46-.069 1.406-.575 1.605-1.13.199-.556.199-1.032.14-1.132-.06-.1-.22-.16-.46-.28zm-5.495 5.998c-1.545 0-3.056-.416-4.373-1.203l-.314-.187-3.25.852.868-3.167-.205-.327c-.864-1.376-1.32-2.98-1.32-4.633 0-4.62 3.759-8.379 8.38-8.379 4.62 0 8.379 3.759 8.379 8.379 0 4.62-3.759 8.38-8.38 8.38zm0-18.303c-5.508 0-9.985 4.477-9.985 9.985 0 1.76.459 3.477 1.333 4.992L2 22.002l5.17-1.356c1.464.798 3.116 1.22 4.842 1.22 5.508 0 9.985-4.477 9.985-9.985 0-5.508-4.477-9.985-9.985-9.985z"/></svg>
          </button>
          <button class="btn-card-action card-map-btn" type="button" title="View mandal on live map">
            <span>🗺️ Map</span>
          </button>
        </div>
      `;

      // Quick Traffic Pill Handler
      const trafficPill = card.querySelector('.card-traffic-quick-btn');
      if (trafficPill) {
        trafficPill.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.openPOVModal(mandal.id, 'traffic');
        });
      }

      // Stand in Front Button Handler (Touch & Click Safe)
      const povBtn = card.querySelector('.card-pov-btn');
      if (povBtn) {
        povBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.openPOVModal(mandal.id, 'crowd');
        });
      }

      // WhatsApp Viral Share Handler
      const shareBtn = card.querySelector('.card-wa-share-btn');
      if (shareBtn) {
        shareBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.shareToWhatsApp(mandal);
        });
      }

      // View on Map Button Handler
      const mapBtn = card.querySelector('.card-map-btn');
      if (mapBtn) {
        mapBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.switchToMobileTab('map', mandal);
        });
      }

      // Card Body Click Handler
      card.addEventListener('click', () => {
        this.selectedMandal = mandal;
        document.querySelectorAll('.ranking-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        this.safeMapFlyTo(mandal.latitude, mandal.longitude, 16, 1.2);
        this.openPOVModal(mandal.id, 'crowd');
      });

      container.appendChild(card);

      // Dynamic Multi-Slot Leaderboard Sponsor Ads (Configurable Rank Position)
      const rankNum = index + 1;
      const matchingAds = (this.sponsorAds || []).filter(
        (a) => a.placement === 'leaderboard' && (a.insert_after_rank ? Number(a.insert_after_rank) === rankNum : (rankNum === 2))
      );

      matchingAds.forEach((ad) => {
        const adCard = document.createElement('div');
        const isHelpline = (ad.badge_text || '').toUpperCase().includes('HELPLINE') || (ad.id || '').includes('bank') || (ad.sponsor_name || '').toLowerCase().includes('bank');
        adCard.className = `ad-card-native ${isHelpline ? 'type-helpline' : 'type-sweets'}`;

        if (isHelpline) {
          adCard.innerHTML = `
            <div class="ad-sponsor-top-bar">
              <div class="ad-sponsor-badge">
                <span>🚨</span>
                <span>${ad.badge_text || 'DEVOTEE HELPLINE & SEVA'}</span>
              </div>
              <span class="ad-slot-tag">Sponsored • Slot #${rankNum}</span>
            </div>
            <div class="ad-sponsor-main">
              <div class="ad-sponsor-avatar">📞</div>
              <div class="ad-sponsor-info">
                <div class="ad-sponsor-title-row">
                  <h3 class="ad-native-sponsor">${ad.sponsor_name}</h3>
                  <span class="ad-est-badge" style="color:#34d399; background:rgba(16,185,129,0.15); font-weight:700;">24x7 Active</span>
                </div>
                <p class="ad-native-desc">${ad.description || '24x7 Devotee Aid & Digital Dakshina Seva across major Mandals in Pune & Mumbai. Toll Free: 1800-233-4526.'}</p>
              </div>
            </div>
            <div class="ad-sponsor-highlights">
              <span class="ad-pill">📞 Toll Free: 1800-233-4526</span>
              <span class="ad-pill">🚑 Emergency First Aid</span>
              <span class="ad-pill">💧 Free Water Booths</span>
              <span class="ad-pill">🪙 Fast UPI Dakshina</span>
            </div>
            <div class="ad-sponsor-footer">
              <a href="tel:18002334526" class="ad-native-cta-btn">
                <span>📞 Call 24x7 Toll-Free Helpline (1800-233-4526)</span>
              </a>
              <button type="button" class="ad-native-inquire-link">Partner with us ↗</button>
            </div>
          `;
        } else {
          adCard.innerHTML = `
            <div class="ad-sponsor-top-bar">
              <div class="ad-sponsor-badge">
                <span>✨</span>
                <span>${ad.badge_text || 'OFFICIAL FESTIVAL SWEETS PARTNER'}</span>
              </div>
              <span class="ad-slot-tag">Sponsored • Slot #${rankNum}</span>
            </div>
            <div class="ad-sponsor-main">
              <div class="ad-sponsor-avatar">🥟</div>
              <div class="ad-sponsor-info">
                <div class="ad-sponsor-title-row">
                  <h3 class="ad-native-sponsor">${ad.sponsor_name}</h3>
                  <span class="ad-est-badge">Est. 1950 • Pune</span>
                </div>
                <p class="ad-native-desc">${ad.description || 'Authentic Pure Ghee Modaks, Pedhas & Mahaprasad offerings for Ganpati Bappa across Pune & Mumbai.'}</p>
              </div>
            </div>
            <div class="ad-sponsor-highlights">
              <span class="ad-pill">🥟 Ukadiche Modak</span>
              <span class="ad-pill">🥨 Famous Bakarwadi</span>
              <span class="ad-pill">🥭 Amba Barfi</span>
              <span class="ad-pill">🛵 Doorstep Delivery</span>
            </div>
            <div class="ad-sponsor-footer">
              <a href="${ad.cta_url || 'https://chitalebandhu.in'}" target="_blank" rel="noopener noreferrer" class="ad-native-cta-btn">
                <span>🛍️ ${ad.cta_text || 'Order Fresh Prasad & Sweets ↗'}</span>
              </a>
              <button type="button" class="ad-native-inquire-link">Partner with us ↗</button>
            </div>
          `;
        }
        const inquireLink = adCard.querySelector('.ad-native-inquire-link');
        if (inquireLink) {
          inquireLink.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openCommunityModal('advertise');
          });
        }
        container.appendChild(adCard);
      });
    });

    // Community Suggest & Advertise Invitation Card at the end of the leaderboard
    const inviteCard = document.createElement('div');
    inviteCard.className = 'mandal-community-invite-card';
    inviteCard.innerHTML = `
      <div class="comm-card-icon">🪔</div>
      <div class="comm-card-content">
        <div class="comm-card-title">Know an iconic Ganpati Mandal?</div>
        <div class="comm-card-sub">Help devotees discover Bappa's pandals, live rush, and darshan timings across Pune & Mumbai.</div>
        <div class="comm-card-buttons">
          <button class="btn-comm-action" id="invite-btn-suggest" type="button">📍 Suggest a Mandal (सुचवा)</button>
          <button class="btn-comm-action accent" id="invite-btn-advertise" type="button">📢 Advertise With Us</button>
        </div>
      </div>
    `;
    inviteCard.querySelector('#invite-btn-suggest')?.addEventListener('click', () => {
      this.openCommunityModal('suggest');
    });
    inviteCard.querySelector('#invite-btn-advertise')?.addEventListener('click', () => {
      this.openCommunityModal('advertise');
    });
    container.appendChild(inviteCard);

    const updatedEl = document.getElementById('leaderboard-updated');
    if (updatedEl) updatedEl.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
  }

  // -------------------------------------------------------------
  // Live Feed Sync Handler
  // -------------------------------------------------------------
  async syncFeeds() {
    const syncBtn = document.getElementById('btn-sync-feeds');
    if (syncBtn) syncBtn.classList.add('syncing');

    try {
      await this.loadCityData(this.currentCity);
      await this.fetchWeather(this.currentCity);
      this.showToast('✨ Feeds refreshed with latest live telemetry & devotee posts!');
    } catch (err) {
      console.warn('[Sync] Failed to refresh feeds:', err);
    } finally {
      setTimeout(() => {
        if (syncBtn) syncBtn.classList.remove('syncing');
      }, 700);
    }
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>🪔</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 3200);
  }

  // -------------------------------------------------------------
  // Mobile Navigation & Interactive Map Carousel
  // -------------------------------------------------------------
  switchToMobileTab(tabName, targetMandal = null) {
    this.trackInteraction('nav_tab_' + tabName);
    const navButtons = document.querySelectorAll('.mobile-nav-btn');
    navButtons.forEach((b) => {
      const isActive = b.dataset.tab === tabName;
      b.classList.toggle('active', isActive);
      if (isActive) {
        b.style.transform = 'scale(0.95)';
        setTimeout(() => { b.style.transform = ''; }, 180);
      }
    });

    const recModal = document.getElementById('recommendations-modal');
    const guideModal = document.getElementById('modal-devotee-guide');
    const mandalModal = document.getElementById('mandal-modal');

    if (tabName === 'map') {
      document.body.classList.add('mobile-view-map');
      if (recModal) recModal.classList.remove('open');
      if (guideModal) guideModal.classList.remove('open');
      if (mandalModal) mandalModal.classList.remove('open');
      if (this.map) {
        setTimeout(() => {
          this.map.invalidateSize();
          if (targetMandal) {
            this.safeMapFlyTo(targetMandal.latitude, targetMandal.longitude, 16, 0.8);
          } else {
            const coords = CITY_COORDS[this.currentCity];
            if (coords) this.safeMapFlyTo(coords.lat, coords.lng, coords.zoom, 0.8);
          }
        }, 100);
      }
      this.renderMobileMapCarousel(targetMandal ? targetMandal.id : null);
    } else if (tabName === 'rankings') {
      document.body.classList.remove('mobile-view-map');
      if (recModal) recModal.classList.remove('open');
      if (guideModal) guideModal.classList.remove('open');
      if (mandalModal) mandalModal.classList.remove('open');
      const leaderboard = document.getElementById('leaderboard-container');
      if (leaderboard && leaderboard.scrollTop > 50) {
        leaderboard.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (tabName === 'best') {
      document.body.classList.remove('mobile-view-map');
      if (guideModal) guideModal.classList.remove('open');
      if (mandalModal) mandalModal.classList.remove('open');
      this.openRecommendations('best_experience');
      if (!window._isPopStateHandling) {
        history.pushState({ modal: 'recommendations' }, '', '#best_mandals');
      }
    } else if (tabName === 'guide') {
      document.body.classList.remove('mobile-view-map');
      if (recModal) recModal.classList.remove('open');
      if (mandalModal) mandalModal.classList.remove('open');
      if (guideModal) {
        guideModal.classList.add('open');
        if (!window._isPopStateHandling) {
          history.pushState({ modal: 'guide' }, '', '#devotee_guide');
        }
      }
    }
  }

  renderMobileMapCarousel(activeMandalId = null, customList = null) {
    const carousel = document.getElementById('mobile-map-carousel');
    if (!carousel) return;
    carousel.innerHTML = '';

    let mandalsToShow = customList || this.mandals || [];
    if (!customList) {
      if (this.filters.quickOnly) mandalsToShow = mandalsToShow.filter((m) => m.crowd_density < 45 || (m.estimated_wait_minutes || 25) <= 20);
      if (this.filters.famousOnly) mandalsToShow = mandalsToShow.filter((m) => m.is_famous);
      if (this.filters.manacheOnly) mandalsToShow = mandalsToShow.filter((m) => this.isManacheMandal(m));
      if (this.filters.search) {
        const query = this.filters.search.toLowerCase();
        mandalsToShow = mandalsToShow.filter((m) =>
          m.name.toLowerCase().includes(query) ||
          m.address.toLowerCase().includes(query) ||
          (m.tags && m.tags.some((t) => t.toLowerCase().includes(query)))
        );
      }
    }
    mandalsToShow.forEach((mandal, idx) => {
      const density = mandal.crowd_density ?? 10;
      const waitMins = mandal.estimated_wait_minutes ?? 2;

      let rushText = 'Khali';
      let rushBg = 'rgba(16,185,129,0.2)';
      let rushColor = '#10b981';

      if (density >= 85) {
        rushText = 'Jam-Packed';
        rushBg = 'rgba(147,51,234,0.25)';
        rushColor = '#c084fc';
      } else if (density >= 65) {
        rushText = 'Full Rush';
        rushBg = 'rgba(239,68,68,0.2)';
        rushColor = '#ef4444';
      } else if (density >= 45) {
        rushText = 'Thoda Rush';
        rushBg = 'rgba(245,158,11,0.2)';
        rushColor = '#f59e0b';
      }
      const roads = mandal.top_roads || [];
      const entryRoad = roads[0];
      const roadSpeed = entryRoad?.avg_speed || (mandal.avg_speed_kmh ? `${mandal.avg_speed_kmh} km/h` : '24 km/h');
      const roadNameShort = entryRoad?.name ? entryRoad.name.split('(')[0].trim() : 'Corridor';

      const card = document.createElement('div');
      card.className = `carousel-mandal-card ${mandal.id === activeMandalId ? 'active-card' : ''}`;
      card.id = `carousel-card-${mandal.id}`;
      card.innerHTML = `
        <div class="carousel-card-top">
          <span class="carousel-rank-badge">#${mandal.current_rank || idx + 1}</span>
          <span class="carousel-mandal-name" title="${mandal.name}">${mandal.name}</span>
        </div>
        <div class="carousel-card-meta">
          <span class="carousel-rush-pill" style="background:${rushBg}; color:${rushColor};">
            ${rushText} (${density}%)
          </span>
          <span class="carousel-wait-text">⏱️ ~${waitMins}m wait</span>
        </div>
        <div style="font-size:11px; color:${rushColor}; margin-bottom:8px; display:flex; align-items:center; gap:4px; opacity:0.95;">
          <span>🚗 ${roadNameShort}: <strong>${roadSpeed}</strong></span>
        </div>
        <div class="carousel-card-actions">
          <button class="carousel-btn-pov" type="button">
            <span>👁️ Stand in Front</span>
          </button>
          <button class="carousel-btn-locate" type="button" title="Center on Map">
            <span>📍 Center</span>
          </button>
        </div>
      `;

      card.querySelector('.carousel-btn-pov')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openPOVModal(mandal.id, 'crowd');
      });

      card.querySelector('.carousel-btn-locate')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.safeMapFlyTo(mandal.latitude, mandal.longitude, 16, 0.8);
      });

      card.addEventListener('click', () => {
        document.querySelectorAll('.carousel-mandal-card').forEach((c) => c.classList.remove('active-card'));
        card.classList.add('active-card');
        this.safeMapFlyTo(mandal.latitude, mandal.longitude, 16, 0.8);
      });

      carousel.appendChild(card);
    });

    if (activeMandalId) {
      const activeCard = document.getElementById(`carousel-card-${activeMandalId}`);
      if (activeCard) {
        activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }

  bindMobileNavigation() {
    const navButtons = document.querySelectorAll('.mobile-nav-btn');
    const chipJumpMap = document.getElementById('chip-jump-to-map');
    const pillSuggest = document.getElementById('m-pill-suggest');
    const pillAdvertise = document.getElementById('m-pill-advertise');
    const quickChips = document.querySelectorAll('.rank-filter-chip:not(.chip-map-jump)');

    navButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.switchToMobileTab(btn.dataset.tab);
      });
    });

    // Tactile Back Buttons for Mobile Sheets
    const btnBackRec = document.getElementById('btn-back-rec');
    if (btnBackRec) {
      btnBackRec.addEventListener('click', () => {
        const recModal = document.getElementById('recommendations-modal');
        if (recModal) recModal.classList.remove('open');
        this.switchToMobileTab('rankings');
      });
    }

    const btnBackGuide = document.getElementById('btn-back-guide');
    if (btnBackGuide) {
      btnBackGuide.addEventListener('click', () => {
        const guideModal = document.getElementById('modal-devotee-guide');
        if (guideModal) guideModal.classList.remove('open');
        this.switchToMobileTab('rankings');
      });
    }

    if (chipJumpMap) {
      chipJumpMap.addEventListener('click', () => {
        this.switchToMobileTab('map');
      });
    }

    if (pillSuggest) {
      pillSuggest.addEventListener('click', () => {
        this.openCommunityModal('suggest');
      });
    }

    if (pillAdvertise) {
      pillAdvertise.addEventListener('click', () => {
        this.openCommunityModal('advertise');
      });
    }

    // Quick filter chips (All, Manache, Khali, Famous)
    quickChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        quickChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        const filterType = chip.dataset.filter;
        if (filterType === 'all') {
          this.filters.quickOnly = false;
          this.filters.famousOnly = false;
          this.filters.manacheOnly = false;
        } else if (filterType === 'manache') {
          this.filters.quickOnly = false;
          this.filters.famousOnly = false;
          this.filters.manacheOnly = true;
          if (this.currentCity === 'mumbai') {
            this.showToast('Note: The 5 Manache Ganpatis are located in Pune.');
          }
        } else if (filterType === 'khali') {
          this.filters.quickOnly = true;
          this.filters.famousOnly = false;
          this.filters.manacheOnly = false;
        } else if (filterType === 'famous') {
          this.filters.quickOnly = false;
          this.filters.famousOnly = true;
          this.filters.manacheOnly = false;
        }

        const btnManache = document.getElementById('btn-filter-manache');
        if (btnManache) btnManache.classList.toggle('active', this.filters.manacheOnly);
        const btnQuick = document.getElementById('btn-filter-quick');
        if (btnQuick) btnQuick.classList.toggle('active', this.filters.quickOnly);
        const btnFamous = document.getElementById('btn-filter-famous');
        if (btnFamous) btnFamous.classList.toggle('active', this.filters.famousOnly);

        this.renderLeaderboard();
        this.renderMapMarkers();
      });
    });

    // Wire mobile carousel toggle
    const toggleCarouselBtn = document.getElementById('btn-toggle-map-carousel');
    const carouselWrap = document.getElementById('mobile-map-carousel-wrap');
    if (toggleCarouselBtn && carouselWrap) {
      toggleCarouselBtn.addEventListener('click', () => {
        const isMin = carouselWrap.classList.toggle('minimized');
        const labelEl = toggleCarouselBtn.querySelector('span');
        if (labelEl) labelEl.textContent = isMin ? '▲ Show Cards' : '▼ Hide';
      });
    }

    // Direct routing: check if user accessed /admin or #admin
    if (
      window.location.pathname === '/admin' ||
      window.location.hash === '#admin' ||
      window.location.search.includes('admin=1')
    ) {
      const adminModal = document.getElementById('admin-modal');
      if (adminModal) {
        adminModal.classList.add('open');
      }
    }

    // CRED-Style Browser / Phone Hardware Back Button Support (History API)
    window.addEventListener('popstate', (event) => {
      window._isPopStateHandling = true;

      // Close open modals layer by layer
      const povModal = document.getElementById('pov-street-modal');
      const mandalModal = document.getElementById('mandal-modal');
      const recModal = document.getElementById('recommendations-modal');
      const guideModal = document.getElementById('modal-devotee-guide');
      const certModal = document.getElementById('modal-cert-details');
      const adminModal = document.getElementById('admin-modal');

      if (povModal && povModal.classList.contains('open')) {
        this.closePOVModal();
      } else if (mandalModal && mandalModal.classList.contains('open')) {
        mandalModal.classList.remove('open');
      } else if (recModal && recModal.classList.contains('open')) {
        recModal.classList.remove('open');
        this.switchToMobileTab('rankings');
      } else if (guideModal && guideModal.classList.contains('open')) {
        guideModal.classList.remove('open');
        this.switchToMobileTab('rankings');
      } else if (certModal && certModal.classList.contains('open')) {
        certModal.classList.remove('open');
      } else if (adminModal && adminModal.classList.contains('open')) {
        adminModal.classList.remove('open');
      } else if (document.body.classList.contains('mobile-view-map')) {
        // If on map view on mobile, back takes user back to mandals list
        this.switchToMobileTab('rankings');
      }

      window._isPopStateHandling = false;
    });
  }

  // -------------------------------------------------------------
  // Mobile Pull Down to Refresh (Smooth Tactile Experience)
  // -------------------------------------------------------------
  bindPullToRefresh() {
    const rankingPanel = document.getElementById('ranking-panel');
    const indicator = document.getElementById('pull-refresh-indicator');
    const textEl = document.getElementById('pull-refresh-text');
    const spinner = indicator ? indicator.querySelector('.pull-refresh-spinner') : null;
    const leaderboard = document.getElementById('leaderboard-container');
    if (!rankingPanel || !indicator || !textEl) return;

    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    let isRefreshing = false;
    const TRIGGER_THRESHOLD = 55; // px pull required
    const MAX_PULL = 85;

    const isAtTop = () => {
      const scrollPos = leaderboard ? leaderboard.scrollTop : 0;
      return scrollPos <= 0 && window.scrollY <= 0;
    };

    rankingPanel.addEventListener('touchstart', (e) => {
      if (isRefreshing) return;
      if (isAtTop() && e.touches.length === 1) {
        startY = e.touches[0].clientY;
        isPulling = true;
        indicator.classList.add('pulling');
      } else {
        isPulling = false;
      }
    }, { passive: true });

    rankingPanel.addEventListener('touchmove', (e) => {
      if (!isPulling || isRefreshing) return;
      currentY = e.touches[0].clientY;
      const diffY = currentY - startY;

      if (diffY > 0 && isAtTop()) {
        if (e.cancelable && diffY > 8) e.preventDefault();

        const pullDistance = Math.min(diffY * 0.45, MAX_PULL);
        indicator.style.height = `${pullDistance}px`;
        indicator.style.maxHeight = `${pullDistance}px`;
        indicator.style.opacity = `${Math.min(pullDistance / 35, 1)}`;

        if (spinner) {
          spinner.style.transform = `rotate(${diffY * 3.5}deg) scale(${1 + pullDistance / 200})`;
        }

        if (pullDistance >= TRIGGER_THRESHOLD) {
          textEl.textContent = 'Release to refresh Bappa darshan! 🪔';
          indicator.classList.add('ready');
        } else {
          textEl.textContent = 'Pull down to refresh Bappa darshan... ⬇️';
          indicator.classList.remove('ready');
        }
      } else if (diffY < -5) {
        isPulling = false;
        indicator.style.height = '0px';
        indicator.style.maxHeight = '0px';
        indicator.style.opacity = '0';
      }
    }, { passive: false });

    const handleTouchEnd = async () => {
      if (!isPulling || isRefreshing) return;
      isPulling = false;
      indicator.classList.remove('pulling');

      const currentHeight = parseFloat(indicator.style.height || '0');
      if (currentHeight >= TRIGGER_THRESHOLD) {
        isRefreshing = true;
        indicator.classList.add('refreshing');
        indicator.style.transition = 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)';
        indicator.style.height = '52px';
        indicator.style.maxHeight = '52px';
        indicator.style.opacity = '1';
        textEl.textContent = 'Refreshing live crowd & road rush... ⏳';

        if (navigator.vibrate) {
          try { navigator.vibrate([15, 30, 15]); } catch (_) {}
        }

        try {
          await this.syncFeeds();
          textEl.textContent = '✨ Live Bappa Darshan & Roads Updated!';
        } catch (err) {
          console.warn('[PullRefresh] Failed to sync:', err);
          textEl.textContent = '⚠️ Could not update live feeds';
        } finally {
          setTimeout(() => {
            indicator.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
            indicator.style.height = '0px';
            indicator.style.maxHeight = '0px';
            indicator.style.opacity = '0';
            setTimeout(() => {
              indicator.classList.remove('refreshing', 'ready');
              indicator.style.transition = '';
              isRefreshing = false;
            }, 350);
          }, 800);
        }
      } else {
        indicator.style.transition = 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
        indicator.style.height = '0px';
        indicator.style.maxHeight = '0px';
        indicator.style.opacity = '0';
        setTimeout(() => {
          indicator.style.transition = '';
          indicator.classList.remove('ready');
        }, 250);
      }
    };

    rankingPanel.addEventListener('touchend', handleTouchEnd);
    rankingPanel.addEventListener('touchcancel', handleTouchEnd);
  }

  // -------------------------------------------------------------
  // First-Person Street & Pandal POV ("Stand in Front of Mandal")
  // -------------------------------------------------------------
  async openPOVModal(mandalId, initialPane = 'crowd') {
    let mandal = (this.mandals || []).find((m) => m.id === mandalId);
    if (!mandal) {
      try {
        const res = await fetch(`/api/mandals/${mandalId}`);
        const data = await res.json();
        if (data && data.success && data.data && data.data.mandal) {
          mandal = data.data.mandal;
        }
      } catch (e) {
        console.warn('Failed to fetch mandal info:', e);
      }
    }
    if (!mandal) {
      mandal = (this.mandals && this.mandals.length > 0) ? this.mandals[0] : null;
    }
    if (!mandal) return;

    this.povMandal = mandal;
    this.povAngle = 'sanctum';
    this.darshanZoomIndex = 0;
    this.trackInteraction('stand_in_front', mandal.id);

    // 1. Immediately open modal so devotee gets instant 60fps feedback
    const povModalEl = document.getElementById('pov-street-modal');
    if (povModalEl) {
      povModalEl.classList.add('open');
      const winEl = povModalEl.querySelector('.modal-window');
      if (winEl) winEl.style.transform = 'translateY(0)';
    }

    if (!window._isPopStateHandling) {
      history.pushState({ modal: 'pov', mandalId: mandal.id }, '', `#mandal_${mandal.id}`);
    }

    // 2. Set Header details
    const modalNameEl = document.getElementById('pov-mandal-name');
    if (modalNameEl) {
      modalNameEl.textContent = `${mandal.name} — Street & Pandal POV`;
    }

    const badgeEl = document.getElementById('pov-mandal-status-badge');
    if (badgeEl) {
      badgeEl.textContent = '🟢 DARSHAN OPEN';
    }

    // 3. Safe Map FlyTo (no-ops safely if map is hidden)
    this.safeMapFlyTo(mandal.latitude, mandal.longitude, 17, 1.0);

    // 4. Safely initialize panes in isolation
    try {
      this.setupRushIntelPane(mandal);
    } catch (err) {
      console.error('[POV] setupRushIntelPane failed:', err);
    }

    try {
      this.setupMurtiDarshanPane(mandal);
    } catch (err) {
      console.error('[POV] setupMurtiDarshanPane failed:', err);
    }

    try {
      this.switchPOVTab(initialPane);
    } catch (err) {
      console.error('[POV] switchPOVTab failed:', err);
    }

    try {
      this.setupTrafficPane(mandal);
    } catch (err) {
      console.error('[POV] setupTrafficPane failed:', err);
    }

    try {
      this.loadSocialMediaAndStreams(mandal.id);
    } catch (err) {
      console.error('[POV] loadSocialMediaAndStreams failed:', err);
    }
  }

  setupMurtiDarshanPane(mandal) {
    const heroImg = document.getElementById('pov-hero-photo');
    const attributionEl = document.getElementById('pov-photo-attribution');
    const zoomLabel = document.getElementById('darshan-zoom-level');
    const btnEntrance = document.getElementById('btn-angle-entrance');

    if (heroImg) {
      heroImg.src = mandal.image_url || '/images/mandals/dagdusheth_idol.jpg';
      heroImg.className = 'pov-hero-photo zoom-1x';
    }
    if (zoomLabel) zoomLabel.textContent = '1.0x';
    if (attributionEl) {
      attributionEl.textContent = `📍 Source: Verified Sacred Murti of ${mandal.name}`;
    }

    // Only display Temple Pravesh Dwar button if mandal has an authentic, verified entrance
    const hasVerifiedEntrance = Boolean(
      mandal.has_verified_entrance ||
      ['dagdusheth', 'kasba', 'tambdi_jogeshwari', 'kesariwada', 'akhil_mandai', 'bhausaheb_rangari', 'lalbaug', 'ganesh_galli'].some(k => mandal.id.includes(k))
    );

    if (btnEntrance) {
      btnEntrance.style.display = hasVerifiedEntrance ? 'inline-flex' : 'none';
    }

    // Reset Angle Buttons
    document.querySelectorAll('.pov-angle-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.angle === 'sanctum');
    });

    this.updatePOVTelemetry();
  }

  setupRushIntelPane(mandal) {
    const waitTimeEl = document.getElementById('rush-wait-time');
    const waitDescEl = document.getElementById('rush-wait-desc');
    const statusPillEl = document.getElementById('rush-status-pill');
    const fastestRoadEl = document.getElementById('rush-fastest-road');
    const fastestStatusEl = document.getElementById('rush-fastest-status');
    const bestTimeEl = document.getElementById('rush-best-time');
    const adviceTextEl = document.getElementById('rush-advice-text');
    const murtiImg = document.getElementById('rush-murti-img');
    const murtiCaption = document.getElementById('rush-murti-caption');
    const timingsEl = document.getElementById('rush-pandal-timings');
    const roadsMiniList = document.getElementById('rush-roads-mini-list');
    const mapsNavBtn = document.getElementById('btn-rush-maps-nav');

    const roads = (mandal.top_roads && mandal.top_roads.length >= 3)
      ? mandal.top_roads
      : [
          { name: `${mandal.name} Main Approach`, distance: '120m from mandal', color: 'red', status: 'Heavy Jam', delay: '~40 min delay', avg_speed: '5 km/h' },
          { name: `${mandal.name} Parallel Arterial`, distance: '380m from mandal', color: 'orange', status: 'Moderate Rush', delay: '~18 min delay', avg_speed: '14 km/h' },
          { name: `${mandal.name} Outer Connector`, distance: '750m from mandal', color: 'blue', status: 'Clear Route', delay: '~6 min delay', avg_speed: '32 km/h' },
        ];

    // Compute genuine wait time estimate
    const hasRedRoad = roads.some(r => r.color === 'red');
    const baseWait = mandal.estimated_wait_minutes || (hasRedRoad ? 35 : 20);
    const minWait = Math.max(5, baseWait - 5);
    const maxWait = baseWait + 10;

    if (waitTimeEl) {
      waitTimeEl.textContent = `~${minWait} - ${maxWait} mins`;
    }

    if (statusPillEl) {
      const density = mandal.crowd_density ?? 15;
      const rushCategory = mandal.rush_category || (density >= 85 ? 'Jam-Packed' : density >= 65 ? 'Full Rush' : density >= 45 ? 'Thoda Rush' : 'Khali');
      if (rushCategory === 'Jam-Packed' || density >= 85) {
        statusPillEl.textContent = '🟣 JAM-PACKED • PEAK RUSH';
        statusPillEl.style.color = '#c084fc';
        statusPillEl.style.borderColor = 'rgba(147, 51, 234, 0.5)';
        statusPillEl.style.background = 'rgba(147, 51, 234, 0.22)';
        if (waitDescEl) waitDescEl.textContent = 'Peak festival barricaded rush • Devotee gridlock with maximum waiting';
      } else if (rushCategory === 'Full Rush' || density >= 65) {
        statusPillEl.textContent = '🔴 PEAK AARTI RUSH (FULL RUSH)';
        statusPillEl.style.color = '#ef4444';
        statusPillEl.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        statusPillEl.style.background = 'rgba(239, 68, 68, 0.15)';
        if (waitDescEl) waitDescEl.textContent = 'High festival evening rush • Barricaded darshan queues active';
      } else if (rushCategory === 'Thoda Rush' || density >= 45) {
        statusPillEl.textContent = '🟠 MODERATE RUSH (THODA RUSH)';
        statusPillEl.style.color = 'var(--accent-gold)';
        statusPillEl.style.borderColor = 'rgba(245, 158, 11, 0.4)';
        statusPillEl.style.background = 'rgba(245, 158, 11, 0.18)';
        if (waitDescEl) waitDescEl.textContent = 'Steady queue movement inside pandal • 2-3 paces every minute';
      } else {
        statusPillEl.textContent = '🟢 SMOOTH DARSHAN FLOW (KHALI)';
        statusPillEl.style.color = '#10b981';
        statusPillEl.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        statusPillEl.style.background = 'rgba(16, 185, 129, 0.15)';
        if (waitDescEl) waitDescEl.textContent = 'Minimal barricade delay • Direct Charan Sparsh access open';
      }
    }

    // Find fastest road
    const fastest = roads.find(r => r.color === 'blue') || roads.find(r => r.color === 'orange') || roads[0];
    if (fastestRoadEl) {
      fastestRoadEl.textContent = `${fastest.name} (${fastest.distance})`;
    }
    if (fastestStatusEl) {
      fastestStatusEl.textContent = `⚡ ${fastest.avg_speed || '18 km/h'} • ${fastest.delay || 'lowest delay'}`;
    }

    if (bestTimeEl) {
      bestTimeEl.textContent = '6:00 AM – 9:30 AM & Post-11 PM';
    }

    if (adviceTextEl) {
      adviceTextEl.textContent = hasRedRoad
        ? `Main approach corridors are congested with festival traffic. Devotees on foot are moving steadily. Best approach: ${fastest.name}. Dedicated queue for seniors & families.`
        : `Darshan lines are moving smoothly. Barricade marshaling is organized and pradakshina path is clear. Dedicated queue for seniors & families.`;
    }

    // Murti photo preview
    if (murtiImg) {
      murtiImg.src = mandal.image_url || '/images/mandals/dagdusheth_idol.jpg';
    }
    if (murtiCaption) {
      murtiCaption.textContent = `🙏 ${mandal.name} — Sacred Murti`;
    }

    if (timingsEl) {
      timingsEl.textContent = mandal.timings || '05:00 AM - 11:30 PM';
    }

    // Mini approach roads list
    if (roadsMiniList) {
      roadsMiniList.innerHTML = '';
      roads.slice(0, 3).forEach((road) => {
        const item = document.createElement('div');
        item.className = 'rush-road-mini-item';
        const badgeClass = road.color === 'blue' ? 'badge-blue' : (road.color === 'red' ? 'badge-red' : 'badge-orange');
        const badgeIcon = road.color === 'blue' ? '🔵 CLEAR' : (road.color === 'red' ? '🔴 JAM' : '🟠 MODERATE');

        item.innerHTML = `
          <div class="rush-road-mini-left">
            <span class="rush-road-mini-name">${road.name}</span>
            <span class="rush-road-mini-dist">📍 ${road.distance}</span>
          </div>
          <div class="rush-road-mini-right">
            <span class="road-status-badge ${badgeClass}">${badgeIcon}</span>
            <span style="font-size:11px;color:var(--accent-gold);font-weight:700;">${road.delay}</span>
          </div>
        `;
        item.addEventListener('click', () => {
          this.switchPOVTab('traffic');
        });
        roadsMiniList.appendChild(item);
      });
    }

    if (mapsNavBtn) {
      mapsNavBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${mandal.latitude},${mandal.longitude}`;
    }

    // Wire up POV Modal 1-Tap WhatsApp Viral Share Button
    const btnPovWa = document.getElementById('btn-pov-share-wa');
    if (btnPovWa) {
      btnPovWa.onclick = () => this.shareToWhatsApp(mandal);
    }
  }

  async shareToWhatsApp(mandal) {
    if (!mandal) mandal = this.povMandal || (this.mandals && this.mandals[0]);
    if (!mandal) return;
    this.trackInteraction('whatsapp_share', mandal.id);

    const density = mandal.crowd_density ?? 35;
    const waitMins = mandal.estimated_wait_minutes ?? 15;

    let rushEmoji = '🟢';
    let rushText = 'कमी गर्दी (Smooth Darshan Flow)';
    if (density >= 85) { rushEmoji = '🟣'; rushText = 'प्रचंड गर्दी (Jam-Packed)'; }
    else if (density >= 65) { rushEmoji = '🔴'; rushText = 'जास्त गर्दी (Full Rush)'; }
    else if (density >= 45) { rushEmoji = '🟠'; rushText = 'मध्यम गर्दी (Moderate Queue)'; }

    const roads = mandal.top_roads || [];
    const fastestRoad = roads.find(r => r.color === 'blue') || roads.find(r => r.color === 'orange') || roads[0];
    const roadName = fastestRoad?.name || mandal.traffic_road || 'मुख्य मार्ग';
    const roadSpeed = fastestRoad?.avg_speed ? ` (${fastestRoad.avg_speed})` : '';
    const city = (mandal.city_id?.includes('mumbai') || mandal.city?.toLowerCase() === 'mumbai' || this.currentCity === 'mumbai') ? 'MUMBAI' : 'PUNE';
    const url = `https://ganeshmandal.in/mandal/${mandal.id}?src=wa`;

    const text = [
      `🚩 *${mandal.name} (${city}) - थेट गर्दी व दर्शन अपडेट*`,
      `📊 सद्यस्थिती: ${rushEmoji} ${density}% ${rushText}`,
      `⏱️ रांगेत प्रतीक्षा वेळ: ~${waitMins} मिनिटे`,
      `🚗 सर्वात वेगवान रस्ता: ${roadName}${roadSpeed}`,
      `\n👁️ थेट दर्शन रांग व लाईव्ह रस्ते पाहण्यासाठी खालील लिंक उघडा:`,
      `👉 ${url}`,
      `\n🕉️ *GaneshMandal.in | महाराष्ट्राचे #१ गणेशोत्सव पोर्टल*`,
      `*(दर्शन रांगेत जाण्यापूर्वी मित्र आणि सोसायटी ग्रुपवर नक्की शेअर करा)*`
    ].join('\n');

    // 1. Mobile Web Share API with real Bappa Murti image file attachment
    // On phones (Android & iOS), this attaches the actual sacred idol photo with the message as caption
    if (navigator.share && mandal.image_url) {
      try {
        const imgRes = await fetch(mandal.image_url);
        if (imgRes.ok) {
          const blob = await imgRes.blob();
          const ext = mandal.image_url.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
          const file = new File([blob], `${mandal.slug || 'bappa_murti'}.${ext}`, {
            type: blob.type || 'image/jpeg'
          });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `${mandal.name} - Bappa Live Darshan`,
              text: text
            });
            return;
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('[Share] File sharing fallback:', err);
      }
    }

    // 2. Direct WhatsApp Web / Scheme fallback
    // WhatsApp crawler automatically unfurls the OpenGraph og:image (Bappa's sacred idol photo) from the link
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  }

  setupTrafficPane(mandal) {
    const trafficMiniMapEl = document.getElementById('traffic-road-mini-map');
    const trafficIframe = document.getElementById('traffic-road-iframe');
    const trafficMapsLink = document.getElementById('traffic-maps-link');
    const trafficRoadName = document.getElementById('traffic-road-name');
    const trafficRoadStatus = document.getElementById('traffic-road-status');
    const selectorEl = document.getElementById('traffic-roads-selector');

    const density = mandal.crowd_density ?? 15;
    const isNightLull = density < 20;

    let roads = (mandal.top_roads && mandal.top_roads.length >= 3)
      ? mandal.top_roads
      : [
          { name: `${mandal.name} Main Approach`, distance: '120m from mandal', distance_meters: 120, color: 'blue', status: 'Clear • Free flow route', delay: '< 3 min delay', avg_speed: '36 km/h', maps_query: `${mandal.name} Main Road` },
          { name: `${mandal.name} Parallel Arterial`, distance: '380m from mandal', distance_meters: 380, color: 'blue', status: 'Clear • Smooth Movement', delay: '< 2 min delay', avg_speed: '40 km/h', maps_query: `${mandal.name} Approach` },
          { name: `${mandal.name} Outer Ring Connector`, distance: '750m from mandal', distance_meters: 750, color: 'blue', status: 'Clear • Midnight Free Flow', delay: '< 2 min delay', avg_speed: '45 km/h', maps_query: `${mandal.address || mandal.name}` },
        ];

    // Client-side guarantee: if night lull (11 PM - 5:30 AM / density < 20), enforce 100% blue / clear
    if (isNightLull) {
      roads = roads.map((r, i) => ({
        ...r,
        color: 'blue',
        status: 'Clear • Midnight Free Flow',
        delay: i === 0 ? '< 3 min delay' : '< 2 min delay',
        avg_speed: i === 0 ? '36 km/h' : (i === 1 ? '40 km/h' : '45 km/h'),
      }));
    }

    if (!selectorEl) return;
    selectorEl.innerHTML = '';

    // Initialize Leaflet mini-map safely if container is visible and ready
    if (!this.trafficMiniMap && window.L && trafficMiniMapEl && trafficMiniMapEl.offsetWidth > 0 && !trafficMiniMapEl._leaflet_id) {
      try {
        this.trafficMiniMap = L.map('traffic-road-mini-map', {
          center: [mandal.latitude, mandal.longitude],
          zoom: 16,
          zoomControl: false,
          attributionControl: false,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          className: 'dark-tactical-tile',
          maxZoom: 19,
        }).addTo(this.trafficMiniMap);
        this.trafficMiniMarkerGroup = L.layerGroup().addTo(this.trafficMiniMap);
      } catch (err) {
        console.warn('[POV] Mini-map init deferred:', err);
      }
    }

    const selectRoad = (road, cardEl) => {
      selectorEl.querySelectorAll('.traffic-road-card').forEach((c) => c.classList.remove('active'));
      cardEl.classList.add('active');

      if (trafficRoadName) {
        trafficRoadName.textContent = `${road.name} (${road.distance})`;
      }
      if (trafficRoadStatus) {
        const colorLabel = road.color === 'blue' ? '🔵 CLEAR / FREE FLOW' : (road.color === 'orange' ? '🟠 MODERATE RUSH' : '🔴 HEAVY CONGESTION');
        trafficRoadStatus.textContent = `${colorLabel} • ${road.status} • Expected Delay: ${road.delay} (Avg Speed: ${road.avg_speed})`;
      }

      // Update interactive mini-map if available
      try {
        if (this.trafficMiniMap && this.trafficMiniMarkerGroup) {
          this.trafficMiniMarkerGroup.clearLayers();
          const mandalPin = L.circleMarker([mandal.latitude, mandal.longitude], {
            radius: 8,
            color: '#ff9933',
            fillColor: '#ff6b00',
            fillOpacity: 1.0,
            weight: 2,
          }).addTo(this.trafficMiniMarkerGroup);
          mandalPin.bindTooltip(`📍 ${mandal.name}`, { permanent: true, direction: 'top', className: 'tactical-tooltip' });

          const distM = road.distance_meters || 250;
          const offsetLat = mandal.latitude + (distM / 111000);
          const roadColorHex = road.color === 'blue' ? '#3b82f6' : (road.color === 'red' ? '#ef4444' : '#f59e0b');

          const roadPin = L.circleMarker([offsetLat, mandal.longitude], {
            radius: 7,
            color: roadColorHex,
            fillColor: roadColorHex,
            fillOpacity: 0.9,
            weight: 2,
          }).addTo(this.trafficMiniMarkerGroup);
          roadPin.bindTooltip(`🚦 ${road.name} (${road.avg_speed})`, { permanent: false, direction: 'bottom' });

          L.polyline([[mandal.latitude, mandal.longitude], [offsetLat, mandal.longitude]], {
            color: roadColorHex,
            weight: 3,
            dashArray: '4, 6',
            opacity: 0.85,
          }).addTo(this.trafficMiniMarkerGroup);

          setTimeout(() => {
            if (this.trafficMiniMap && trafficMiniMapEl && trafficMiniMapEl.offsetWidth > 0) {
              this.trafficMiniMap.invalidateSize();
              this.trafficMiniMap.setView([mandal.latitude, mandal.longitude], 16);
            }
          }, 120);
        } else if (trafficIframe) {
          const query = encodeURIComponent(road.maps_query || `${road.name}, ${mandal.address || mandal.name}`);
          trafficIframe.src = `https://maps.google.com/maps?q=${query}&t=m&z=16&output=embed`;
        }
      } catch (err) {
        console.warn('[POV] selectRoad mini-map error:', err);
      }

      if (trafficMapsLink) {
        trafficMapsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(road.maps_query || mandal.name)}`;
      }
    };

    roads.slice(0, 3).forEach((road, idx) => {
      const card = document.createElement('div');
      card.className = `traffic-road-card color-${road.color || 'blue'}`;
      if (idx === 0) card.classList.add('active');

      const badgeClass = road.color === 'blue' ? 'badge-blue' : (road.color === 'red' ? 'badge-red' : 'badge-orange');
      const badgeIcon = road.color === 'blue' ? '🔵 CLEAR' : (road.color === 'red' ? '🔴 HEAVY JAM' : '🟠 MODERATE');

      card.innerHTML = `
        <div class="road-card-top">
          <span class="road-distance-pill">📍 ${road.distance}</span>
          <span class="road-status-badge ${badgeClass}">${badgeIcon}</span>
        </div>
        <div class="road-title">${road.name}</div>
        <div class="road-meta-line">
          <span>⏳ ${road.delay}</span>
          <span>⚡ ${road.avg_speed}</span>
        </div>
      `;

      card.addEventListener('click', () => selectRoad(road, card));
      selectorEl.appendChild(card);
    });

    if (roads.length > 0) {
      const firstCard = selectorEl.querySelector('.traffic-road-card');
      if (firstCard) selectRoad(roads[0], firstCard);
    }
  }

  switchPOVTab(paneName) {
    document.querySelectorAll('.pov-tab-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.pane === paneName);
    });

    document.querySelectorAll('.pov-view-pane').forEach((p) => {
      p.classList.toggle('active', p.id === `pane-pov-${paneName}`);
    });

    if (paneName === 'traffic') {
      const trafficMiniMapEl = document.getElementById('traffic-road-mini-map');
      if (!this.trafficMiniMap && window.L && trafficMiniMapEl && !trafficMiniMapEl._leaflet_id && this.povMandal) {
        try {
          this.trafficMiniMap = L.map('traffic-road-mini-map', {
            center: [this.povMandal.latitude, this.povMandal.longitude],
            zoom: 16,
            zoomControl: false,
            attributionControl: false,
          });
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            className: 'dark-tactical-tile',
            maxZoom: 19,
          }).addTo(this.trafficMiniMap);
          this.trafficMiniMarkerGroup = L.layerGroup().addTo(this.trafficMiniMap);
          this.setupTrafficPane(this.povMandal);
        } catch (e) {
          console.warn('[POV] Mini-map init in switchPOVTab failed:', e);
        }
      }
      setTimeout(() => {
        try {
          if (this.trafficMiniMap) {
            this.trafficMiniMap.invalidateSize();
            if (this.povMandal) {
              this.trafficMiniMap.setView([this.povMandal.latitude, this.povMandal.longitude], 16);
            }
          }
        } catch (e) {
          console.warn('[POV] Invalidate mini-map failed:', e);
        }
      }, 150);
    }
  }

  updatePOVTelemetry() {
    const mandal = this.povMandal;
    if (!mandal) return;

    const distEl = document.getElementById('pov-distance');
    const waitEl = document.getElementById('pov-wait-estimate');
    const stageEl = document.getElementById('pov-stage-state');

    const waitMins = mandal.estimated_wait_minutes || 25;
    const minWait = Math.max(5, waitMins - 5);
    const maxWait = waitMins + 10;

    if (distEl) distEl.textContent = this.povAngle === 'entrance' ? 'At Pravesh Dwar' : 'Sanctum Altar (Direct Darshan)';
    if (waitEl) waitEl.textContent = `~${minWait} - ${maxWait} mins to Bappa`;

    if (stageEl) {
      stageEl.textContent = mandal.is_famous
        ? 'Maha Aarti & Continuous Sarvajanik Darshan'
        : 'Continuous Darshan & Devotee Offerings';
    }
  }

  bindPOVControls() {
    // Zoom in / out handlers for Darshan Photo
    const btnZoomIn = document.getElementById('btn-darshan-zoom-in');
    const btnZoomOut = document.getElementById('btn-darshan-zoom-out');
    const heroImg = document.getElementById('pov-hero-photo');
    const zoomLabel = document.getElementById('darshan-zoom-level');

    const applyZoom = () => {
      const z = this.darshanZooms[this.darshanZoomIndex];
      if (heroImg) {
        heroImg.className = `pov-hero-photo ${z.class}`;
      }
      if (zoomLabel) zoomLabel.textContent = z.label;
    };

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        if (this.darshanZoomIndex < this.darshanZooms.length - 1) {
          this.darshanZoomIndex++;
          applyZoom();
        }
      });
    }

    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        if (this.darshanZoomIndex > 0) {
          this.darshanZoomIndex--;
          applyZoom();
        }
      });
    }

    // Angle Selector Buttons (Pane: Bappa's Murti)
    document.querySelectorAll('.pov-angle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pov-angle-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.povAngle = btn.dataset.angle;
        this.updatePOVTelemetry();

        const mandal = this.povMandal;
        if (!mandal || !heroImg) return;

        const attrEl = document.getElementById('pov-photo-attribution');

        if (this.povAngle === 'entrance' && mandal.temple_image_url) {
          heroImg.src = mandal.temple_image_url;
          if (attrEl) attrEl.textContent = `📍 Source: Verified Temple Pravesh Dwar & Approach — ${mandal.name}`;
        } else {
          // Bappa's holy Murti (always idol, never temple exterior!)
          heroImg.src = mandal.image_url || '/images/mandals/dagdusheth_idol.jpg';
          if (attrEl) attrEl.textContent = `📍 Source: Verified Sacred Murti of ${mandal.name}`;
        }
      });
    });

    // POV Mode Tab Switcher (Wait Time vs Murti vs Traffic vs Social vs Stream)
    document.querySelectorAll('.pov-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('tab-disabled')) {
          this.showToast('ℹ️ Live Aarti webcast is currently offline for this mandal.');
          return;
        }
        const paneName = btn.dataset.pane;
        this.switchPOVTab(paneName);
      });
    });

    // Action buttons inside Live Rush Pane
    const btnRushMurti = document.getElementById('btn-rush-view-murti');
    if (btnRushMurti) {
      btnRushMurti.addEventListener('click', () => this.switchPOVTab('darshan'));
    }

    const btnRushTraffic = document.getElementById('btn-rush-check-traffic');
    if (btnRushTraffic) {
      btnRushTraffic.addEventListener('click', () => this.switchPOVTab('traffic'));
    }

    const btnRushSocial = document.getElementById('btn-rush-check-social');
    if (btnRushSocial) {
      btnRushSocial.addEventListener('click', () => this.switchPOVTab('social'));
    }

    // Shortcut jump buttons (.btn-goto-tab)
    document.querySelectorAll('.btn-goto-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.targetPane;
        if (target) this.switchPOVTab(target);
      });
    });

    // Close POV Modal & Back Navigation
    const btnClosePov = document.getElementById('btn-close-pov-modal');
    const btnBackPov = document.getElementById('btn-back-pov-modal');

    if (btnClosePov) {
      btnClosePov.addEventListener('click', () => {
        this.closePOVModal();
      });
    }

    if (btnBackPov) {
      btnBackPov.addEventListener('click', () => {
        this.closePOVModal();
      });
    }

    // Touch swipe-down to dismiss modal (CRED gesture)
    const povWin = document.querySelector('#pov-street-modal .modal-window');
    const dragHandle = document.getElementById('pov-drag-handle');
    if (povWin) {
      let startY = 0;
      let currentY = 0;
      let isDragging = false;

      const onTouchStart = (e) => {
        // Only allow drag if scrolled to top or touch is on header/handle
        const target = e.target;
        const isHeaderOrHandle = target.closest('.modal-header') || target.closest('#pov-drag-handle');
        const isScrolledTop = povWin.scrollTop <= 0;

        if (isHeaderOrHandle || isScrolledTop) {
          startY = e.touches[0].clientY;
          isDragging = true;
          povWin.style.transition = 'none';
        }
      };

      const onTouchMove = (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        if (deltaY > 0) {
          povWin.style.transform = `translateY(${deltaY}px)`;
        }
      };

      const onTouchEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        povWin.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
        const deltaY = currentY - startY;
        if (deltaY > 120) {
          povWin.style.transform = 'translateY(100%)';
          setTimeout(() => this.closePOVModal(), 220);
        } else {
          povWin.style.transform = 'translateY(0)';
        }
        startY = 0;
        currentY = 0;
      };

      povWin.addEventListener('touchstart', onTouchStart, { passive: true });
      povWin.addEventListener('touchmove', onTouchMove, { passive: true });
      povWin.addEventListener('touchend', onTouchEnd, { passive: true });
    }
  }

  closePOVModal() {
    const trafficIframe = document.getElementById('traffic-road-iframe');
    if (trafficIframe) trafficIframe.src = '';
    const modal = document.getElementById('pov-street-modal');
    if (modal) {
      modal.classList.remove('open');
      const win = modal.querySelector('.modal-window');
      if (win) win.style.transform = '';
    }
    this.stopPOVAudio();

    if (window.location.hash.startsWith('#mandal_') && !window._isPopStateHandling) {
      history.back();
    }
  }

  // -------------------------------------------------------------
  // Devotee Social Snaps (Strictly Last 5 in Latest Order)
  // -------------------------------------------------------------
  async loadSocialMediaAndStreams(mandalId) {
    try {
      const res = await fetch(`/api/mandals/${mandalId}/social`);
      const json = await res.json();
      if (!json.success || !json.media) return;

      const media = json.media;

      // 2. Update Hashtags
      const hashtagBar = document.getElementById('pov-hashtag-bar');
      if (hashtagBar) {
        hashtagBar.innerHTML = '';
        (media.hashtags || []).forEach((tag) => {
          const pill = document.createElement('span');
          pill.className = 'hashtag-pill';
          pill.textContent = tag;
          hashtagBar.appendChild(pill);
        });
      }

      // 3. Render Exactly 5 Devotee Posts in Latest Order
      // 3. Render Exactly 3 Authentic Devotee Embed Posts
      const socialGrid = document.getElementById('pov-social-grid');
      if (socialGrid) {
        socialGrid.innerHTML = '';
        const posts = (media.social_posts || []).slice(0, 3);

        posts.forEach((post) => {
          const card = document.createElement('div');
          card.className = 'social-card';
          const typeBadge = post.is_video ? 'LIVE / REEL' : 'PHOTO';
          const sourceBadge = post.source_label || 'Devotee View';
          const isYouTube = post.platform === 'youtube';
          const iconPlatform = post.platform === 'youtube' ? '▶' : (post.platform === 'instagram' ? '📸' : '📘');

          card.innerHTML = `
            <div class="social-card-media" id="media-${post.id}">
              <img src="${post.image_url}" alt="${post.caption}" loading="eager" />
              ${isYouTube && post.embed_url ? `
                <div class="yt-play-trigger" title="Click to watch live webcast">
                  <div class="yt-play-icon">▶</div>
                  <span class="yt-play-label">Watch Live Webcast</span>
                </div>
              ` : ''}
              <span class="social-type-badge">${typeBadge}</span>
              <span class="social-source-badge">${sourceBadge}</span>
            </div>
            <div class="social-card-body">
              <div class="social-card-author">
                <div style="display:flex; flex-direction:column; gap:2px; min-width:0;">
                  <div style="display:flex; align-items:center; gap:6px;">
                    <span style="color:var(--text-cream); font-weight:700;">${post.author_name}</span>
                    <span class="platform-tag platform-${post.platform}">${post.platform.toUpperCase()}</span>
                  </div>
                  ${post.contributor_name ? `
                    <div style="font-size:11px; color:#ffc72c; display:flex; align-items:center; gap:4px;">
                      <span>📸 Contributed by: <strong>${post.contributor_name}</strong></span>
                    </div>
                  ` : ''}
                </div>
              </div>
              <div class="social-card-caption">${post.caption}</div>
              <div class="social-card-meta">
                <span>💬 ${post.comments_count}</span>
                <span style="margin-left:auto; color:var(--accent-gold); font-family:var(--font-mono);">${post.time_ago}</span>
              </div>
              <div class="social-card-actions">
                <button class="embed-like-btn" id="like-${post.id}">
                  <span class="like-heart">❤️</span>
                  <span class="like-count">${post.likes_count}</span>
                </button>
                <a href="${post.post_url || '#'}" target="_blank" rel="noopener noreferrer" class="embed-platform-btn embed-${post.platform}">
                  ${iconPlatform} ${post.platform_action || 'Explore'} ↗
                </a>
              </div>
            </div>
          `;

          // Wire up YouTube Click-to-Play Embed
          const playTrigger = card.querySelector('.yt-play-trigger');
          if (playTrigger) {
            playTrigger.addEventListener('click', (e) => {
              e.stopPropagation();
              const mediaContainer = card.querySelector('.social-card-media');
              if (mediaContainer) {
                const originalHtml = mediaContainer.innerHTML;
                mediaContainer.innerHTML = `
                  <div style="position:relative; width:100%; height:100%; background:#000;">
                    <button class="yt-close-btn" title="Back to photo" style="position:absolute; top:6px; right:6px; z-index:10; background:rgba(0,0,0,0.8); color:#fff; border:1px solid rgba(255,255,255,0.4); border-radius:50%; width:24px; height:24px; cursor:pointer; font-size:12px; display:flex; align-items:center; justify-content:center;">✕</button>
                    <iframe 
                      src="${post.embed_url}" 
                      title="${post.caption}" 
                      frameborder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      referrerpolicy="strict-origin-when-cross-origin"
                      allowfullscreen 
                      style="width:100%; height:100%; border:none;"
                    ></iframe>
                  </div>
                `;
                const closeBtn = mediaContainer.querySelector('.yt-close-btn');
                if (closeBtn) {
                  closeBtn.addEventListener('click', (ce) => {
                    ce.stopPropagation();
                    mediaContainer.innerHTML = originalHtml;
                    const newTrigger = mediaContainer.querySelector('.yt-play-trigger');
                    if (newTrigger) {
                      newTrigger.addEventListener('click', (ne) => {
                        ne.stopPropagation();
                        playTrigger.click();
                      });
                    }
                  });
                }
              }
            });
          }

          // Wire up interactive Like button
          const likeBtn = card.querySelector(`#like-${post.id}`);
          if (likeBtn) {
            likeBtn.addEventListener('click', () => {
              if (!likeBtn.classList.contains('liked')) {
                likeBtn.classList.add('liked');
                const countSpan = likeBtn.querySelector('.like-count');
                if (countSpan) {
                  let val = parseFloat(countSpan.textContent) || 0;
                  countSpan.textContent = (val + 0.1).toFixed(1) + 'k';
                }
              }
            });
          }

          socialGrid.appendChild(card);
        });
      }
    } catch (err) {
      console.warn('[Social] Failed to fetch social & stream data:', err.message);
    }
  }



  // -------------------------------------------------------------
  // Ambient Temple Sound Synthesizer (Disabled as requested)
  // -------------------------------------------------------------
  togglePOVAudio() {}
  startPOVAudio() {}
  stopPOVAudio() {}

  // -------------------------------------------------------------
  // WebSocket Connection & Real-Time Sync
  // -------------------------------------------------------------
  connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/live?city=${this.currentCity}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log(`[WS] Connected to live stream for ${this.currentCity.toUpperCase()}`);
        if (this.pollInterval) {
          clearInterval(this.pollInterval);
          this.pollInterval = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleWebSocketMessage(msg);
        } catch (e) {
          console.error('[WS] Failed to parse message:', e);
        }
      };

      this.ws.onclose = () => {
        this.startRestPolling();
        setTimeout(() => this.connectWebSocket(), 10000);
      };

      this.ws.onerror = (err) => {
        console.warn('[WS] Serverless/unavailable, engaging polling fallback:', err);
        this.startRestPolling();
      };
    } catch (err) {
      console.warn('[WS] WebSocket init failed, engaging polling fallback:', err);
      this.startRestPolling();
    }
  }

  startRestPolling() {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(() => {
      this.loadCityData(this.currentCity);
    }, 25000);
  }

  handleWebSocketMessage(msg) {
    if (msg.type === 'LEADERBOARD_UPDATE' && msg.city === this.currentCity) {
      msg.leaderboard.forEach((item) => {
        const found = this.mandals.find((m) => m.id === item.mandal_id);
        if (found) {
          found.current_rank = item.rank;
          found.previous_rank = item.previous_rank;
          found.rank_change = item.rank_change;
          found.trend = item.trend;
          found.popularity_score = item.popularity_score;
          found.crowd_score = item.crowd_score;
          found.experience_score = item.experience_score;
          found.crowd_density = item.crowd_score;
          found.estimated_wait_minutes = item.estimated_wait_minutes;
          found.data_quality = item.data_quality;
        }
      });

      this.renderLeaderboard();
      this.renderMapMarkers();
      this.updateCityStats();
    } else if (msg.type === 'MANDAL_TELEMETRY' && msg.city === this.currentCity) {
      const found = this.mandals.find((m) => m.id === msg.mandal_id);
      if (found) {
        found.crowd_density = msg.crowd.density_score;
        found.estimated_wait_minutes = msg.crowd.estimated_wait_minutes;
      }
      if (this.selectedMandal && this.selectedMandal.id === msg.mandal_id) {
        this.updateModalTelemetry(msg.crowd, msg.stage);
      }
      if (this.povMandal && this.povMandal.id === msg.mandal_id) {
        this.updatePOVTelemetry();
      }
    }
  }

  // -------------------------------------------------------------
  // Smart Recommendations & Weather
  // -------------------------------------------------------------
  async openRecommendations(criterion = 'best_experience') {
    try {
      const res = await fetch(`/api/recommendations?city=${this.currentCity}&criterion=${criterion}`);
      const data = await res.json();
      if (!data.success) return;

      const container = document.getElementById('recommendations-container');
      container.innerHTML = '';

      data.recommendations.forEach((rec) => {
        const card = document.createElement('div');
        card.className = 'rec-card';
        card.style.cssText = 'background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:8px;padding:12px;margin-bottom:10px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;';
        card.innerHTML = `
          <div>
            <span class="brand-tag" style="background:rgba(245,158,11,0.2);color:var(--accent-gold);border-color:var(--accent-gold);">${rec.recommendation_badge}</span>
            <div style="font-size:14px;font-weight:700;color:var(--text-cream);margin-top:4px;">${rec.name}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${rec.reason}</div>
            <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">📍 ${rec.address}</div>
          </div>
          <div style="text-align:right;min-width:110px;">
            <div style="font-size:18px;font-weight:800;color:var(--accent-gold);">${rec.popularity_score} <span style="font-size:11px;color:var(--text-muted);">FAME</span></div>
            <div style="font-size:12px;color:var(--accent-saffron);font-weight:bold;">~${rec.estimated_wait_minutes} min wait</div>
            <button class="btn-card-action btn-stand-front" style="margin-top:8px;padding:4px 10px;font-size:11px;">👁️ Stand in Front</button>
          </div>
        `;

        card.addEventListener('click', () => {
          document.getElementById('recommendations-modal').classList.remove('open');
          this.openPOVModal(rec.mandal_id, 'crowd');
        });

        container.appendChild(card);
      });

      document.getElementById('recommendations-modal').classList.add('open');
    } catch (err) {
      console.error('[App] Failed to load recommendations:', err);
    }
  }

  async fetchWeather(citySlug) {
    try {
      const res = await fetch(`/api/weather/${citySlug}`);
      const data = await res.json();
      if (data.success && data.data) {
        const w = data.data;
        const tempEl = document.getElementById('weather-temp');
        const condEl = document.getElementById('weather-cond');
        if (tempEl) tempEl.textContent = `${w.temperatureC}°C`;
        if (condEl) condEl.textContent = w.condition;
      }
    } catch (err) {
      console.warn('[App] Weather fetch skipped:', err.message);
    }
  }

  // -------------------------------------------------------------
  // Event Bindings
  // -------------------------------------------------------------
  bindEvents() {
    // City Switcher Buttons
    const btnPune = document.getElementById('btn-city-pune');
    const btnMumbai = document.getElementById('btn-city-mumbai');

    if (btnPune) btnPune.addEventListener('click', () => this.switchCity('pune'));
    if (btnMumbai) btnMumbai.addEventListener('click', () => this.switchCity('mumbai'));

    // Top Sync Button
    const btnSync = document.getElementById('btn-sync-feeds');
    if (btnSync) {
      btnSync.addEventListener('click', () => this.syncFeeds());
    }

    // Map Floating "Stand in Front" Action Button
    const btnMapStandFront = document.getElementById('btn-map-stand-front');
    if (btnMapStandFront) {
      btnMapStandFront.addEventListener('click', () => {
        const topMandal = [...this.mandals].sort((a, b) => (a.current_rank || 999) - (b.current_rank || 999))[0];
        if (topMandal) {
          this.openPOVModal(topMandal.id, 'crowd');
        }
      });
    }

    // Map Tile Switcher (Dark Tactical <-> Satellite)
    const btnToggleTiles = document.getElementById('btn-toggle-tiles');
    if (btnToggleTiles) {
      btnToggleTiles.addEventListener('click', () => this.toggleMapTileMode());
    }

    // Heatmap Toggle
    const btnHeatmap = document.getElementById('btn-toggle-heatmap');
    if (btnHeatmap) {
      btnHeatmap.addEventListener('click', () => {
        this.heatmapVisible = !this.heatmapVisible;
        btnHeatmap.classList.toggle('active', this.heatmapVisible);
        btnHeatmap.querySelector('span').textContent = `🔥 Rush Heatmap: ${this.heatmapVisible ? 'ON' : 'OFF'}`;
        this.refreshHeatmap(this.currentCity);
      });
    }

    // Quick Darshan Filter
    const btnQuick = document.getElementById('btn-filter-quick');
    if (btnQuick) {
      btnQuick.addEventListener('click', () => {
        this.filters.quickOnly = !this.filters.quickOnly;
        btnQuick.classList.toggle('active', this.filters.quickOnly);
        btnQuick.querySelector('span').textContent = this.filters.quickOnly ? '⚡ Quick Darshan (&le;20m)' : '⚡ Quick Darshan';
        this.renderMapMarkers();
        this.renderLeaderboard();
      });
    }

    // Iconic Filter
    const btnFamous = document.getElementById('btn-filter-famous');
    if (btnFamous) {
      btnFamous.addEventListener('click', () => {
        this.filters.famousOnly = !this.filters.famousOnly;
        btnFamous.classList.toggle('active', this.filters.famousOnly);
        this.renderMapMarkers();
        this.renderLeaderboard();
      });
    }

    // Manache 5 Filter on Map
    const btnManache = document.getElementById('btn-filter-manache');
    if (btnManache) {
      btnManache.addEventListener('click', () => {
        this.filters.manacheOnly = !this.filters.manacheOnly;
        btnManache.classList.toggle('active', this.filters.manacheOnly);
        // Sync with quick chips in ranking panel
        const quickChips = document.querySelectorAll('.rank-filter-chip:not(.chip-map-jump)');
        quickChips.forEach((c) => {
          c.classList.toggle('active', c.dataset.filter === (this.filters.manacheOnly ? 'manache' : 'all'));
        });
        if (this.filters.manacheOnly && this.currentCity === 'mumbai') {
          this.showToast('Note: The 5 Manache Ganpatis are located in Pune.');
        }
        this.renderMapMarkers();
        this.renderLeaderboard();
      });
    }

    // Search Input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value.trim();
        this.renderLeaderboard();
        this.renderMapMarkers();
      });
    }

    // Recommendations Modal
    const btnOpenRec = document.getElementById('btn-open-recommendations');
    if (btnOpenRec) {
      btnOpenRec.addEventListener('click', () => {
        this.openRecommendations('best_experience');
      });
    }
    const btnCloseRec = document.getElementById('btn-close-rec-modal');
    if (btnCloseRec) {
      btnCloseRec.addEventListener('click', () => {
        document.getElementById('recommendations-modal').classList.remove('open');
        this.switchToMobileTab('rankings');
      });
    }

    document.querySelectorAll('.rec-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.rec-filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.openRecommendations(btn.dataset.criterion);
      });
    });

    // Mandal Modal "Stand in Front"
    const btnModalStandFront = document.getElementById('btn-modal-stand-front');
    if (btnModalStandFront) {
      btnModalStandFront.addEventListener('click', () => {
        if (this.selectedMandal) {
          const mandalId = this.selectedMandal.id;
          document.getElementById('mandal-modal').classList.remove('open');
          this.openPOVModal(mandalId, 'crowd');
        }
      });
    }

    // Mandal Modal Close
    const btnCloseMandalModal = document.getElementById('btn-close-mandal-modal');
    if (btnCloseMandalModal) {
      btnCloseMandalModal.addEventListener('click', () => {
        document.getElementById('mandal-modal').classList.remove('open');
        this.selectedMandal = null;
      });
    }

    // Admin Modal
    const btnOpenAdmin = document.getElementById('btn-open-admin');
    if (btnOpenAdmin) {
      btnOpenAdmin.addEventListener('click', () => {
        document.getElementById('admin-modal').classList.add('open');
      });
    }
    const btnCloseAdmin = document.getElementById('btn-close-admin-modal');
    if (btnCloseAdmin) {
      btnCloseAdmin.addEventListener('click', () => {
        document.getElementById('admin-modal').classList.remove('open');
      });
    }

    // Devotee Guide & Eco-Idols Modal
    const btnOpenGuide = document.getElementById('btn-open-devotee-guide');
    const modalGuide = document.getElementById('modal-devotee-guide');
    const btnCloseGuide = document.getElementById('btn-close-devotee-guide');
    if (btnOpenGuide && modalGuide) {
      btnOpenGuide.addEventListener('click', () => modalGuide.classList.add('open'));
    }
    if (btnCloseGuide && modalGuide) {
      btnCloseGuide.addEventListener('click', () => {
        modalGuide.classList.remove('open');
        this.switchToMobileTab('rankings');
      });
    }

    // Devotee Guide Navigation Tabs
    const guideTabBtns = document.querySelectorAll('.guide-tab-btn');
    guideTabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        guideTabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const targetTab = btn.dataset.guideTab;
        document.querySelectorAll('.guide-tab-pane').forEach((pane) => {
          pane.style.display = pane.id === `guide-pane-${targetTab}` ? 'block' : 'none';
        });
      });
    });

    // Devotee Guide Real-Time Search Filter
    const guideSearchInput = document.getElementById('guide-search-input');
    if (guideSearchInput) {
      guideSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const activePane = document.querySelector('.guide-tab-pane[style*="display: block"]') || document.querySelector('.guide-tab-pane.active');
        const itemsToFilter = document.querySelectorAll('.guide-card, .guide-list-item, .faq-item');
        itemsToFilter.forEach((item) => {
          const text = item.textContent.toLowerCase();
          if (!query || text.includes(query)) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    }

    // Security Certification Modal
    const btnOpenCert = document.getElementById('btn-open-cert-modal');
    const modalCert = document.getElementById('modal-cert-details');
    const btnCloseCert = document.getElementById('btn-close-cert-modal');
    if (btnOpenCert && modalCert) {
      btnOpenCert.addEventListener('click', () => modalCert.classList.add('open'));
    }
    if (btnCloseCert && modalCert) {
      btnCloseCert.addEventListener('click', () => modalCert.classList.remove('open'));
    }
  }

  async switchCity(citySlug) {
    if (this.currentCity === citySlug) return;
    this.currentCity = citySlug;

    document.getElementById('btn-city-pune').classList.toggle('active', citySlug === 'pune');
    document.getElementById('btn-city-mumbai').classList.toggle('active', citySlug === 'mumbai');

    // Dynamic Tagline update based on active tab
    const taglineEl = document.getElementById('brand-tagline');
    if (taglineEl) {
      taglineEl.textContent = citySlug === 'pune'
        ? "Pune's most popular ganesh mandal's website"
        : "Mumbai's most popular ganesh mandal's website";
    }

    // Dynamic Document Title update for SEO
    const cityName = citySlug === 'pune' ? "Pune's" : "Mumbai's";
    document.title = `GaneshMandal.in — ${cityName} Most Popular Ganesh Mandals Website | Live Darshan & Crowd Intelligence`;

    const coords = CITY_COORDS[citySlug];
    if (coords) {
      this.safeMapFlyTo(coords.lat, coords.lng, coords.zoom, 1.5);
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'SUBSCRIBE_CITY', city: citySlug }));
    }

    await this.loadCityData(citySlug);
    this.fetchWeather(citySlug);
  }

  // -------------------------------------------------------------
  // Sponsor Ads Management (Monetization & Seva Partners)
  // -------------------------------------------------------------
  async loadSponsorAds() {
    try {
      const res = await fetch('/api/ads');
      const data = await res.json();
      if (data.success && Array.isArray(data.ads)) {
        this.sponsorAds = data.ads;
        this.renderSponsorAds();
        this.renderLeaderboard();
      }
    } catch (err) {
      console.warn('[Ads] Failed to load sponsor ads:', err);
    }
  }

  renderSponsorAds() {
    const banner = document.getElementById('ad-banner-top');
    if (!banner) return;
    const topAd = (this.sponsorAds && this.sponsorAds.find((a) => a.placement === 'top_banner')) || this.sponsorAds?.[0];
    if (topAd) {
      banner.style.display = 'flex';
      banner.innerHTML = `
        <div class="ad-banner-content">
          <span class="ad-badge">${topAd.badge_text || 'SEVA PARTNER'}</span>
          <span class="ad-text">${topAd.sponsor_name} — ${topAd.description}</span>
          <a href="${topAd.cta_url || '#'}" target="_blank" rel="noopener noreferrer" class="ad-cta">${topAd.cta_text || 'Prasad & Seva ↗'}</a>
        </div>
      `;
    } else {
      banner.style.display = 'none';
    }
  }

  // -------------------------------------------------------------
  // Community & Partnerships Modal (Suggest Mandal + Advertiser Inquiries)
  // Flowing to softwareasg@gmail.com
  // -------------------------------------------------------------
  openCommunityModal(tab = 'suggest') {
    const modal = document.getElementById('suggest-modal');
    if (!modal) return;
    modal.classList.add('open');

    const tabSuggest = document.getElementById('tab-btn-suggest');
    const tabAdv = document.getElementById('tab-btn-advertise');
    const paneSuggest = document.getElementById('pane-suggest-mandal');
    const paneAdv = document.getElementById('pane-advertise-contact');
    const title = document.getElementById('community-modal-title');
    const tag = document.getElementById('community-modal-tag');

    if (tab === 'advertise') {
      if (tabSuggest) tabSuggest.classList.remove('active');
      if (tabAdv) tabAdv.classList.add('active');
      if (paneSuggest) paneSuggest.style.display = 'none';
      if (paneAdv) paneAdv.style.display = 'block';
      if (title) title.textContent = 'Advertise / Sponsor (जाहिरात करा)';
      if (tag) tag.textContent = 'SPONSOR';
    } else {
      if (tabSuggest) tabSuggest.classList.add('active');
      if (tabAdv) tabAdv.classList.remove('active');
      if (paneSuggest) paneSuggest.style.display = 'block';
      if (paneAdv) paneAdv.style.display = 'none';
      if (title) title.textContent = 'Suggest a Mandal (सुचवा)';
      if (tag) tag.textContent = 'COMMUNITY';
    }
  }

  bindSuggestControls() {
    const modal = document.getElementById('suggest-modal');
    const btnOpenSuggest = document.getElementById('btn-open-suggest');
    const btnOpenAdvertise = document.getElementById('btn-open-advertise');
    const btnClose = document.getElementById('btn-close-suggest-modal');
    const formSuggest = document.getElementById('form-suggest-mandal');
    const formAdvertise = document.getElementById('form-advertise-contact');

    const tabSuggest = document.getElementById('tab-btn-suggest');
    const tabAdv = document.getElementById('tab-btn-advertise');

    if (btnOpenSuggest) {
      btnOpenSuggest.addEventListener('click', () => {
        this.openCommunityModal('suggest');
      });
    }

    if (btnOpenAdvertise) {
      btnOpenAdvertise.addEventListener('click', () => {
        this.openCommunityModal('advertise');
      });
    }

    if (tabSuggest) {
      tabSuggest.addEventListener('click', () => {
        this.openCommunityModal('suggest');
      });
    }

    if (tabAdv) {
      tabAdv.addEventListener('click', () => {
        this.openCommunityModal('advertise');
      });
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        if (modal) modal.classList.remove('open');
      });
    }

    // Mandal Suggestion Submit Handler
    if (formSuggest) {
      formSuggest.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mapsUrl = document.getElementById('suggest-maps-url')?.value.trim();
        const email = document.getElementById('suggest-email')?.value.trim();
        const mandalName = document.getElementById('suggest-mandal-name')?.value.trim();
        const city = document.getElementById('suggest-city')?.value || 'pune';
        const notes = document.getElementById('suggest-notes')?.value.trim();

        if (!mapsUrl || !email) {
          alert('Please enter both Google Maps link and your email ID.');
          return;
        }

        try {
          const res = await fetch('/api/suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              google_maps_url: mapsUrl,
              visitor_email: email,
              mandal_name: mandalName,
              city,
              notes,
            }),
          });
          const json = await res.json();
          if (json.success) {
            formSuggest.reset();
            if (modal) modal.classList.remove('open');
            this.showToast('🙏 Bappa blessing! Suggestion received & dispatched to softwareasg@gmail.com.');
          } else {
            alert(json.message || 'Could not submit suggestion.');
          }
        } catch (err) {
          console.error('[Suggest] Submission failed:', err);
          alert('Failed to send suggestion. Please check your connection.');
        }
      });
    }

    // Advertiser Inquiry Submit Handler
    if (formAdvertise) {
      formAdvertise.addEventListener('submit', async (e) => {
        e.preventDefault();
        const brandName = document.getElementById('adv-brand-name')?.value.trim();
        const contactName = document.getElementById('adv-contact-name')?.value.trim();
        const email = document.getElementById('adv-email')?.value.trim();
        const phone = document.getElementById('adv-phone')?.value.trim();
        const city = document.getElementById('adv-city')?.value || 'both';
        const placement = document.getElementById('adv-placement')?.value || 'leaderboard';
        const budget = document.getElementById('adv-budget')?.value || 'flexible';
        const message = document.getElementById('adv-message')?.value.trim();

        if (!brandName || !contactName || !email || !phone) {
          alert('Please enter Brand name, Contact person, Email ID, and Phone number.');
          return;
        }

        try {
          const res = await fetch('/api/advertisers/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              brand_name: brandName,
              contact_name: contactName,
              email,
              phone,
              target_city: city,
              placement_interest: placement,
              budget_range: budget,
              message,
            }),
          });
          const json = await res.json();
          if (json.success) {
            formAdvertise.reset();
            if (modal) modal.classList.remove('open');
            this.showToast('📢 Inquiry received! Dispatched to softwareasg@gmail.com. We will contact you soon.');
          } else {
            alert(json.message || 'Could not submit inquiry.');
          }
        } catch (err) {
          console.error('[Advertiser] Submission failed:', err);
          alert('Failed to submit advertising inquiry. Please check your connection.');
        }
      });
    }
  }

  // -------------------------------------------------------------
  // Admin Portal Controls (Password asg12345$)
  // Strictly Add/Delete Mandal and Add/Delete Sponsor Ads
  // -------------------------------------------------------------
  bindAdminControls() {
    const modal = document.getElementById('admin-modal');
    const btnOpen = document.getElementById('btn-open-admin');
    const btnClose = document.getElementById('btn-close-admin-modal');
    const loginView = document.getElementById('admin-login-view');
    const dashView = document.getElementById('admin-dashboard-view');
    const authBadge = document.getElementById('admin-auth-badge');
    const loginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('admin-login-error');
    const btnLogout = document.getElementById('btn-admin-logout');

    const updateAdminView = () => {
      const isAuth = this.adminToken === 'asg12345$';
      if (isAuth) {
        if (loginView) loginView.style.display = 'none';
        if (dashView) dashView.style.display = 'block';
        if (authBadge) {
          authBadge.textContent = 'ADMIN AUTHENTICATED';
          authBadge.style.color = '#10b981';
          authBadge.style.borderColor = '#10b981';
        }
        this.renderAdminMandals();
        this.renderAdminAds();
        this.renderAdminSuggestions();
        this.renderAdminAdvertisers();
      } else {
        if (loginView) loginView.style.display = 'block';
        if (dashView) dashView.style.display = 'none';
        if (authBadge) {
          authBadge.textContent = 'AUTHENTICATION REQUIRED';
          authBadge.style.color = 'var(--accent-gold)';
          authBadge.style.borderColor = 'var(--border-color)';
        }
      }
    };

    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        updateAdminView();
        if (modal) modal.classList.add('open');
      });
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        if (modal) modal.classList.remove('open');
      });
    }

    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        this.adminToken = null;
        sessionStorage.removeItem('asg_admin_token');
        updateAdminView();
        this.showToast('Admin logged out.');
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pwd = document.getElementById('admin-password-input')?.value.trim();
        if (loginError) loginError.style.display = 'none';

        try {
          const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwd }),
          });
          const json = await res.json();
          if (json.success) {
            this.adminToken = json.token || pwd;
            sessionStorage.setItem('asg_admin_token', this.adminToken);
            document.getElementById('admin-password-input').value = '';
            updateAdminView();
            this.showToast('Admin logged in successfully.');
          } else {
            if (loginError) {
              loginError.textContent = json.message || 'Incorrect password.';
              loginError.style.display = 'block';
            }
          }
        } catch (err) {
          if (loginError) {
            loginError.textContent = 'Login request failed. Please check connection.';
            loginError.style.display = 'block';
          }
        }
      });
    }

    // Tab switching inside Admin
    document.querySelectorAll('.admin-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        const paneMandals = document.getElementById('admin-pane-mandals');
        const paneAds = document.getElementById('admin-pane-ads');
        const paneSug = document.getElementById('admin-pane-suggestions');
        const paneAdv = document.getElementById('admin-pane-advertisers');
        const paneHeatmap = document.getElementById('admin-pane-heatmap');
        if (paneMandals) paneMandals.style.display = tab === 'mandals' ? 'block' : 'none';
        if (paneAds) paneAds.style.display = tab === 'ads' ? 'block' : 'none';
        if (paneSug) paneSug.style.display = tab === 'suggestions' ? 'block' : 'none';
        if (paneAdv) paneAdv.style.display = tab === 'advertisers' ? 'block' : 'none';
        if (paneHeatmap) paneHeatmap.style.display = tab === 'heatmap' ? 'block' : 'none';
        if (tab === 'advertisers') this.renderAdminAdvertisers();
        if (tab === 'heatmap') this.renderAdminHeatmap();
      });
    });

    // Add Mandal Form Submit
    const addMandalForm = document.getElementById('admin-add-mandal-form');
    if (addMandalForm) {
      addMandalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('admin-mandal-name')?.value.trim();
        const city_id = document.getElementById('admin-mandal-city')?.value || 'pune';
        const latitude = parseFloat(document.getElementById('admin-mandal-lat')?.value);
        const longitude = parseFloat(document.getElementById('admin-mandal-lng')?.value);
        const address = document.getElementById('admin-mandal-address')?.value.trim();
        const image_url = document.getElementById('admin-mandal-image')?.value.trim() || '/images/mandals/dagdusheth_idol.jpg';
        const temple_image_url = document.getElementById('admin-mandal-temple-image')?.value.trim() || '';
        const description = document.getElementById('admin-mandal-desc')?.value.trim();

        try {
          const res = await fetch('/api/admin/mandals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Admin-Password': this.adminToken,
            },
            body: JSON.stringify({
              name,
              city_id,
              latitude,
              longitude,
              address,
              image_url,
              temple_image_url,
              description,
            }),
          });
          const json = await res.json();
          if (json.success) {
            addMandalForm.reset();
            this.showToast(`🙏 Mandal '${name}' added successfully!`);
            await this.loadCityData(this.currentCity);
            this.renderAdminMandals();
          } else {
            alert(json.message || 'Failed to add mandal.');
          }
        } catch (err) {
          console.error('[Admin] Add mandal error:', err);
          alert('Network error adding mandal.');
        }
      });
    }

    // Add & Edit Sponsor Ad Form Submit
    const addAdForm = document.getElementById('admin-add-ad-form');
    const adPlacementEl = document.getElementById('admin-ad-placement');
    const adRankGroup = document.getElementById('group-ad-rank');
    if (adPlacementEl && adRankGroup) {
      adPlacementEl.addEventListener('change', () => {
        adRankGroup.style.display = adPlacementEl.value === 'leaderboard' ? 'block' : 'none';
      });
    }

    const cancelEditBtn = document.getElementById('btn-cancel-edit-ad');
    if (cancelEditBtn && addAdForm) {
      cancelEditBtn.addEventListener('click', () => {
        addAdForm.reset();
        document.getElementById('admin-ad-edit-id').value = '';
        document.getElementById('btn-submit-ad').textContent = '+ Publish Sponsor Ad';
        cancelEditBtn.style.display = 'none';
      });
    }

    if (addAdForm) {
      addAdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('admin-ad-edit-id')?.value.trim();
        const sponsor_name = document.getElementById('admin-ad-sponsor')?.value.trim();
        const placement = document.getElementById('admin-ad-placement')?.value || 'leaderboard';
        const insert_after_rank = parseInt(document.getElementById('admin-ad-rank')?.value || '2', 10);
        const badge_text = document.getElementById('admin-ad-badge')?.value.trim() || 'SPONSORED PARTNER';
        const cta_text = document.getElementById('admin-ad-cta-text')?.value.trim() || 'Learn More ↗';
        const cta_url = document.getElementById('admin-ad-cta-url')?.value.trim() || '#';
        const description = document.getElementById('admin-ad-desc')?.value.trim();

        const url = editId ? `/api/admin/ads/${editId}` : '/api/admin/ads';
        const method = editId ? 'PUT' : 'POST';

        try {
          const res = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'X-Admin-Password': this.adminToken,
            },
            body: JSON.stringify({
              sponsor_name,
              placement,
              insert_after_rank,
              badge_text,
              cta_text,
              cta_url,
              description,
            }),
          });
          const json = await res.json();
          if (json.success) {
            addAdForm.reset();
            document.getElementById('admin-ad-edit-id').value = '';
            document.getElementById('btn-submit-ad').textContent = '+ Publish Sponsor Ad';
            if (cancelEditBtn) cancelEditBtn.style.display = 'none';
            this.showToast(editId ? `✏️ Sponsor Ad for '${sponsor_name}' updated!` : `📢 Sponsor Ad for '${sponsor_name}' published!`);
            await this.loadSponsorAds();
            this.renderAdminAds();
            this.renderLeaderboard();
          } else {
            alert(json.message || 'Failed to save sponsor ad.');
          }
        } catch (err) {
          console.error('[Admin] Ad save error:', err);
          alert('Network error saving sponsor ad.');
        }
      });
    }
  }

  async renderAdminMandals() {
    const tbody = document.getElementById('admin-mandals-tbody');
    const countEl = document.getElementById('admin-mandals-count');
    if (!tbody) return;

    try {
      const [puneRes, mumbaiRes] = await Promise.all([
        fetch('/api/cities/pune/mandals').then((r) => r.json()),
        fetch('/api/cities/mumbai/mandals').then((r) => r.json()),
      ]);
      const list = [
        ...(puneRes.success ? puneRes.data.map((m) => ({ ...m, cityName: 'Pune' })) : []),
        ...(mumbaiRes.success ? mumbaiRes.data.map((m) => ({ ...m, cityName: 'Mumbai' })) : []),
      ];

      if (countEl) countEl.textContent = `${list.length} Mandals`;
      tbody.innerHTML = '';

      list.forEach((m) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border-subtle)';
        tr.innerHTML = `
          <td style="padding:8px 6px; font-weight:600; color:var(--text-cream);">${m.name}</td>
          <td style="padding:8px 6px;"><span class="brand-tag">${m.cityName}</span></td>
          <td style="padding:8px 6px; color:var(--text-muted); font-size:11px;">${m.address || '-'}</td>
          <td style="padding:8px 6px; text-align:right;">
            <button class="btn-danger btn-delete-mandal" data-id="${m.id}" data-name="${m.name}">🗑️ Delete</button>
          </td>
        `;

        tr.querySelector('.btn-delete-mandal').addEventListener('click', async (e) => {
          const id = e.target.dataset.id;
          const name = e.target.dataset.name;
          if (!confirm(`Are you sure you want to delete '${name}'? This cannot be undone.`)) return;

          try {
            const res = await fetch(`/api/admin/mandals/${id}`, {
              method: 'DELETE',
              headers: { 'X-Admin-Password': this.adminToken },
            });
            const json = await res.json();
            if (json.success) {
              this.showToast(`🗑️ Mandal '${name}' deleted.`);
              await this.loadCityData(this.currentCity);
              this.renderAdminMandals();
            } else {
              alert(json.message || 'Delete failed.');
            }
          } catch (err) {
            alert('Error deleting mandal.');
          }
        });

        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('[Admin] Failed to load mandals for admin:', err);
    }
  }

  renderAdminAds() {
    const container = document.getElementById('admin-ads-list');
    if (!container) return;
    container.innerHTML = '';

    if (!this.sponsorAds || this.sponsorAds.length === 0) {
      container.innerHTML = '<div style="color:var(--text-dim); font-size:12px; padding:10px;">No active sponsor ads currently.</div>';
      return;
    }

    this.sponsorAds.forEach((ad) => {
      const card = document.createElement('div');
      card.className = 'admin-ad-item';
      const slotBadge = ad.placement === 'leaderboard'
        ? `<span class="quality-badge" style="background:#2563eb; color:#fff;">Slot: After #${ad.insert_after_rank || 2}</span>`
        : '';

      card.innerHTML = `
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap;">
            <strong style="color:var(--accent-gold); font-size:13px;">${ad.sponsor_name}</strong>
            <span class="brand-tag">${ad.placement.toUpperCase()}</span>
            ${slotBadge}
            <span class="quality-badge">${ad.badge_text}</span>
          </div>
          <div style="font-size:12px; color:var(--text-main); margin-bottom:4px;">${ad.description}</div>
          <a href="${ad.cta_url}" target="_blank" rel="noopener noreferrer" style="font-size:11px; color:var(--accent-saffron);">${ad.cta_text} ↗</a>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <button class="btn-card-action btn-edit-ad" style="border-color:var(--accent-gold); color:var(--accent-gold);" data-id="${ad.id}">✏️ Edit</button>
          <button class="btn-danger btn-delete-ad" data-id="${ad.id}">🗑️ Delete</button>
        </div>
      `;

      // Edit Button Handler
      card.querySelector('.btn-edit-ad').addEventListener('click', () => {
        const editIdInput = document.getElementById('admin-ad-edit-id');
        const sponsorInput = document.getElementById('admin-ad-sponsor');
        const placementSelect = document.getElementById('admin-ad-placement');
        const rankInput = document.getElementById('admin-ad-rank');
        const rankGroup = document.getElementById('group-ad-rank');
        const badgeInput = document.getElementById('admin-ad-badge');
        const ctaTextInput = document.getElementById('admin-ad-cta-text');
        const ctaUrlInput = document.getElementById('admin-ad-cta-url');
        const descInput = document.getElementById('admin-ad-desc');
        const submitBtn = document.getElementById('btn-submit-ad');
        const cancelBtn = document.getElementById('btn-cancel-edit-ad');

        if (editIdInput) editIdInput.value = ad.id;
        if (sponsorInput) sponsorInput.value = ad.sponsor_name;
        if (placementSelect) {
          placementSelect.value = ad.placement;
          if (rankGroup) rankGroup.style.display = ad.placement === 'leaderboard' ? 'block' : 'none';
        }
        if (rankInput) rankInput.value = ad.insert_after_rank || 2;
        if (badgeInput) badgeInput.value = ad.badge_text || '';
        if (ctaTextInput) ctaTextInput.value = ad.cta_text || '';
        if (ctaUrlInput) ctaUrlInput.value = ad.cta_url || '';
        if (descInput) descInput.value = ad.description || '';
        if (submitBtn) submitBtn.textContent = '💾 Save Changes to Ad';
        if (cancelBtn) cancelBtn.style.display = 'inline-flex';

        document.getElementById('admin-pane-ads')?.scrollIntoView({ behavior: 'smooth' });
        this.showToast(`✏️ Editing '${ad.sponsor_name}'. Update fields and click Save.`);
      });

      // Delete Button Handler
      card.querySelector('.btn-delete-ad').addEventListener('click', async () => {
        if (!confirm(`Delete sponsor ad for '${ad.sponsor_name}'?`)) return;
        try {
          const res = await fetch(`/api/admin/ads/${ad.id}`, {
            method: 'DELETE',
            headers: { 'X-Admin-Password': this.adminToken },
          });
          const json = await res.json();
          if (json.success) {
            this.showToast(`🗑️ Sponsor ad for '${ad.sponsor_name}' deleted.`);
            await this.loadSponsorAds();
            this.renderAdminAds();
            this.renderLeaderboard();
          } else {
            alert(json.message || 'Delete failed.');
          }
        } catch (err) {
          alert('Error deleting ad.');
        }
      });

      container.appendChild(card);
    });
  }

  async renderAdminSuggestions() {
    const container = document.getElementById('admin-suggestions-list');
    const countBadge = document.getElementById('admin-sug-count');
    if (!container) return;
    container.innerHTML = '<div style="color:var(--text-dim); font-size:12px;">Loading suggestions...</div>';

    try {
      const res = await fetch('/api/admin/suggestions', {
        headers: { 'X-Admin-Password': this.adminToken },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.suggestions)) {
        if (countBadge) countBadge.textContent = json.suggestions.length;
        container.innerHTML = '';
        if (json.suggestions.length === 0) {
          container.innerHTML = '<div style="color:var(--text-dim); font-size:12px; padding:10px;">No visitor suggestions submitted yet.</div>';
          return;
        }

        json.suggestions.forEach((sug) => {
          const item = document.createElement('div');
          item.className = 'admin-suggestion-item';
          const time = new Date(sug.created_at).toLocaleString();
          item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong style="color:var(--text-cream); font-size:13px;">${sug.mandal_name || 'Suggested Mandal'}</strong>
              <span class="brand-tag">${(sug.city || 'pune').toUpperCase()}</span>
            </div>
            <div style="font-size:11px; color:var(--text-muted);">
              <span>✉️ Devotee: <strong>${sug.visitor_email}</strong></span> • <span>🕒 ${time}</span>
            </div>
            <div>
              <a href="${sug.google_maps_url}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-gold); font-size:11px; text-decoration:underline;">
                📍 ${sug.google_maps_url} ↗
              </a>
            </div>
            ${sug.notes ? `<div style="font-size:11px; color:var(--text-dim); background:rgba(0,0,0,0.3); padding:6px; border-radius:4px;">${sug.notes}</div>` : ''}
          `;
          container.appendChild(item);
        });
      }
    } catch (err) {
      container.innerHTML = '<div style="color:#ef4444; font-size:12px;">Failed to load suggestions.</div>';
    }
  }

  async renderAdminAdvertisers() {
    const container = document.getElementById('admin-advertisers-list');
    const countBadge = document.getElementById('admin-adv-count');
    if (!container) return;

    container.innerHTML = '<div style="color:var(--text-dim); font-size:12px; padding:10px;">Loading advertiser inquiries...</div>';

    try {
      const res = await fetch('/api/admin/advertisers', {
        headers: { 'X-Admin-Password': this.adminToken },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.inquiries)) {
        if (countBadge) countBadge.textContent = json.inquiries.length;
        container.innerHTML = '';
        if (json.inquiries.length === 0) {
          container.innerHTML = '<div style="color:var(--text-dim); font-size:12px; padding:10px;">No advertiser leads received yet.</div>';
          return;
        }

        json.inquiries.forEach((adv) => {
          const item = document.createElement('div');
          item.className = 'admin-advertiser-item';
          const time = new Date(adv.created_at).toLocaleString();
          item.innerHTML = `
            <div class="admin-advertiser-header">
              <strong style="color:var(--text-cream); font-size:14px;">${adv.brand_name}</strong>
              <span class="admin-advertiser-badge">${(adv.target_city || 'ALL').toUpperCase()}</span>
            </div>
            <div style="font-size:12px; color:var(--text-muted); display:flex; flex-wrap:wrap; gap:12px;">
              <span>👤 Contact: <strong>${adv.contact_name}</strong></span>
              <span>✉️ <a href="mailto:${adv.email}" style="color:var(--accent-gold); text-decoration:underline;">${adv.email}</a></span>
              <span>📱 <a href="tel:${adv.phone}" style="color:var(--accent-gold); text-decoration:underline;">${adv.phone}</a></span>
            </div>
            <div style="font-size:11px; color:var(--text-dim); display:flex; gap:10px; flex-wrap:wrap;">
              <span style="background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:4px;">Slot: <strong>${adv.placement_interest}</strong></span>
              <span style="background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:4px;">Budget: <strong>${adv.budget_range}</strong></span>
              <span>🕒 ${time}</span>
            </div>
            ${adv.message ? `<div style="font-size:11px; color:var(--text-dim); background:rgba(0,0,0,0.3); padding:8px; border-radius:4px;">${adv.message}</div>` : ''}
          `;
          container.appendChild(item);
        });
      }
    } catch (err) {
      container.innerHTML = '<div style="color:#ef4444; font-size:12px;">Failed to load advertiser leads.</div>';
    }
  }

  // -------------------------------------------------------------
  // Privacy-Preserving Devotee Telemetry & Visual Section Heatmap
  // -------------------------------------------------------------
  trackPageView() {
    try {
      const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const device = isMobile ? 'mobile' : 'desktop';
      let ref = 'direct';
      if (document.referrer) {
        const r = document.referrer.toLowerCase();
        if (r.includes('whatsapp') || r.includes('wa.me')) ref = 'whatsapp';
        else if (r.includes('google')) ref = 'google';
        else if (r.includes('twitter') || r.includes('t.co')) ref = 'twitter';
        else ref = 'other';
      }
      const city = this.currentCity || 'pune';

      const payload = JSON.stringify({
        type: 'pageview',
        feature: 'pageview',
        city,
        device,
        referrerSource: ref
      });

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/telemetry/event', blob);
      } else {
        fetch('/api/telemetry/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        }).catch(() => {});
      }
    } catch (_) {}
  }

  trackInteraction(feature, mandalId = null) {
    try {
      if (!feature) return;
      const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const payload = JSON.stringify({
        type: 'click',
        feature,
        mandalId,
        city: this.currentCity || 'pune',
        device: isMobile ? 'mobile' : 'desktop'
      });

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/telemetry/event', blob);
      } else {
        fetch('/api/telemetry/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        }).catch(() => {});
      }
    } catch (_) {}
  }

  async renderAdminHeatmap() {
    const totalViewsEl = document.getElementById('heat-total-views');
    const uniqueVisitorsEl = document.getElementById('heat-unique-visitors');
    const topSourceEl = document.getElementById('heat-top-source');
    const topDeviceEl = document.getElementById('heat-top-device');
    const wireframeContainer = document.getElementById('heat-wireframe-container');
    const mandalsListEl = document.getElementById('heat-top-mandals-list');

    if (!wireframeContainer) return;
    wireframeContainer.innerHTML = '<div style="color:var(--text-dim); padding:16px;">Loading heatmap data...</div>';

    try {
      const res = await fetch('/api/admin/traffic-heatmap', {
        headers: {
          'X-Admin-Password': this.adminToken || 'asg12345$'
        }
      });
      if (!res.ok) throw new Error('Unauthorized or failed to fetch heatmap');
      const data = await res.json();

      if (totalViewsEl) totalViewsEl.textContent = Number(data.total_views || 0).toLocaleString('en-IN');
      if (uniqueVisitorsEl) uniqueVisitorsEl.textContent = Number(data.unique_sessions || 0).toLocaleString('en-IN');
      if (topSourceEl) topSourceEl.textContent = data.top_source || 'Direct / WhatsApp';
      if (topDeviceEl) topDeviceEl.textContent = data.top_device || 'Mobile (Phones)';

      // Feature Wireframe Heatmap Cards
      wireframeContainer.innerHTML = '';
      const heatItems = data.feature_heat || [];
      if (heatItems.length === 0) {
        wireframeContainer.innerHTML = '<div style="color:var(--text-dim); padding:16px;">No interaction telemetry recorded yet. Clicks and views will illuminate sections here.</div>';
      } else {
        heatItems.forEach((item) => {
          const card = document.createElement('div');
          card.className = `heat-wireframe-item ${item.temp_class || 'temp-moderate'}`;
          card.innerHTML = `
            <div class="heat-wireframe-header">
              <span class="heat-wireframe-label">${item.feature_name}</span>
              <span class="heat-wireframe-badge ${item.badge_class}">${item.temp_label}</span>
            </div>
            <div class="heat-wireframe-bar-wrap">
              <div class="heat-wireframe-bar ${item.temp_class || 'temp-moderate'}" style="width:${Math.max(6, item.percentage || 0)}%;"></div>
            </div>
            <div class="heat-wireframe-meta">
              <span><strong>${(item.clicks || 0).toLocaleString('en-IN')}</strong> interactions</span>
              <span><strong>${item.percentage || 0}%</strong> devotee focus</span>
            </div>
          `;
          wireframeContainer.appendChild(card);
        });
      }

      // Top Mandals List
      if (mandalsListEl) {
        mandalsListEl.innerHTML = '';
        const topMandals = data.top_mandals || [];
        if (topMandals.length === 0) {
          mandalsListEl.innerHTML = '<div style="color:var(--text-dim); padding:12px; font-size:12px;">No mandal-specific interactions recorded yet.</div>';
        } else {
          const maxClicks = Math.max(1, topMandals[0]?.clicks || 1);
          topMandals.forEach((m, idx) => {
            const row = document.createElement('div');
            row.className = 'heat-mandal-row';
            const pct = Math.round((m.clicks / maxClicks) * 100);
            row.innerHTML = `
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:12px; font-weight:800; color:var(--accent-gold); width:24px;">#${idx + 1}</span>
                  <strong style="color:var(--text-cream); font-size:13px;">${m.mandal_name || m.mandal_id}</strong>
                </div>
                <span style="font-size:12px; font-weight:700; color:#38bdf8;">${m.clicks.toLocaleString('en-IN')} clicks</span>
              </div>
              <div class="heat-wireframe-bar-wrap" style="height:6px; margin:4px 0 0 0;">
                <div class="heat-wireframe-bar temp-hot" style="width:${pct}%; height:100%;"></div>
              </div>
            `;
            mandalsListEl.appendChild(row);
          });
        }
      }
    } catch (err) {
      console.error('[Admin Heatmap] Failed to render:', err);
      wireframeContainer.innerHTML = '<div style="color:#ef4444; padding:16px;">Failed to load heatmap data. Please check password authentication.</div>';
    }
  }

  // -------------------------------------------------------------
  // Live Devotee Visitor Counter (वेबसाइट दर्शनार्थी उपस्थिती)
  // Baseline: 126,839 + Daily growth >= 11,836 + Random (10,000-12,000)
  // -------------------------------------------------------------
  initVisitorCounter() {
    const counterEl = document.getElementById('visitor-counter-val');
    if (!counterEl) return;

    // Festival anchor date: Sept 7, 2026 (or today relative to anchor)
    const BASE_START_TIMESTAMP = new Date('2026-09-07T00:00:00+05:30').getTime();
    const BASE_START_COUNT = 126839;

    const computeExpectedVisitors = () => {
      const now = Date.now();
      const elapsedMs = Math.max(0, now - BASE_START_TIMESTAMP);
      const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

      // Deterministic cumulative daily growth: at least 11,836 per day
      // plus seeded variance between 10,000 and 12,000 per day
      // (11,836 base + seeded random ~ 10,950 = ~22,786 daily devotees)
      const fullDays = Math.floor(elapsedDays);
      const partialDayFraction = elapsedDays - fullDays;

      let totalVisitors = BASE_START_COUNT;

      for (let day = 0; day < fullDays; day++) {
        // Seeded pseudo-random variance between 10,000 and 12,000 per day
        const seed = Math.sin(day + 1) * 10000;
        const randomBonus = 10000 + Math.floor((seed - Math.floor(seed)) * 2000);
        totalVisitors += (11836 + randomBonus);
      }

      // Pro-rata current day's growth with realistic diurnal bell curve
      const currentDaySeed = Math.sin(fullDays + 1) * 10000;
      const todayRandomBonus = 10000 + Math.floor((currentDaySeed - Math.floor(currentDaySeed)) * 2000);
      const todayTotalRate = 11836 + todayRandomBonus;
      totalVisitors += Math.floor(todayTotalRate * partialDayFraction);

      return totalVisitors;
    };

    // Check localStorage cache to ensure counter strictly increments
    let storedCount = parseInt(localStorage.getItem('gm_devotee_visitors') || '0', 10);
    let currentCount = Math.max(BASE_START_COUNT, storedCount, computeExpectedVisitors());

    localStorage.setItem('gm_devotee_visitors', currentCount.toString());
    counterEl.textContent = currentCount.toLocaleString('en-IN');

    // Periodic live organic micro-increments (simulates 1-3 active devotees joining every few seconds)
    setInterval(() => {
      const delta = Math.floor(Math.random() * 3) + 1; // +1 to +3 visitors
      currentCount += delta;
      localStorage.setItem('gm_devotee_visitors', currentCount.toString());
      counterEl.textContent = currentCount.toLocaleString('en-IN');

      // Subtle devotional golden pulse
      counterEl.classList.add('counter-tick');
      setTimeout(() => {
        counterEl.classList.remove('counter-tick');
      }, 400);
    }, 4500 + Math.floor(Math.random() * 2500));
  }
}

// Bootstrap on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.festivalApp = window.app = new FestivalApp();
});

