// ═══════════════════════════════════════════════════════════
//  PrediRoute — dashboard.js
//  Core logic, state management & DOM updates
// ═══════════════════════════════════════════════════════════

/* ── State ── */
let currentDistrict = 4;
let incidentActive  = false;

/* ══════════════════════════════════ INIT ══ */
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  renderDistrict(4);

  document.getElementById('district-select').addEventListener('change', e => {
    const id = parseInt(e.target.value);
    currentDistrict = id;
    incidentActive  = false;
    renderDistrict(id);
    updateMapColors(id);
  });

  document.getElementById('inject-btn').addEventListener('click', injectIncident);

  // Initial map colors
  updateMapColors(4);
  updateCoeffActiveHour();
});

/* ══════════════════════════════════ CLOCK ══ */
function startClock() {
  function tick() {
    const now   = new Date();
    const hours = now.getHours();
    const mins  = String(now.getMinutes()).padStart(2, '0');
    const secs  = String(now.getSeconds()).padStart(2, '0');
    const ampm  = hours >= 12 ? 'PM' : 'AM';
    const h12   = String(hours % 12 || 12).padStart(2, '0');

    const timeStr = `${h12}:${mins}:${secs} ${ampm}`;
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const liveEl = document.getElementById('live-clock');
    const ctrlEl = document.getElementById('ctrl-clock');
    const dateEl = document.getElementById('live-date');

    if (liveEl) liveEl.textContent = timeStr;
    if (ctrlEl) ctrlEl.textContent = timeStr;
    if (dateEl) dateEl.textContent = dateStr;

    // Peak hour detection (7-9 AM, 5-7 PM)
    const isPeak = (hours >= 7 && hours < 9) || (hours >= 17 && hours < 19);
    const badge  = document.getElementById('peak-alert');
    if (badge) {
      badge.style.display = isPeak ? 'flex' : 'none';
    }

    // Refresh coeff highlight every minute
    if (secs === '00') updateCoeffActiveHour();
  }

  tick();
  setInterval(tick, 1000);
}

/* ══════════════════════════════════ RENDER DISTRICT ══ */
function renderDistrict(distId) {
  const d = DISTRICTS[distId];
  if (!d) return;

  renderForecast(d.routes);
  renderRouter(d.router, d.calibrated);
  renderKPI(d.kpi);
  renderAlerts(d.alerts);
  updateCalibStatus(distId, d.calibrated);
}

/* ── Forecast Table ── */
function renderForecast(routes) {
  const container = document.getElementById('forecast-rows');
  container.innerHTML = '';

  routes.forEach(r => {
    const row = document.createElement('div');
    row.className = 'forecast-row';
    row.innerHTML = `
      <span class="fr-name">${r.name}</span>
      <span class="fr-status ${r.status}">${r.statusLabel}</span>
      <span class="fr-pred ${r.predClass}">${r.predicted}</span>
      <span class="fr-risk ${r.risk}">${r.riskLabel}</span>
      <button class="fr-action ${r.action}">${r.actionLabel}</button>
    `;
    container.appendChild(row);
  });
}

/* ── Router ── */
function renderRouter(router, calibrated) {
  // Critical event
  const critEl = document.getElementById('critical-event');
  if (router.hasIncident) {
    critEl.classList.remove('hidden');
    document.getElementById('critical-desc').textContent = router.incidentDesc;
    document.getElementById('critical-sub').textContent  = router.incidentSub;
  } else {
    critEl.classList.add('hidden');
  }

  // Route cards
  document.getElementById('rc-current-name').textContent = `(${router.currentRoute})`;
  document.getElementById('rc-current-eta').textContent  = router.currentETA;
  document.getElementById('rc-current-cong').textContent = router.currentCong;
  document.getElementById('rc-current-cong').className   = `rc-cong ${router.currentCongClass}`;

  document.getElementById('rc-rec-name').textContent = `(${router.recRoute})`;
  document.getElementById('rc-rec-eta').textContent  = router.recETA;
  document.getElementById('rc-rec-cong').textContent = router.recCong;
  document.getElementById('rc-rec-cong').className   = `rc-cong ${router.recCongClass}`;

  document.getElementById('rm-time-saved').textContent = router.timeSaved;
  document.getElementById('rm-confidence').textContent = router.confidence;
  document.getElementById('just-text').textContent     = router.justification;
}

