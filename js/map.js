/* Leaflet Map Integration & Route Planner (js/map.js) */

import { DB } from './state.js';
import { showToast } from './app.js';

let mapInstance = null;
let markersGroup = [];
let routeLines = [];
let trafficOverlays = [];
let pollutionOverlay = null;
let weatherOverlay = null;

// Node coordinates database for smart route calculations
const LOCATIONS = {
  central: { name: 'Smart City Hall (Central)', lat: 12.9716, lng: 77.5946 },
  residency: { name: 'Residency Road Junction', lat: 12.9725, lng: 77.6012 },
  mg_road: { name: 'MG Road Metro Station', lat: 12.9738, lng: 77.6068 },
  trinity: { name: 'Trinity Junction', lat: 12.9732, lng: 77.6210 },
  cubbon: { name: 'Cubbon Park West Gate', lat: 12.9760, lng: 77.5925 },
  kanteerava: { name: 'Kanteerava Stadium South', lat: 12.9690, lng: 77.5930 },
  cantonment: { name: 'Cantonment Railway Station', lat: 12.9930, lng: 77.5980 }
};

export function RenderMapPage(user) {
  const outlet = document.getElementById('router-outlet');
  
  // Base structural container
  outlet.innerHTML = `
    <div class="map-page-container">
      
      <!-- Drawer Sidebar Control -->
      <aside class="map-sidebar-drawer">
        
        <!-- Section 1: Router Planner -->
        <div class="map-drawer-section">
          <div class="map-drawer-title"><i data-lucide="route"></i> Smart Route Planner</div>
          <div class="route-selector-inputs">
            <div class="route-input-wrapper">
              <i data-lucide="map-pin" class="route-input-icon"></i>
              <select id="route-source" class="route-select-field">
                <option value="" disabled selected>Select Source...</option>
                ${Object.entries(LOCATIONS).map(([key, loc]) => `<option value="${key}">${loc.name}</option>`).join('')}
              </select>
            </div>
            
            <div class="route-input-wrapper">
              <i data-lucide="navigation" class="route-input-icon"></i>
              <select id="route-destination" class="route-select-field">
                <option value="" disabled selected>Select Destination...</option>
                ${Object.entries(LOCATIONS).map(([key, loc]) => `<option value="${key}">${loc.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Mode selectors -->
          <div class="route-modes-grid">
            <input type="radio" id="mode-fastest" name="route-mode" value="fastest" checked class="route-mode-checkbox">
            <label for="mode-fastest" class="route-mode-label" title="Fastest Route">
              <i data-lucide="zap"></i><span>Fast</span>
            </label>

            <input type="radio" id="mode-wheelchair" name="route-mode" value="wheelchair" class="route-mode-checkbox">
            <label for="mode-wheelchair" class="route-mode-label" title="Wheelchair Accessible Route">
              <i data-lucide="accessibility"></i><span>Access</span>
            </label>

            <input type="radio" id="mode-emergency" name="route-mode" value="emergency" class="route-mode-checkbox">
            <label for="mode-emergency" class="route-mode-label" title="Emergency Services Corridor">
              <i data-lucide="ambulance"></i><span>SOS</span>
            </label>

            <input type="radio" id="mode-cycle" name="route-mode" value="cycling" class="route-mode-checkbox">
            <label for="mode-cycle" class="route-mode-label" title="Eco Cycling Route">
              <i data-lucide="bike"></i><span>Cycle</span>
            </label>
          </div>

          <div id="route-output-box" class="route-output-details hidden"></div>
        </div>

        <!-- Section 2: Facility Map Filters -->
        <div class="map-drawer-section">
          <div class="map-drawer-title"><i data-lucide="layers-3"></i> POI Map Filters</div>
          <div class="filter-tags-group">
            <input type="checkbox" id="filter-hospitals" checked class="filter-tags-group filter-tag-checkbox">
            <label for="filter-hospitals" class="filter-tag-label"><i data-lucide="heart-pulse"></i> Hospitals</label>

            <input type="checkbox" id="filter-metro" checked class="filter-tags-group filter-tag-checkbox">
            <label for="filter-metro" class="filter-tag-label"><i data-lucide="subway"></i> Transit</label>

            <input type="checkbox" id="filter-parking" checked class="filter-tags-group filter-tag-checkbox">
            <label for="filter-parking" class="filter-tag-label"><i data-lucide="square-p"></i> Parking</label>

            <input type="checkbox" id="filter-complaints" checked class="filter-tags-group filter-tag-checkbox">
            <label for="filter-complaints" class="filter-tag-label"><i data-lucide="message-square-warning"></i> Issues</label>
          </div>
        </div>

        <!-- Section 3: Smart Cities Layers -->
        <div class="map-drawer-section">
          <div class="map-drawer-title"><i data-lucide="activity"></i> Demo Map Layers</div>
          <div class="layers-menu">
            <div class="layer-toggle-row">
              <span class="layer-toggle-info"><i data-lucide="gauge" class="env-icon" style="color:var(--color-rejected);"></i> Traffic Heat Overlay</span>
              <label class="switch">
                <input type="checkbox" id="layer-traffic">
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="layer-toggle-row">
              <span class="layer-toggle-info"><i data-lucide="wind" class="env-icon" style="color:var(--accent);"></i> Air Quality (AQI) Layer</span>
              <label class="switch">
                <input type="checkbox" id="layer-aqi">
                <span class="slider"></span>
              </label>
            </div>

            <div class="layer-toggle-row">
              <span class="layer-toggle-info"><i data-lucide="cloud-sun" class="env-icon" style="color:var(--color-pending);"></i> Weather Cloud Overlay</span>
              <label class="switch">
                <input type="checkbox" id="layer-weather">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

      </aside>

      <!-- Map View Canvas -->
      <section class="map-canvas-wrapper">
        <div id="map"></div>
        
        <!-- Floating Navigation Controls -->
        <div class="map-floating-overlay">
          <button id="btn-recenter" class="map-floating-btn" title="Recenter to Central Hall"><i data-lucide="locate-fixed"></i></button>
          <button id="btn-mock-gps" class="map-floating-btn" title="Simulate Current GPS Position"><i data-lucide="user-check"></i></button>
        </div>
      </section>

    </div>
  `;

  lucide.createIcons();
  
  // Allow DOM to settle before initializing map
  setTimeout(() => {
    initLeafletMap();
    bindMapControls();
  }, 100);
}

function initLeafletMap() {
  // Center map on central point
  const centerLat = LOCATIONS.central.lat;
  const centerLng = LOCATIONS.central.lng;

  mapInstance = L.map('map', {
    zoomControl: true
  }).setView([centerLat, centerLng], 14);

  // Load OpenStreetMap tiles
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapInstance);

  // Render original point markers
  updateMarkers();
}

function updateMarkers() {
  // Clear any existing markers
  markersGroup.forEach(m => mapInstance.removeLayer(m));
  markersGroup = [];

  const showHospitals = document.getElementById('filter-hospitals')?.checked;
  const showTransit = document.getElementById('filter-metro')?.checked;
  const showParking = document.getElementById('filter-parking')?.checked;
  const showComplaints = document.getElementById('filter-complaints')?.checked;

  // 1. Render Static Locations (Hospitals)
  if (showHospitals) {
    const hospitalLocations = [
      { name: 'City Central Government Hospital', lat: 12.9705, lng: 77.6050, spec: 'Emergency 24x7. Fully Ramp Accessible.' },
      { name: 'Fortis Clinic Hub', lat: 12.9790, lng: 77.5910, spec: 'Trauma ward. Wheelchair parking available.' }
    ];

    hospitalLocations.forEach(h => {
      const icon = L.divIcon({
        className: 'custom-map-marker marker-hospital',
        html: `<div style="background-color: var(--color-rejected); color: white; border-radius:50%; width: 28px; height: 28px; display:flex; align-items:center; justify-content:center; border: 2px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.25);"><i data-lucide="heart-pulse" style="width:14px; height:14px;"></i></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const m = L.marker([h.lat, h.lng], { icon }).addTo(mapInstance)
        .bindPopup(`
          <h3>🏥 ${h.name}</h3>
          <p>${h.spec}</p>
          <p>Coordinates: ${h.lat}, ${h.lng}</p>
        `);
      markersGroup.push(m);
    });
  }

  // 2. Render Public Transit (Metro & Bus)
  if (showTransit) {
    const stations = DB.getStations();
    stations.forEach(s => {
      const isMetro = s.type === 'metro';
      const color = isMetro ? '#8b5cf6' : '#3b82f6';
      const iconSymbol = isMetro ? 'subway' : 'bus';
      
      const icon = L.divIcon({
        className: `custom-map-marker marker-transit`,
        html: `<div style="background-color: ${color}; color: white; border-radius:50%; width: 28px; height: 28px; display:flex; align-items:center; justify-content:center; border: 2px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.25);"><i data-lucide="${iconSymbol}" style="width:14px; height:14px;"></i></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const m = L.marker([s.lat, s.lng], { icon }).addTo(mapInstance)
        .bindPopup(`
          <h3>${isMetro ? '🚇' : '🚌'} ${s.name}</h3>
          <p>Routes: ${s.routes.join(', ')}</p>
          <p>Access status: ${s.accessible ? '✅ Wheelchair Accessible Ramps & Elevators' : '❌ Steps Only'}</p>
          <p>Schedule: ${s.timetable[0]}</p>
        `);
      markersGroup.push(m);
    });
  }

  // 3. Render Parking Lots
  if (showParking) {
    const parkingLots = DB.getParking();
    parkingLots.forEach(p => {
      const freeSpots = p.capacity - p.occupied;
      const pct = Math.floor((freeSpots / p.capacity) * 100);
      const color = pct > 20 ? 'var(--color-resolved)' : 'var(--color-pending)';
      
      const icon = L.divIcon({
        className: 'custom-map-marker marker-parking',
        html: `<div style="background-color: var(--primary); color: white; border-radius:50%; width: 28px; height: 28px; display:flex; align-items:center; justify-content:center; border: 2px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.25);"><span style="font-weight:800; font-size:11px;">P</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const m = L.marker([p.lat, p.lng], { icon }).addTo(mapInstance)
        .bindPopup(`
          <h3>🅿️ ${p.name}</h3>
          <p>Charges: ${p.charges}</p>
          <p>Access parking: ${p.accessible ? '♿ Yes, dedicated accessible bays' : '⚠️ Standard spaces only'}</p>
          <p>Availability: <strong style="color:${color};">${freeSpots} / ${p.capacity} slots free</strong></p>
        `);
      markersGroup.push(m);
    });
  }

  // 4. Render Active Complaints (Only non-rejected ones)
  if (showComplaints) {
    const complaints = DB.getComplaints().filter(c => c.status !== 'rejected');
    complaints.forEach(c => {
      let iconColor = 'var(--color-pending)';
      if (c.status === 'resolved') iconColor = 'var(--color-resolved)';
      if (c.status === 'in-progress') iconColor = 'var(--color-progress)';
      if (c.status === 'under-review') iconColor = 'var(--color-review)';

      const icon = L.divIcon({
        className: 'custom-map-marker marker-complaint',
        html: `<div style="background-color: ${iconColor}; color: white; border-radius:50%; width: 28px; height: 28px; display:flex; align-items:center; justify-content:center; border: 2px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.25);"><i data-lucide="alert-triangle" style="width:12px; height:12px;"></i></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const m = L.marker([c.lat, c.lng], { icon }).addTo(mapInstance)
        .bindPopup(`
          <h3>⚠️ Complaint ID: ${c.id}</h3>
          <p><strong>${c.title}</strong></p>
          <p>Status: <span class="badge badge-${c.status}">${c.status}</span></p>
          <p>Severity: <span style="text-transform:capitalize; font-weight:700; color:var(--color-error);">${c.severity}</span></p>
          <p>Location: ${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}</p>
          <a href="#/complaints" style="color:var(--primary); font-size:0.8rem; font-weight:700;">Track progress & support &rarr;</a>
        `);
      markersGroup.push(m);
    });
  }

  lucide.createIcons();
}

function bindMapControls() {
  // Bind Recentering controls
  document.getElementById('btn-recenter').addEventListener('click', () => {
    mapInstance.setView([LOCATIONS.central.lat, LOCATIONS.central.lng], 14);
    showToast('Map recentered to Central Hall.', 'info');
  });

  // Bind Mock GPS position
  document.getElementById('btn-mock-gps').addEventListener('click', () => {
    const mockUserLat = 12.9750;
    const mockUserLng = 77.6000;

    mapInstance.setView([mockUserLat, mockUserLng], 16);

    const icon = L.divIcon({
      className: 'user-gps-marker',
      html: `<div class="pulse-marker" style="background-color: #10b981; border: 3px solid white; border-radius:50%; width:20px; height:20px; box-shadow:0 0 0 10px rgba(16,185,129,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    L.marker([mockUserLat, mockUserLng], { icon }).addTo(mapInstance)
      .bindPopup('<h3>📍 Your Location</h3><p>Accuracy: &plusmn; 4 meters</p>')
      .openPopup();

    showToast('GPS position successfully calibrated.', 'success');
  });

  // Bind POI filter checkboxes
  const filterCheckboxes = document.querySelectorAll('.filter-tag-checkbox');
  filterCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      updateMarkers();
    });
  });

  // Bind Route planner selects
  const sourceSelect = document.getElementById('route-source');
  const destSelect = document.getElementById('route-destination');
  const modeRadios = document.getElementsByName('route-mode');

  const onRouteFormChange = () => {
    const srcKey = sourceSelect.value;
    const destKey = destSelect.value;
    
    let activeMode = 'fastest';
    for (const r of modeRadios) {
      if (r.checked) activeMode = r.value;
    }

    if (srcKey && destKey) {
      calculateAndDrawRoute(srcKey, destKey, activeMode);
    }
  };

  sourceSelect.addEventListener('change', onRouteFormChange);
  destSelect.addEventListener('change', onRouteFormChange);
  modeRadios.forEach(r => r.addEventListener('change', onRouteFormChange));

  // Bind Switch overlays (Layers)
  document.getElementById('layer-traffic').addEventListener('change', (e) => {
    toggleTrafficLayer(e.target.checked);
  });
  document.getElementById('layer-aqi').addEventListener('change', (e) => {
    toggleAqiLayer(e.target.checked);
  });
  document.getElementById('layer-weather').addEventListener('change', (e) => {
    toggleWeatherLayer(e.target.checked);
  });
}

