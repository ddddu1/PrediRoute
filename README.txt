PrediRoute Dashboard — Quick Setup Guide
========================================

STRUCTURE
---------
prediroute-dashboard/
├── index.html              ← Open this in your browser
├── css/
│   └── dashboard.css       ← All styles (dark operator console theme)
├── js/
│   ├── dashboard.js        ← Core logic & state management
│   ├── router-logic.js     ← Router decision engine & calibration helpers
│   └── scenarios.js        ← District data, route configs, alert scenarios
├── assets/                 ← Place logos / images here
└── README.txt              ← This file

HOW TO RUN
----------
Just open index.html in any modern browser (Chrome, Firefox, Edge).
No build step, no server required.

FEATURES
--------
✓ Live clock (updates every second)
✓ Peak hour auto-detection (7–9 AM, 5–7 PM)
✓ District selector: District 4 (Calibrated), 7, 11
✓ Route Congestion Forecast (T+30) per district
✓ Traffic map with colored routes (SVG, updates on district change)
✓ Intelligent Router Decision Engine
✓ Fleet KPI panel (vehicles, fuel, CO2, cost)
✓ Dispatcher Approve / Reject actions with feedback toasts
✓ Synthetic incident injection (toggle on/off)
✓ Calibration status panel with hourly coefficient table
✓ Recent Alerts & Scenarios

ADDING A NEW DISTRICT
---------------------
1. Open js/scenarios.js
2. Copy an existing district block (e.g. the district 4 object)
3. Add a new key to DISTRICTS (e.g. DISTRICTS[5] = { ... })
4. Add the map color config to MAP_COLORS[5]
5. Add <option value="5">District 5</option> in index.html

CUSTOMIZATION
-------------
- Colors: edit CSS variables in :root {} in dashboard.css
- Route data: edit DISTRICTS in scenarios.js
- Calibration coefficients: edit HOURLY_COEFF in router-logic.js
- Map: the SVG in index.html can be replaced with a real Leaflet/Mapbox map
  by pointing the map-container div at a map library initialization

FUTURE ADDITIONS (suggested)
-----------------------------
- Individual district pages (e.g. /districts/4.html)
- Backend API integration for live sensor data
- Leaflet.js or Mapbox GL JS for real tile-based map
- WebSocket for real-time alert streaming
- Export to PDF / CSV for dispatcher reports
