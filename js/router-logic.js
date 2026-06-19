// ═══════════════════════════════════════════════════════════
//  PrediRoute — router-logic.js
//  Router decision engine & calibration helpers
// ═══════════════════════════════════════════════════════════

const HOURLY_COEFF = {
  4: [4.58,3.85,3.12,2.75,2.41,1.98,1.65,1.32,1.10,1.25,1.48,1.72,1.95,2.15,2.35,2.58,2.89,3.25,3.75,4.02,4.28,4.41,4.58,4.73],
  7:  null, // no calibration
  11: null, // no calibration
};

/**
 * Returns the current calibration coefficient for a district.
 * Returns null if uncalibrated.
 */
function getCalibCoeff(districtId) {
  const coeffs = HOURLY_COEFF[districtId];
  if (!coeffs) return null;
  const hour = new Date().getHours();
  return coeffs[hour];
}

/**
 * Determines whether to reroute based on congestion and time gain.
 * Reroutes if gain > 3 minutes.
 */
function shouldReroute(currentETA, recommendedETA) {
  const currentMins = parseFloat(currentETA);
  const recMins     = parseFloat(recommendedETA);
  const gain        = currentMins - recMins;
  return gain > 3;
}

/**
 * Builds the active hour highlight for the coeff table.
 * Called by dashboard.js when district changes.
 */
function updateCoeffActiveHour() {
  const hour = new Date().getHours();
  // Remove all active-hour classes
  const cells = document.querySelectorAll('.coeff-table .active-hour');
  cells.forEach(c => c.classList.remove('active-hour'));

  // Add to correct column (header row has "Hour" in th, then 24 tds)
  const allRows = document.querySelectorAll('.coeff-table tr');
  allRows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells[hour]) cells[hour].classList.add('active-hour');
  });
}

/**
 * Formats ETA string → float
 */
function parseETA(etaStr) {
  return parseFloat(etaStr.replace(' min', ''));
}

/**
 * Returns calibration status text for a district
 */
function getCalibStatusText(districtId) {
  if (HOURLY_COEFF[districtId]) {
    const hour  = new Date().getHours();
    const coeff = HOURLY_COEFF[districtId][hour];
    return `ACTIVATED (HOURLY STATIC) — Coef ${String(hour).padStart(2,'0')}h = ${coeff}`;
  }
  return 'DISABLED — Uncalibrated district';
}
