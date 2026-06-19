// ═══════════════════════════════════════════════════════════
//  PrediRoute — map.js
//  Real map integration with Leaflet & OpenStreetMap
// ═══════════════════════════════════════════════════════════

let map = null;
let routeLayers = [];
let incidentMarker = null;
let trafficStations = [];

// Route coordinates for each district (approximate locations)
const ROUTE_COORDS = {
  4: {
    // District 4 - roughly downtown area
    center: [34.0522, -118.2437],
    zoom: 13,
    routes: [
      {
        id: 'zone-rouge',
        name: 'Zone Rouge',
        coords: [
          [34.0620, -118.2550],
          [34.0580, -118.2500],
          [34.0540, -118.2450],
          [34.0500, -118.2400],
          [34.0460, -118.2350],
          [34.0420, -118.2300],
          [34.0380, -118.2250]
        ],
        color: '#22c55e',
        congestion: 0.8
      },
      {
        id: 'ring-road',
        name: 'Ring Road',
        coords: [
          [34.0700, -118.2600],
          [34.0680, -118.2500],
          [34.0660, -118.2400],
          [34.0640, -118.2300],
          [34.0600, -118.2200],
          [34.0560, -118.2150],
          [34.0520, -118.2100],
          [34.0480, -118.2150],
          [34.0440, -118.2200]
        ],
        color: '#ef4444',
        congestion: 99.4
      },
      {
        id: 'dense-urban',
        name: 'Dense Urban',
        coords: [
          [34.0400, -118.2300],
          [34.0380, -118.2250],
          [34.0360, -118.2200],
          [34.0340, -118.2150],
          [34.0320, -118.2100],
          [34.0300, -118.2050],
          [34.0280, -118.2000]
        ],
        color: '#f97316',
        congestion: 38.9
      },
      {
        id: 'highway',
        name: 'Highway',
        coords: [
          [34.0300, -118.2700],
          [34.0350, -118.2650],
          [34.0400, -118.2600],
          [34.0450, -118.2550],
          [34.0500, -118.2500],
          [34.0550, -118.2450],
          [34.0600, -118.2400],
          [34.0650, -118.2350]
        ],
        color: '#22c55e',
        congestion: 1.4
      }
    ],
    stations: [
      { lat: 34.0700, lng: -118.2600, name: 'Station A' },
      { lat: 34.0640, lng: -118.2300, name: 'Station B' },
      { lat: 34.0560, lng: -118.2150, name: 'Station C' },
      { lat: 34.0440, lng: -118.2200, name: 'Station D' },
      { lat: 34.0540, lng: -118.2450, name: 'Station E' },
      { lat: 34.0580, lng: -118.2500, name: 'Station F' },
      { lat: 34.0650, lng: -118.2350, name: 'Station G' },
      { lat: 34.0450, lng: -118.2550, name: 'Station H' }
    ]
  },
  7: {
    center: [34.0522, -118.2800],
    zoom: 13,
    routes: [
      {
        id: 'north-corridor',
        name: 'North Corridor',
        coords: [
          [34.0800, -118.2850],
          [34.0750, -118.2800],
          [34.0700, -118.2750],
          [34.0650, -118.2700],
          [34.0600, -118.2650]
        ],
        color: '#22c55e',
        congestion: 2.1
      },
      {
        id: 'central-ave',
        name: 'Central Ave',
        coords: [
          [34.0650, -118.2900],
          [34.0600, -118.2850],
          [34.0550, -118.2800],
          [34.0500, -118.2750],
          [34.0450, -118.2700]
        ],
        color: '#f97316',
        congestion: 44.2
      },
      {
        id: 'east-bypass',
        name: 'East Bypass',
        coords: [
          [34.0700, -118.2950],
          [34.0650, -118.2900],
          [34.0600, -118.2850],
          [34.0550, -118.2800],
          [34.0500, -118.2750],
          [34.0450, -118.2700]
        ],
        color: '#ef4444',
        congestion: 71.5
      },
      {
        id: 'outer-ring',
        name: 'Outer Ring',
        coords: [
          [34.0750, -118.3000],
          [34.0700, -118.2950],
          [34.0650, -118.2900],
          [34.0600, -118.2850],
          [34.0550, -118.2800]
        ],
        color: '#22c55e',
        congestion: 5.3
      }
    ],
    stations: [
      { lat: 34.0800, lng: -118.2850, name: 'Station A' },
      { lat: 34.0650, lng: -118.2900, name: 'Station B' },
      { lat: 34.0600, lng: -118.2850, name: 'Station C' },
      { lat: 34.0500, lng: -118.2750, name: 'Station D' }
    ]
  },
  11: {
    center: [34.0522, -118.3100],
    zoom: 13,
    routes: [
      {
        id: 'boulevard-sud',
        name: 'Boulevard Sud',
        coords: [
          [34.0600, -118.3200],
          [34.0550, -118.3150],
          [34.0500, -118.3100],
          [34.0450, -118.3050]
        ],
        color: '#22c55e',
        congestion: 1.3
      },
      {
        id: 'industrial-link',
        name: 'Industrial Link',
        coords: [
          [34.0650, -118.3250],
          [34.0600, -118.3200],
          [34.0550, -118.3150],
          [34.0500, -118.3100],
          [34.0450, -118.3050]
        ],
        color: '#f97316',
        congestion: 29.7
      },
      {
        id: 'tunnel-route',
        name: 'Tunnel Route',
        coords: [
          [34.0700, -118.3300],
          [34.0650, -118.3250],
          [34.0600, -118.3200],
          [34.0550, -118.3150],
          [34.0500, -118.3100]
        ],
        color: '#ef4444',
        congestion: 88.6
      },
      {
        id: 'coastal-road',
        name: 'Coastal Road',
        coords: [
          [34.0750, -118.3350],
          [34.0700, -118.3300],
          [34.0650, -118.3250],
          [34.0600, -118.3200],
          [34.0550, -118.3150]
        ],
        color: '#22c55e',
        congestion: 3.8
      }
    ],
    stations: [
      { lat: 34.0700, lng: -118.3300, name: 'Station A' },
      { lat: 34.0600, lng: -118.3200, name: 'Station B' },
      { lat: 34.0500, lng: -118.3100, name: 'Station C' }
    ]
  }
};