function calculateAndDrawRoute(srcKey, destKey, mode) {
  // Clear any existing route lines
  routeLines.forEach(l => mapInstance.removeLayer(l));
  routeLines = [];

  if (srcKey === destKey) {
    showToast('Source and Destination cannot be identical.', 'warning');
    document.getElementById('route-output-box').classList.add('hidden');
    return;
  }

  const src = LOCATIONS[srcKey];
  const dest = LOCATIONS[destKey];

  // Draw polyline with curved simulation coordinates for smart paths
  const midLat = (src.lat + dest.lat) / 2;
  const midLng = (src.lng + dest.lng) / 2;
  
  // Custom routing path points (curved around roadways rather than straight line)
  let routePath = [
    [src.lat, src.lng],
    [midLat + 0.0015, midLng - 0.0012],
    [dest.lat, dest.lng]
  ];

  let color = '#2563eb'; // standard primary
  let speedMultiplier = 1.0;
  let recommendation = '';
  let modeName = 'Vehicle';

  if (mode === 'wheelchair') {
    color = '#10b981'; // Green friendly
    speedMultiplier = 4.2; // much slower
    recommendation = '♿ Barrier-Free Route: Access ramps verified at all crossings. Pedestrian footpaths fully audited.';
    modeName = 'Wheelchair';
  } else if (mode === 'emergency') {
    color = '#ef4444'; // SOS Red
    speedMultiplier = 0.65; // much faster
    recommendation = '🚨 Emergency Priority Route: Command centers alert to green-light next signals.';
    modeName = 'Emergency Responder';
  } else if (mode === 'cycling') {
    color = '#06b6d4'; // Cyan cycling lane
    speedMultiplier = 2.5;
    recommendation = '🚴 Eco-Cycling Route: Prioritizes streets with dedicated bike paths and lower pollution values.';
    modeName = 'Bicycle';
  } else {
    // fastest (car)
    recommendation = '🚗 Standard Route: Optimized for typical city traffic patterns.';
  }

  // Draw on Map
  const poly = L.polyline(routePath, {
    color,
    weight: 6,
    opacity: 0.85,
    dashArray: mode === 'wheelchair' ? '1, 10' : null
  }).addTo(mapInstance);
  
  routeLines.push(poly);

  // Auto-fit route
  mapInstance.fitBounds(poly.getBounds(), { padding: [50, 50] });

  // Calculate simulated distances & durations
  // Distance: spherical law of cosines simulation
  const rawDist = Math.sqrt(Math.pow(dest.lat - src.lat, 2) + Math.pow(dest.lng - src.lng, 2)) * 111.32; // degrees to km approx
  const finalDistance = Math.max(0.5, rawDist + 0.4); // pad for roads winding

  // Traffic density check
  const isTrafficOverlayOn = document.getElementById('layer-traffic')?.checked;
  const trafficImpact = isTrafficOverlayOn ? 1.45 : 1.0; // 45% increase if traffic heatmap enabled

  let finalDurationMinutes = Math.round((finalDistance / (45 / speedMultiplier)) * 60 * trafficImpact);
  if (finalDurationMinutes < 2) finalDurationMinutes = 3;

  const outputBox = document.getElementById('route-output-box');
  outputBox.innerHTML = `
    <div class="route-output-row">
      <span>Travel Mode:</span>
      <span class="route-output-value">${modeName}</span>
    </div>
    <div class="route-output-row">
      <span>Total Distance:</span>
      <span class="route-output-value">${finalDistance.toFixed(2)} km</span>
    </div>
    <div class="route-output-row">
      <span>Est. Commute Time:</span>
      <span class="route-output-value" style="color: ${finalDurationMinutes > 25 ? 'var(--color-pending)' : 'var(--color-resolved)'}">${finalDurationMinutes} mins</span>
    </div>
    <div class="route-output-row">
      <span>Traffic Congestion:</span>
      <span class="route-output-value" style="color: ${isTrafficOverlayOn ? 'var(--color-rejected)' : 'var(--color-resolved)'}">${isTrafficOverlayOn ? 'Heavy (Delayed)' : 'Clear (Normal)'}</span>
    </div>
    <div class="route-recommendation-badge">
      <i data-lucide="info" style="width:14px; height:14px; flex-shrink:0;"></i>
      <span>${recommendation}</span>
    </div>
  `;
  outputBox.classList.remove('hidden');
  lucide.createIcons();
  
  showToast(`Calculated route for ${modeName}`, 'success');
}