/* ── KPI ── */
function renderKPI(kpi) {
  document.getElementById('kpi-vehicles').innerHTML = kpi.vehicles;
  document.getElementById('kpi-fuel').innerHTML     = kpi.fuel;
  document.getElementById('kpi-co2').innerHTML      = kpi.co2;
  document.getElementById('kpi-cost').innerHTML     = kpi.cost;
}

/* ── Alerts ── */
function renderAlerts(alerts) {
  const list = document.getElementById('alerts-list');
  list.innerHTML = '';

  alerts.forEach(a => {
    const row = document.createElement('div');
    row.className = 'alert-row';
    row.innerHTML = `
      <span class="alert-time">${a.time}</span>
      <span class="alert-tag ${a.tag}">${a.tag.toUpperCase()}</span>
      <div class="alert-content">
        <span class="alert-title">${a.title}</span>
        <span class="alert-sub">${a.sub}</span>
      </div>
      <span class="alert-dot ${a.dot}"></span>
    `;
    list.appendChild(row);
  });
}

/* ── Calibration Status ── */
function updateCalibStatus(distId, calibrated) {
  const badge = document.querySelector('.calib-status-badge');
  const note  = document.querySelector('.calib-note');
  const warn  = document.querySelector('.calib-warn span');

  if (calibrated) {
    badge.className    = 'calib-status-badge';
    badge.innerHTML    = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ACTIVATED (HOURLY STATIC)`;
    badge.style.borderColor = 'var(--green-500)';
    badge.style.color       = 'var(--green-500)';
    badge.style.background  = 'rgba(34,197,94,0.12)';
    if (note) note.textContent = `Applied to District ${distId} only`;
    if (warn) warn.textContent = `Calibration disabled for District 7 & 11 to preserve 100% accident detection`;
  } else {
    badge.innerHTML    = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> DISABLED`;
    badge.style.borderColor = 'var(--text-muted)';
    badge.style.color       = 'var(--text-muted)';
    badge.style.background  = 'var(--bg-card)';
    if (note) note.textContent = `District ${distId} runs uncalibrated`;
    if (warn) warn.textContent = `Calibration preserved off for District ${distId} to maintain 100% accident detection accuracy`;
  }
}

/* ══════════════════════════════════ MAP ══ */
function updateMapColors(distId) {
  const config = MAP_COLORS[distId];
  if (!config) return;

  // Update route polyline colors
  config.routes.forEach(r => {
    const el = document.getElementById(r.id);
    if (el) el.setAttribute('stroke', r.color);
  });

  // Rebuild labels
  const svg = document.getElementById('map-svg');
  // Remove old label groups
  document.querySelectorAll('.map-label-group').forEach(g => g.remove());

  config.labels.forEach(label => {
    const g    = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.classList.add('map-label-group');
    g.setAttribute('font-family', 'Inter, sans-serif');
    g.setAttribute('font-size', '11');
    g.setAttribute('font-weight', '600');

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', label.x);
    rect.setAttribute('y', label.y);
    rect.setAttribute('width', label.w);
    rect.setAttribute('height', label.h);
    rect.setAttribute('rx', '4');
    rect.setAttribute('fill', label.color);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', label.tx);
    text.setAttribute('y', label.ty);
    text.setAttribute('fill', 'white');
    text.setAttribute('text-anchor', 'middle');
    text.textContent = label.text;

    g.appendChild(rect);
    g.appendChild(text);
    svg.appendChild(g);
  });
}