/**
 * Initialize the map
 */
function initMap(districtId = 4) {
  const data = ROUTE_COORDS[districtId];
  if (!data) return;

  // Check if map already exists
  if (map) {
    map.remove();
    map = null;
  }

  // Create map
  map = L.map('traffic-map', {
    center: data.center,
    zoom: data.zoom,
    zoomControl: false
  });

  // Add zoom control to top-right
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Add tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  // Draw routes
  drawRoutes(data.routes);

  // Draw traffic stations
  drawStations(data.stations);

  // Add incident marker if active
  if (window.incidentActive) {
    addIncidentMarker(data.routes[1]?.coords[3] || data.center);
  }

  // Update map on resize
  setTimeout(() => {
    map.invalidateSize();
  }, 100);

  // Add district label
  addDistrictLabel(districtId);
}

/**
 * Draw routes on the map
 */
function drawRoutes(routes) {
  // Clear existing route layers
  routeLayers.forEach(layer => {
    if (map) map.removeLayer(layer);
  });
  routeLayers = [];

  routes.forEach(route => {
    // Calculate line weight based on congestion
    let weight = 5;
    let opacity = 0.9;
    if (route.congestion > 70) {
      weight = 7;
      opacity = 1;
    } else if (route.congestion > 40) {
      weight = 6;
      opacity = 0.95;
    }

    const polyline = L.polyline(route.coords, {
      color: route.color,
      weight: weight,
      opacity: opacity,
      smoothFactor: 1,
      className: 'route-line'
    }).addTo(map);

    // Add popup with route info
    polyline.bindPopup(`
      <strong>${route.name}</strong><br>
      Congestion: ${route.congestion}%<br>
      ${route.congestion > 70 ? '⚠️ Heavy traffic' : 
        route.congestion > 40 ? '⚠️ Moderate traffic' : 
        '✅ Clear flow'}
    `);

    routeLayers.push(polyline);

    // Add animated traffic dots for congested routes
    if (route.congestion > 40) {
      addTrafficDots(route.coords, route.color);
    }
  });
}