// Map Overlays Toggles (Layer simulations)
function toggleTrafficLayer(enable) {
  // Clear old ones
  trafficOverlays.forEach(o => mapInstance.removeLayer(o));
  trafficOverlays = [];

  if (!enable) {
    // Recalculate route if active to account for traffic speed
    const srcKey = document.getElementById('route-source')?.value;
    const destKey = document.getElementById('route-destination')?.value;
    if (srcKey && destKey) {
      calculateAndDrawRoute(srcKey, destKey, document.querySelector('input[name="route-mode"]:checked').value);
    }
    return;
  }

  // Draw simulated heavy congestion vectors (red/yellow transparent lines on main street routes)
  const heavyRoads = [
    [[12.9738, 77.6068], [12.9725, 77.6012], [12.9716, 77.5946]], // MG Road to City Hall
    [[12.9732, 77.6210], [12.9738, 77.6068]] // Trinity to MG Road
  ];

  heavyRoads.forEach((pts, idx) => {
    const color = idx === 0 ? '#ef4444' : '#f59e0b'; // Red or Orange
    const line = L.polyline(pts, {
      color,
      weight: 12,
      opacity: 0.55,
      className: 'traffic-heatmap-line'
    }).addTo(mapInstance);
    trafficOverlays.push(line);
  });

  // Re-run routing if active to calculate traffic penalty
  const srcKey = document.getElementById('route-source')?.value;
  const destKey = document.getElementById('route-destination')?.value;
  if (srcKey && destKey) {
    calculateAndDrawRoute(srcKey, destKey, document.querySelector('input[name="route-mode"]:checked').value);
  }

  showToast('Traffic congestion heatmap enabled.', 'info');
}

