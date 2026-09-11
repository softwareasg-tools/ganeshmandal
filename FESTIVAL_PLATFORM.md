# Live Ganpati Festival Intelligence & Discovery Platform (Pune & Mumbai)

A real-time geospatial intelligence, crowd monitoring, and festival discovery platform targeting the grand Ganeshotsav celebrations of **Pune** and **Mumbai**. Built as an extension to the `gods-eye-view` operational architecture.

---

## 1. Product Vision & Architecture

The platform answers the central questions for devotees, tourists, and city administrators during the 10-day festival:
> *"Which Ganpati mandals are worth visiting right now, how crowded are they, how popular are they, and what is happening on stage?"*

```
                                  +---------------------------------------+
                                  |     Public / Authorized Feeds         |
                                  | (YouTube Live, HLS, Webcams, Weather) |
                                  +---------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |           Backend Service             |
                                  |       (Node.js / Express / WS)        |
                                  +---------------------------------------+
                                     /       |            |          \
                                    v        v            v           v
                          +-------------+ +---------+ +-----------+ +-------------+
                          |  CV Scene   | | Crowd   | |Popularity | |  Database   |
                          |Intelligence | | Estimator| | Engine    | |  (In-Memory/|
                          | (Stage/Deco)| | (Density| | (Weighted | |  SQLite)    |
                          | & Objects)  | |  & Queue)| |  Decay)  | |             |
                          +-------------+ +---------+ +-----------+ +-------------+
                                     \       |            |          /
                                      v      v            v         v
                                  +---------------------------------------+
                                  |        Real-Time Broadcast / WS       |
                                  +---------------------------------------+
                                                      |
                         +----------------------------+----------------------------+
                         |                                                         |
                         v                                                         v
             +-----------------------+                                 +-----------------------+
             |   Desktop Dashboard   |                                 |   Mobile Viewport     |
             | Left: 65% Interactive |                                 | Top: Full Map         |
             | Map + Heatmap         |                                 | Bottom: Draggable     |
             | Right: 35% Live       |                                 | Sheet + Full-screen   |
             | Popularity Ranking    |                                 | Mandal Modal          |
             +-----------------------+                                 +-----------------------+
```

---

## 2. Core Components Implemented

### A. Geospatial Festival Map (Pune & Mumbai)
- **Map Provider**: Open-source Leaflet + CartoDB Dark Matter tiles (zero API key dependency, works 100% out of the box).
- **Dual City Support**: One-click city switcher `[PUNE]` and `[MUMBAI]` with automatic map flyTo animations and bounded coordinates.
- **Custom Interactive Markers**:
  - Dynamically color-coded based on real-time crowd density:
    - **Green** (Low: 0–45%)
    - **Yellow / Orange** (Moderate: 46–65%)
    - **Red** (High: 66–85%)
    - **Purple** (Extreme: 86–100%)
  - Embedded rank badges (`#1`, `#2`, `#3`...).
  - Live status tooltips showing crowd %, wait times, and camera availability.

### B. Dynamic Crowd / Popularity Heatmap
- Visualizes spatial crowd density across the city via `Leaflet.heat`.
- Smooth toggle control `[ 🔥 Crowd Heatmap: ON/OFF ]`.
- Gradient transitions: `#00ff88` (low) → `#ffaa00` (moderate) → `#ff2a55` (heavy) → `#9d00ff` (extreme).

### C. Real-Time Leaderboard & Dynamic Ranking
- **35% Right Panel**: High-contrast operations console displaying rank changes, trend arrows (`↑`, `↓`, `-`), crowd bars, popularity scores, experience scores, and data freshness flags (`LIVE`, `MOCK`, `STALE`).
- Instant search filter by mandal name, locality, or tags.
- Animated rank transitions triggered via WebSocket events without page reloads.

### D. Computer Vision & Scene Understanding
- **Privacy-First Crowd Detection**: Strictly aggregate person headcount, density index (0–100%), and queue flow direction. **Zero facial recognition or biometric identification**.
- **Stage & Decoration Scene Understanding**:
  - Detects Lord Ganesha Idol, Devotees on dais, LED video walls, mechanical moving props / kinetic chariots, and theatrical smoke effects.
  - Generates natural-language stage descriptions dynamically (e.g. *"Magnificent golden illuminated Ganpati idol clearly identified with 18 priests on dais..."*).
  - High-fps Canvas simulation rendering live detection bounding boxes over authorized feeds.

### E. Popularity & Experience Scoring Engine
- Separate, non-correlated scores for:
  1. **Crowd Score**: Physical crowd saturation (density + queue time + movement).
  2. **Popularity Score**: Multi-signal weighted composite with exponential time decay:
     - `35%` Current Crowd & Physical Activity
     - `20%` Recent Visitor Interest / Check-ins
     - `15%` Social Media Signal
     - `10%` Search & View Count
     - `10%` Historical Festival Baseline
     - `10%` Live Visual & Stage Activity
  3. **Experience Score**: Actionable metric answering *"Is it worth visiting right now?"* Balancing high visual activity with reasonable queue waiting times.