/* ══════════════════════════════════ INCIDENT INJECTION ══ */
function injectIncident() {
  if (incidentActive) {
    // Clear incident
    incidentActive = false;
    document.getElementById('incident-overlay').classList.add('hidden');
    renderRouter(DISTRICTS[currentDistrict].router, DISTRICTS[currentDistrict].calibrated);
    showToast('Incident cleared — routes restored.', 'info');
    return;
  }

  incidentActive = true;
  document.getElementById('incident-overlay').classList.remove('hidden');

  // Simulate a new incident on the recommended route
  const d   = DISTRICTS[currentDistrict];
  const sim = {
    ...d.router,
    hasIncident: true,
    incidentDesc: `${d.router.recRoute} — Synthetic Incident Injected`,
    incidentSub:  '(Manual Test — Flow ×2.8)',
    currentRoute: d.router.recRoute,
    currentETA:   `${(parseFloat(d.router.recETA) * 4.2).toFixed(1)} min`,
    currentCong:  '82.3%',
    currentCongClass: 'red',
    recRoute:     d.router.currentRoute,
    recETA:       d.router.currentETA,
    recCong:      d.router.currentCong,
    recCongClass: d.router.currentCongClass,
    timeSaved:    'N/A',
    confidence:   '73%',
    justification: `Synthetic incident injected on ${d.router.recRoute}. Router re-evaluating best alternative. Confidence lower due to simulated conditions.`,
  };

  renderRouter(sim, d.calibrated);
  showToast('⚠ Synthetic incident injected — router updating...', 'error');
}

/* ══════════════════════════════════ DISPATCHER ACTIONS ══ */
function approveReroute() {
  const d = DISTRICTS[currentDistrict];
  showToast(`✓ Reroute approved — ${d.router.recRoute} selected for ${d.kpi.vehicles.replace(/<[^>]+>/g,'')} vehicles.`, 'success');

  const btn = document.getElementById('approve-btn');
  btn.style.background = '#166534';
  setTimeout(() => { btn.style.background = ''; }, 2000);
}

function rejectReroute() {
  showToast('✗ Reroute rejected — maintaining current routes.', 'error');

  const btn = document.getElementById('reject-btn');
  btn.style.background = 'rgba(239,68,68,0.3)';
  setTimeout(() => { btn.style.background = ''; }, 2000);
}

function viewAllScenarios() {
  showToast('Full scenario history view coming in a future release.', 'info');
}

/* ══════════════════════════════════ TOAST ══ */
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success' ? '<polyline points="20 6 9 17 4 12"/>' :
        type === 'error'   ? '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' :
        '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'toast-out 0.2s ease forwards';
      setTimeout(() => toast.remove(), 200);
    }
  }, 3500);
}

// ══════════════════════════════════ MAP INTEGRATION ══

// Initialize map on load
let mapInitialized = false;

// Override the renderDistrict function to update map
const originalRenderDistrict = renderDistrict;
renderDistrict = function(distId) {
  // Call original render
  originalRenderDistrict(distId);
  
  // Update map
  if (typeof initMap === 'function') {
    if (!mapInitialized) {
      initMap(distId);
      mapInitialized = true;
    } else {
      updateMapDistrict(distId);
    }
  }
};

// Override injectIncident to update map
const originalInjectIncident = injectIncident;
injectIncident = function() {
  // Call original
  originalInjectIncident();
  
  // Update map
  if (typeof toggleIncidentOnMap === 'function') {
    const data = ROUTE_COORDS[currentDistrict];
    const position = data?.routes[1]?.coords[3] || data?.center;
    toggleIncidentOnMap(incidentActive, position);
  }
};

// Handle map resize when panels expand/collapse
window.addEventListener('resize', () => {
  if (map) {
    setTimeout(() => map.invalidateSize(), 100);
  }
});

// Also invalidate on district change
document.getElementById('district-select').addEventListener('change', function() {
  if (map) {
    setTimeout(() => map.invalidateSize(), 200);
  }
});