function toggleAqiLayer(enable) {
  if (pollutionOverlay) {
    mapInstance.removeLayer(pollutionOverlay);
    pollutionOverlay = null;
  }

  if (!enable) return;

  // Render air quality zones (semi-transparent red circle over commercial street blockages)
  pollutionOverlay = L.circle([12.9808, 77.6074], {
    color: '#ef4444',
    fillColor: '#f87171',
    fillOpacity: 0.25,
    radius: 700
  }).addTo(mapInstance)
    .bindPopup('<h3>😷 AQI Level: 185 (Unhealthy)</h3><p>Higher PM2.5 levels detected. Cyclists are recommended to seek alternative green routes.</p>');

  showToast('Air Quality Index overlay overlayed.', 'info');
}

function toggleWeatherLayer(enable) {
  if (weatherOverlay) {
    mapInstance.removeLayer(weatherOverlay);
    weatherOverlay = null;
  }

  if (!enable) return;

  // Draw cloud vectors (semi-transparent grey polygons covering top part of the map)
  const weatherZone = [
    [12.9820, 77.5850],
    [12.9990, 77.5900],
    [12.9900, 77.6150],
    [12.9800, 77.6000]
  ];

  weatherOverlay = L.polygon(weatherZone, {
    color: '#9ca3af',
    fillColor: '#d1d5db',
    fillOpacity: 0.35
  }).addTo(mapInstance)
    .bindPopup('<h3>☁️ Light Rain Showers Expected</h3><p>Localized cloudburst passing north. Road grip conditions reduced.</p>');

  showToast('Weather Cloud tracker overlayed.', 'info');
}