- Outlier soft-clipping and 4-hour exponential decay half-life so historic spikes do not dominate live reality.

### F. Smart Recommendations
- Filter criteria presets:
  - `Best Overall Experience`
  - `Least Crowded`
  - `Most Popular`
  - `Best Decorations`
  - `Most Active Right Now`
  - `Shortest Estimated Wait`
  - `Family Friendly`
- Computes Haversine travel distance from user location.

### G. Open-Meteo Weather Integration
- Automatically tracks temperature, precipitation probability, humidity, and wind for Pune & Mumbai.
- Calculates weather impact on crowd dynamics (e.g. advising covered pandals during monsoon showers).

### H. Admin & Data Management Console
- Protected by `X-Admin-Key` header.
- Allows festival coordinators to add/edit mandals, update coordinates, toggle camera feeds, and rebalance scoring weights at runtime.

---

## 3. Data Integrity & Reliability

Every metric in the platform carries transparent attribution:
- `LIVE`: Verified real-time telemetry from authorized camera feeds or city sensors.
- `MOCK`: Calibrated projection models used when live external feeds are unavailable.
- `STALE`: Telemetry that has exceeded the freshness threshold (>5 minutes without heartbeat).
- `OFFLINE`: Feeds or sensors currently disconnected.

---

## 4. Local Setup & Execution

### Prerequisites
- Node.js `>= 20` (Calibrated on Node 24)
- npm `>= 10`

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Test Suite
Run the 17 unit and integration tests covering REST APIs, WebSocket streaming, scoring algorithms, and computer vision pipelines:
```bash
npm run test:festival
```

### 3. Start the Live Application
```bash
npm run festival
```
Open your browser at:
`http://localhost:30000`

---

## 5. API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/cities` | List monitored cities & bounding boxes | Public |
| `GET` | `/api/cities/:city/mandals` | City mandals enriched with rank & crowd | Public |
| `GET` | `/api/mandals/:id` | Full mandal profile, timings, and lore | Public |
| `GET` | `/api/mandals/:id/live` | Live camera stream & CV visual analysis | Public |
| `GET` | `/api/mandals/:id/analytics` | 24-hour historical crowd & popularity charts | Public |
| `GET` | `/api/rankings/:city` | Real-time leaderboard with trend indicators | Public |
| `GET` | `/api/heatmap/:city` | Crowd density points for heatmap rendering | Public |
| `GET` | `/api/recommendations` | Multi-criteria smart recommendations | Public |
| `GET` | `/api/weather/:city` | Live weather and queue impact forecast | Public |
| `WS` | `/api/live?city=pune` | Real-time WebSocket room subscription | Public |
| `POST` | `/api/admin/mandals` | Register a new festival mandal | Admin (`X-Admin-Key`) |
| `PUT` | `/api/admin/mandals/:id` | Update mandal details or coordinates | Admin (`X-Admin-Key`) |
| `POST` | `/api/admin/weights` | Reconfigure scoring weights dynamically | Admin (`X-Admin-Key`) |
| `GET` | `/api/admin/health` | Operational health and feed freshness audit | Admin (`X-Admin-Key`) |

---

## 6. Testing Results

All 17 automated tests run via `node --test tests/*.test.mjs`:
- `ScoringEngine`: Weight normalization, 4-hour exponential decay, crowd score bounds, experience score sweet spot, and ranking delta calculations.
- `CVEngine`: Offline feed fallback, live feed detection pipeline, stage object parsing, and mechanical prop recognition.
- `REST APIs`: Cities, mandals, live telemetry, heatmap coordinates, and recommendations.
- `Security`: Rejection of unauthorized admin calls (401), successful authorized writes (201).
- `WebSockets`: End-to-end client handshake, city room subscription, and broadcast delivery.

---

## 7. Production Deployment

### Docker Deployment
```bash
docker build -t ganpati-intelligence .
docker run -p 3000:3000 ganpati-intelligence
```

### Docker Compose
```bash
docker compose up -d
```

---

## 8. Known Limitations & Third-Party Fallbacks
1. **Third-Party Video Feeds**: Public CCTV feeds during Ganesh Chaturthi frequently alter stream URLs or undergo regional traffic policing. The system includes a fallback mock simulator so mandal tracking remains functional even when official feeds drop offline.
2. **Weather Fallback**: If Open-Meteo encounters network rate-limits, the system falls back to a seasonal meteorological model of Maharashtra during the Bhadrapada month.
3. **Geocoding**: Mandal coordinates are pre-calibrated to official trust grounds; admin coordinates can be fine-tuned via the Admin Console.