/**
 * Add animated traffic dots along route
 */
function addTrafficDots(coords, color) {
  // Add small circles at intervals along the route
  const interval = Math.floor(coords.length / 3);
  for (let i = 1; i < coords.length - 1; i += interval) {
    const dot = L.circleMarker(coords[i], {
      radius: 3,
      color: color,
      fillColor: color,
      fillOpacity: 0.8,
      className: 'traffic-dot'
    }).addTo(map);

    // Animate with CSS
    const el = dot.getElement();
    if (el) {
      el.style.animation = 'traffic-flow 1.5s ease-in-out infinite';
      el.style.animationDelay = `${i * 0.3}s`;
    }

    routeLayers.push(dot);
  }
}

/**
 * Draw traffic stations on the map
 */
function drawStations(stations) {
  stations.forEach(station => {
    const marker = L.circleMarker([station.lat, station.lng], {
      radius: 6,
      color: '#ffffff',
      weight: 2,
      fillColor: '#60a5fa',
      fillOpacity: 1,
      className: 'station-marker'
    }).addTo(map);

    marker.bindPopup(`
      <strong>${station.name}</strong><br>
      Traffic Station<br>
      ${Math.random() > 0.5 ? '🟢 Active' : '🟡 Monitoring'}
    `);

    routeLayers.push(marker);
  });
}

/**
 * Add incident marker on the map
 */
function addIncidentMarker(position) {
  if (incidentMarker) {
    map.removeLayer(incidentMarker);
    incidentMarker = null;
  }

  // Create custom incident icon
  const incidentIcon = L.divIcon({
    className: 'incident-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: #ef4444;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 20px rgba(239,68,68,0.6);
        animation: pulse-incident 1.2s infinite;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 10px;
      ">!</div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  incidentMarker = L.marker([position[0], position[1]], {
    icon: incidentIcon,
    zIndexOffset: 1000
  }).addTo(map);

  incidentMarker.bindPopup(`
    <strong style="color:#ef4444;">⚠️ INCIDENT ACTIVE</strong><br>
    Synthetic incident detected<br>
    <small>Flow affected area</small>
  `);

  // Add incident radius (pulsing circle)
  const radius = L.circle([position[0], position[1]], {
    radius: 200,
    color: '#ef4444',
    fillColor: '#ef4444',
    fillOpacity: 0.1,
    weight: 2,
    className: 'incident-radius'
  }).addTo(map);

  routeLayers.push(radius);
}

/**
 * Add district label overlay
 */
function addDistrictLabel(districtId) {
  const names = {
    4: 'District 4 (Calibrated)',
    7: 'District 7',
    11: 'District 11'
  };

  const label = L.control({ position: 'topleft' });
  label.onAdd = function() {
    const div = L.DomUtil.create('div', 'district-label');
    div.innerHTML = `
      <div style="
        background: rgba(22,30,42,0.9);
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid #1f2d42;
        color: #e2e8f0;
        font-size: 11px;
        font-weight: 600;
        font-family: Inter, sans-serif;
        backdrop-filter: blur(4px);
      ">
        📍 ${names[districtId] || 'District'}
      </div>
    `;
    return div;
  };
  label.addTo(map);
}

/**
 * Update map when district changes
 */
function updateMapDistrict(districtId) {
  initMap(districtId);
}

/**
 * Toggle incident on map
 */
function toggleIncidentOnMap(active, position) {
  if (active) {
    if (position) {
      addIncidentMarker(position);
    } else {
      // Use default position from current district
      const data = ROUTE_COORDS[currentDistrict];
      if (data && data.routes[1]) {
        addIncidentMarker(data.routes[1].coords[3]);
      }
    }
  } else {
    if (incidentMarker) {
      map.removeLayer(incidentMarker);
      incidentMarker = null;
    }
  }
}

// Export for use in dashboard.js
window.initMap = initMap;
window.updateMapDistrict = updateMapDistrict;
window.toggleIncidentOnMap = toggleIncidentOnMap;