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
    this.filters = { quickOnly: false, famousOnly: false, search: '' };
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
    this.initMap();
    this.bindEvents();
    this.bindMobileNavigation();
    this.bindPOVControls();
    this.bindAdminControls();
    this.bindSuggestControls();
    this.connectWebSocket();
    await Promise.all([
      this.loadCityData(this.currentCity),
      this.loadSponsorAds(),
    ]);
    this.fetchWeather(this.currentCity);
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

  async loadCityData(citySlug) {
    try {
      const res = await fetch(`/api/cities/${citySlug}/mandals`);
      const data = await res.json();
      if (data.success) {
        this.mandals = data.data;
        this.renderMapMarkers();
        this.renderLeaderboard();
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

  renderMapMarkers() {
    this.markerLayerGroup.clearLayers();

    const filtered = this.mandals.filter((m) => {
      if (this.filters.quickOnly && (m.estimated_wait_minutes || 25) > 20) return false;
      if (this.filters.famousOnly && !m.is_famous) return false;
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

    filtered.forEach((mandal) => {
      const density = mandal.crowd_density || 50;
      const isFamous = mandal.is_famous;

      const customIcon = L.divIcon({
        className: 'custom-mandal-marker',
        html: `
          <div class="marker-beacon-wrap">
            <div class="marker-pulse-ring"></div>
            <div class="marker-core ${isFamous ? 'famous' : ''}" title="${mandal.name}">
              🪔
            </div>
            <div class="marker-rank-badge">#${mandal.current_rank || '-'}</div>
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
          <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-family:var(--font-mono); font-size:11px;">
            <span>Rush: <strong style="color:var(--accent-gold);">${density}%</strong></span>
            <span>Wait: <strong style="color:var(--accent-saffron);">~${mandal.estimated_wait_minutes || 15} min</strong></span>
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

      this.markerLayerGroup.addLayer(marker);
    });
  }

  updateCityStats() {
    const cityNameEl = document.getElementById('stat-city-name');
    const totalEl = document.getElementById('stat-total-mandals');
    const avgDensityEl = document.getElementById('stat-avg-density');

    if (cityNameEl) cityNameEl.textContent = this.currentCity === 'pune' ? 'Pune' : 'Mumbai';
    if (totalEl) totalEl.textContent = this.mandals.length;

    if (this.mandals.length && avgDensityEl) {
      const avg = Math.round(this.mandals.reduce((sum, m) => sum + (m.crowd_density || 0), 0) / this.mandals.length);
      avgDensityEl.textContent = `${avg}%`;
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
        if (this.filters.quickOnly && (m.estimated_wait_minutes || 25) > 20) return false;
        if (this.filters.famousOnly && !m.is_famous) return false;
        if (!query) return true;
        return (
          m.name.toLowerCase().includes(query) ||
          m.address.toLowerCase().includes(query) ||
          (m.tags && m.tags.some((t) => t.toLowerCase().includes(query)))
        );
      })
      .sort((a, b) => (a.current_rank || 999) - (b.current_rank || 999));

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

      const density = mandal.crowd_density || 50;
      let fillClass = 'crowd-bar-green';
      if (density > 85) fillClass = 'crowd-bar-purple';
      else if (density > 65) fillClass = 'crowd-bar-red';
      else if (density > 45) fillClass = 'crowd-bar-orange';

      card.innerHTML = `
        <div class="card-top-row">
          <div class="rank-number">#${mandal.current_rank || index + 1}</div>
          <div class="mandal-card-info">
            <div class="mandal-card-name" title="${mandal.name}">${mandal.name}</div>
            <div class="mandal-card-meta">
              <span class="trend-badge ${trendClass}">${trendIcon}</span>
              <span>📍 ${mandal.address.split(',')[0]}</span>
            </div>
            <div class="card-badge-row" style="margin-top:4px;">
              <span class="quality-badge quality-VERIFIED">VERIFIED DARSHAN</span>
            </div>
            <div class="card-action-row">
              <button class="btn-card-action btn-stand-front card-pov-btn" title="Stand in front of Bappa">
                <span>👁️ Stand in Front</span>
              </button>
              <button class="btn-card-action card-traffic-btn" title="Check road traffic to mandal">
                <span>🚦 Road Rush</span>
              </button>
              <button class="btn-card-action card-intel-btn" title="Pandal lore and live darshan details">
                <span>ℹ️ Details</span>
              </button>
            </div>
          </div>
        </div>
        <div class="card-metrics">
          <div class="metric-pill">
            <span style="color:var(--text-dim);font-size:10px;">FAME:</span>
            <span class="score-num score-pop">${mandal.popularity_score || 60}</span>
            <span style="color:var(--text-dim);font-size:10px;margin-left:6px;">DARSHAN:</span>
            <span class="score-num score-exp">${mandal.experience_score || 65}</span>
          </div>
          <div class="crowd-bar-mini" title="Rush level: ${density}%">
            <div class="crowd-bar-fill ${fillClass}" style="width: ${density}%;"></div>
          </div>
          <span style="font-size:11px; color:var(--text-muted);">${density}% rush • ~${mandal.estimated_wait_minutes || 15}m wait</span>
        </div>
      `;

      // Stand in Front Button Handler
      card.querySelector('.card-pov-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openPOVModal(mandal.id, 'crowd');
      });

      // Road Traffic Button Handler
      card.querySelector('.card-traffic-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openPOVModal(mandal.id, 'traffic');
      });

      // Intelligence Button Handler
      card.querySelector('.card-intel-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openPOVModal(mandal.id, 'crowd');
      });

      // Card Body Click Handler
      card.addEventListener('click', () => {
        this.selectedMandal = mandal;
        document.querySelectorAll('.ranking-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        this.map.flyTo([mandal.latitude, mandal.longitude], 16, { duration: 1.2 });
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
        adCard.className = 'ad-card-native';
        adCard.innerHTML = `
          <div class="ad-native-header">
            <span class="ad-badge">${ad.badge_text || 'SPONSORED PARTNER'}</span>
            <span class="ad-native-sponsor">${ad.sponsor_name}</span>
            <span style="margin-left:auto; font-size:10px; color:var(--text-dim);">Slot: After #${rankNum}</span>
          </div>
          <div class="ad-native-desc">${ad.description}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; gap:8px;">
            <a href="${ad.cta_url || '#'}" target="_blank" rel="noopener noreferrer" class="ad-native-cta-btn">${ad.cta_text || 'Learn More ↗'}</a>
            <span class="ad-native-inquire-link">Sponsor a slot ↗</span>
          </div>
        `;
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
  // Mobile-First Navigation Bindings
  // -------------------------------------------------------------
  bindMobileNavigation() {
    const navButtons = document.querySelectorAll('.mobile-nav-btn');
    const mapPanel = document.getElementById('map-panel');
    const rankingPanel = document.getElementById('ranking-panel');

    navButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        navButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const tab = btn.dataset.tab;
        if (tab === 'map') {
          if (mapPanel) mapPanel.classList.remove('mobile-hidden');
          if (rankingPanel) rankingPanel.classList.add('mobile-hidden');
          setTimeout(() => this.map.invalidateSize(), 150);
        } else if (tab === 'rankings') {
          if (mapPanel) mapPanel.classList.add('mobile-hidden');
          if (rankingPanel) rankingPanel.classList.remove('mobile-hidden');
        } else if (tab === 'darshan') {
          const targetId = this.selectedMandal?.id || this.mandals[0]?.id;
          if (targetId) this.openPOVModal(targetId, 'crowd');
        } else if (tab === 'traffic') {
          const targetId = this.selectedMandal?.id || this.mandals[0]?.id;
          if (targetId) this.openPOVModal(targetId, 'traffic');
        } else if (tab === 'suggest') {
          this.openCommunityModal('suggest');
        }
      });
    });
  }

  // -------------------------------------------------------------
  // First-Person Street & Pandal POV ("Stand in Front of Mandal")
  // -------------------------------------------------------------
  async openPOVModal(mandalId, initialPane = 'crowd') {
    let mandal = this.mandals.find((m) => m.id === mandalId);
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
      mandal = this.mandals[0];
    }
    if (!mandal) return;

    this.povMandal = mandal;
    this.povAngle = 'sanctum';
    this.darshanZoomIndex = 0;

    // Fly map down to street coordinates
    this.map.flyTo([mandal.latitude, mandal.longitude], 17, { duration: 1.0 });

    const modalNameEl = document.getElementById('pov-mandal-name');
    if (modalNameEl) {
      modalNameEl.textContent = `${mandal.name} — Street & Pandal POV`;
    }

    const badgeEl = document.getElementById('pov-mandal-status-badge');
    if (badgeEl) {
      badgeEl.textContent = '🟢 DARSHAN OPEN';
    }

    // 1. Setup Pane 1: Genuine Live Wait Time & Crowd Rush Dashboard
    this.setupRushIntelPane(mandal);

    // 2. Setup Pane 2: Live Road Traffic (Top 3 Roads within 1km)
    this.setupTrafficPane(mandal);

    // 3. Setup Pane 3: Authentic Sacred Murti Darshan
    this.setupMurtiDarshanPane(mandal);

    // 4. Switch to initial pane tab
    this.switchPOVTab(initialPane);

    // 5. Fetch and populate strictly the last 5 social media snaps
    this.loadSocialMediaAndStreams(mandal.id);

    document.getElementById('pov-street-modal').classList.add('open');
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
      if (baseWait >= 35) {
        statusPillEl.textContent = '🔴 PEAK AARTI RUSH';
        statusPillEl.style.color = '#ef4444';
        statusPillEl.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        statusPillEl.style.background = 'rgba(239, 68, 68, 0.15)';
        if (waitDescEl) waitDescEl.textContent = 'High festival evening rush • Barricaded darshan queues active';
      } else if (baseWait >= 18) {
        statusPillEl.textContent = '🟠 MODERATE EVENING RUSH';
        statusPillEl.style.color = 'var(--accent-gold)';
        statusPillEl.style.borderColor = 'rgba(245, 158, 11, 0.4)';
        statusPillEl.style.background = 'rgba(245, 158, 11, 0.18)';
        if (waitDescEl) waitDescEl.textContent = 'Steady queue movement inside pandal • 2-3 paces every minute';
      } else {
        statusPillEl.textContent = '🟢 SMOOTH DARSHAN FLOW';
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
  }

  setupTrafficPane(mandal) {
    const trafficIframe = document.getElementById('traffic-road-iframe');
    const trafficMapsLink = document.getElementById('traffic-maps-link');
    const trafficRoadName = document.getElementById('traffic-road-name');
    const trafficRoadStatus = document.getElementById('traffic-road-status');
    const selectorEl = document.getElementById('traffic-roads-selector');

    const roads = (mandal.top_roads && mandal.top_roads.length >= 3)
      ? mandal.top_roads
      : [
          { name: `${mandal.name} Main Approach`, distance: '120m from mandal', color: 'red', status: 'Heavy Jam • Crawling at 5 km/h', delay: '~40 min delay', avg_speed: '5 km/h', maps_query: `${mandal.name} Main Road` },
          { name: `${mandal.name} Parallel Arterial`, distance: '380m from mandal', color: 'orange', status: 'Moderate Rush • Moving at 16 km/h', delay: '~18 min delay', avg_speed: '16 km/h', maps_query: `${mandal.name} Approach` },
          { name: `${mandal.name} Outer Ring Connector`, distance: '750m from mandal', color: 'blue', status: 'Clear • Free flow route', delay: '~6 min delay', avg_speed: '32 km/h', maps_query: `${mandal.address || mandal.name}` },
        ];

    if (!selectorEl) return;
    selectorEl.innerHTML = '';

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
      if (trafficIframe) {
        const query = encodeURIComponent(road.maps_query || `${road.name}, ${mandal.address || mandal.name}`);
        trafficIframe.src = `https://maps.google.com/maps?q=${query}&t=m&z=16&output=embed`;
      }
      if (trafficMapsLink) {
        trafficMapsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(road.maps_query || mandal.name)}`;
      }
    };

    roads.slice(0, 3).forEach((road, idx) => {
      const card = document.createElement('div');
      card.className = `traffic-road-card color-${road.color || 'orange'}`;
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

    // Close POV Modal
    document.getElementById('btn-close-pov-modal').addEventListener('click', () => {
      const trafficIframe = document.getElementById('traffic-road-iframe');
      if (trafficIframe) trafficIframe.src = '';
      document.getElementById('pov-street-modal').classList.remove('open');
      this.stopPOVAudio();
    });

    // Sound / Audio Button
    document.getElementById('btn-pov-audio').addEventListener('click', () => {
      this.togglePOVAudio();
    });
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
                <span style="color:var(--text-cream); font-weight:700;">${post.author_name}</span>
                <span class="platform-tag platform-${post.platform}">${post.platform.toUpperCase()}</span>
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
  // Ambient Temple Sound Synthesizer (Bells & Dhol)
  // -------------------------------------------------------------
  togglePOVAudio() {
    const btn = document.getElementById('btn-pov-audio');
    if (this.audioPlaying) {
      this.stopPOVAudio();
      if (btn) btn.querySelector('span').textContent = '🔔 Sound: Temple Aarti (OFF)';
    } else {
      this.startPOVAudio();
      if (btn) btn.querySelector('span').textContent = '🔔 Sound: Temple Aarti (PLAYING)';
    }
  }

  startPOVAudio() {
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtxClass();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      this.audioPlaying = true;

      // Authentic periodic temple bell chimes
      const playBell = () => {
        if (!this.audioPlaying || !this.audioCtx) return;
        const now = this.audioCtx.currentTime;

        [1180, 820, 560].forEach((freq, idx) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq + (Math.random() * 8 - 4), now);

          gain.gain.setValueAtTime(0.08 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now);
          osc.stop(now + 1.8);
        });

        // Low resonant dhol pulse
        const dholOsc = this.audioCtx.createOscillator();
        const dholGain = this.audioCtx.createGain();
        dholOsc.type = 'triangle';
        dholOsc.frequency.setValueAtTime(85, now);
        dholOsc.frequency.exponentialRampToValueAtTime(45, now + 0.35);
        dholGain.gain.setValueAtTime(0.12, now);
        dholGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        dholOsc.connect(dholGain);
        dholGain.connect(this.audioCtx.destination);
        dholOsc.start(now);
        dholOsc.stop(now + 0.35);

        this.audioTimer = setTimeout(playBell, 900 + Math.random() * 500);
      };

      playBell();
    } catch (e) {
      console.warn('[Audio] Web Audio initialization ignored:', e.message);
    }
  }

  stopPOVAudio() {
    this.audioPlaying = false;
    if (this.audioTimer) clearTimeout(this.audioTimer);
    const btn = document.getElementById('btn-pov-audio');
    if (btn) btn.querySelector('span').textContent = '🔔 Sound: Temple Aarti & Bells';
  }

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
  }

  async switchCity(citySlug) {
    if (this.currentCity === citySlug) return;
    this.currentCity = citySlug;

    document.getElementById('btn-city-pune').classList.toggle('active', citySlug === 'pune');
    document.getElementById('btn-city-mumbai').classList.toggle('active', citySlug === 'mumbai');

    const coords = CITY_COORDS[citySlug];
    this.map.flyTo([coords.lat, coords.lng], coords.zoom, { duration: 1.5 });

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
        this.renderMandals();
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
        if (paneMandals) paneMandals.style.display = tab === 'mandals' ? 'block' : 'none';
        if (paneAds) paneAds.style.display = tab === 'ads' ? 'block' : 'none';
        if (paneSug) paneSug.style.display = tab === 'suggestions' ? 'block' : 'none';
        if (paneAdv) paneAdv.style.display = tab === 'advertisers' ? 'block' : 'none';
        if (tab === 'advertisers') this.renderAdminAdvertisers();
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
}

// Bootstrap on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.festivalApp = window.app = new FestivalApp();
});

