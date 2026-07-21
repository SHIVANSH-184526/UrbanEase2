/* Citizen Dashboard Module (js/dashboard.js) */

import { DB } from './state.js';
import { showToast } from './app.js';

export function RenderUserDashboard(user) {
  const outlet = document.getElementById('router-outlet');
  
  // Fetch dynamic statistics based on actual storage data
  const complaints = DB.getComplaints();
  const userComplaints = complaints.filter(c => c.reporter === user.username);
  const totalReportsCount = userComplaints.length;
  const pendingReportsCount = userComplaints.filter(c => c.status === 'pending' || c.status === 'under-review').length;
  
  outlet.innerHTML = `
    <div class="dashboard-container">
      
      <!-- Dashboard Sidebar -->
      <aside class="db-sidebar">
        <div class="db-user-card">
          <div class="db-avatar">${user.name.charAt(0)}</div>
          <div class="db-user-info">
            <span class="db-user-name">${user.name}</span>
            <span class="db-user-role">${user.role} Account</span>
          </div>
        </div>
        
        <nav class="db-nav">
          <a href="#/dashboard" class="db-nav-link active"><i data-lucide="layout-dashboard"></i> Dashboard</a>
          <a href="#/map" class="db-nav-link"><i data-lucide="map"></i> Interactive Map</a>
          <a href="#/complaints" class="db-nav-link"><i data-lucide="message-square-warning"></i> Report Issues</a>
          <a href="#/profile" class="db-nav-link"><i data-lucide="user-cog"></i> Profile Settings</a>
        </nav>
      </aside>

      <!-- Dashboard Main Work Area -->
      <main class="db-main">
        
        <div class="db-header">
          <div>
            <h1>Dashboard</h1>
            <p style="color:var(--text-secondary); margin-top:0.3rem;">Welcome to the Integrated Smart City Portal, ${user.name.split(' ')[0]}.</p>
          </div>
          <div class="db-header-actions">
            <a href="#/map" class="btn btn-primary"><i data-lucide="map-pin"></i> Open Map</a>
          </div>
        </div>

        <!-- 1. Stats Counter Cards -->
        <div class="stats-grid">
          <div class="stat-card glass">
            <div class="stat-content">
              <span class="stat-value">${user.reputationScore} / 100</span>
              <span class="stat-label">Citizen Reputation Score</span>
            </div>
            <div class="stat-icon" style="background-color: var(--color-resolved-bg); color: var(--color-resolved);"><i data-lucide="shield-check"></i></div>
          </div>

          <div class="stat-card glass">
            <div class="stat-content">
              <span class="stat-value">${totalReportsCount}</span>
              <span class="stat-label">Total Reports Filed</span>
            </div>
            <div class="stat-icon" style="background-color: var(--primary-glow); color: var(--primary);"><i data-lucide="file-text"></i></div>
          </div>

          <div class="stat-card glass">
            <div class="stat-content">
              <span class="stat-value">${pendingReportsCount}</span>
              <span class="stat-label">Pending Reviews</span>
            </div>
            <div class="stat-icon" style="background-color: var(--color-pending-bg); color: var(--color-pending);"><i data-lucide="clock"></i></div>
          </div>
        </div>

        <!-- 2. Main Dashboard Grid -->
        <div class="dashboard-layout-grid">
          
          <!-- Column 1: AI Suggestions & Environmental Readings -->
          <div style="display:flex; flex-direction:column; gap:2rem;">
            
            <!-- AI Suggestions Card -->
            <div class="widget-card glass">
              <div class="widget-title">
                <span>🤖 AI Mobility Recommendations</span>
                <span class="badge badge-resolved">Live Advisory</span>
              </div>
              <div class="ai-suggestions-list">
                <div class="ai-suggestion-item">
                  <i data-lucide="zap" class="ai-suggestion-icon"></i>
                  <div class="ai-suggestion-text">
                    <h4>Best Time to Travel: Central Corridor</h4>
                    <p>Based on smart signal queue lengths, traffic density on Residency Road drops by 35% starting at 10:15 AM. Plan departures accordingly.</p>
                  </div>
                </div>

                <div class="ai-suggestion-item" style="border-left-color: var(--color-pending);">
                  <i data-lucide="accessibility" class="ai-suggestion-icon" style="color:var(--color-pending);"></i>
                  <div class="ai-suggestion-text">
                    <h4>Accessibility Alert: MG Road Metro Station</h4>
                    <p>Audited: Elevator B is fully active. Pedestrians with strollers or wheelchairs can access Platform 1 barrier-free.</p>
                  </div>
                </div>

                <div class="ai-suggestion-item" style="border-left-color: var(--color-rejected);">
                  <i data-lucide="wind" class="ai-suggestion-icon" style="color:var(--color-rejected);"></i>
                  <div class="ai-suggestion-text">
                    <h4>Pollution Caution Advisory</h4>
                    <p>AQI surrounding Commercial St has surged to 185 (Poor). Walkers/Cyclists should bypass and travel through Cubbon Park paths instead.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Transit & Parking Summary Widgets -->
            <div class="widget-card glass">
              <div class="widget-title">
                <span>🚘 Nearby Parking Spots (Demo Availability)</span>
                <a href="#/map" style="color:var(--primary); font-size:0.8rem; font-weight:700;">Find on Map &rarr;</a>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                ${DB.getParking().slice(0, 4).map(p => {
                  const free = p.capacity - p.occupied;
                  const pct = Math.floor((free / p.capacity) * 100);
                  const color = pct > 20 ? 'var(--color-resolved)' : 'var(--color-pending)';
                  return `
                    <div style="padding:0.8rem; border-radius:10px; background-color:var(--bg-secondary); border:1px solid var(--border-color); display:flex; flex-direction:column; gap:0.3rem;">
                      <span style="font-weight:700; font-size:0.85rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</span>
                      <div style="display:flex; justify-content:space-between; font-size:0.75rem;">
                        <span>Charges: ${p.charges}</span>
                        <strong style="color:${color};">${free} / ${p.capacity} Free</strong>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

          </div>

          <!-- Column 2: SOS panel, Weather & Contacts -->
          <div style="display:flex; flex-direction:column; gap:2rem;">
            
            <!-- SOS Emergency Panel -->
            <div class="sos-card">
              <h3>🚨 Emergency Services SOS</h3>
              <p>Pressing the button below broadcasts instant GPS telemetry coordinates to City Emergency Dispatch Teams.</p>
              <button id="sos-btn-trigger" class="sos-btn">SOS</button>
              <p style="font-size:0.75rem; margin-top:0.3rem; opacity:0.8;">Single click triggers demo response callout.</p>
            </div>

            <!-- Environmental Summary Card -->
            <div class="widget-card glass">
              <div class="widget-title"><span>🌤️ City Environment Feed</span></div>
              <div class="env-widget">
                <div class="env-row">
                  <div class="env-info">
                    <i data-lucide="cloud-sun" class="env-icon"></i>
                    <span class="env-label">Weather Forecast</span>
                  </div>
                  <span class="env-value">28&deg;C, Scattered Clouds</span>
                </div>
                
                <div class="env-row">
                  <div class="env-info">
                    <i data-lucide="wind" class="env-icon" style="color:var(--color-resolved);"></i>
                    <span class="env-label">Air Quality (AQI)</span>
                  </div>
                  <span class="env-value" style="color:var(--color-resolved);">84 (Good)</span>
                </div>

                <div class="env-row">
                  <div class="env-info">
                    <i data-lucide="droplets" class="env-icon" style="color:var(--primary);"></i>
                    <span class="env-label">Humidity Index</span>
                  </div>
                  <span class="env-value">62%</span>
                </div>
              </div>
            </div>

            <!-- Emergency Numbers -->
            <div class="widget-card glass">
              <div class="widget-title"><span>📞 Emergency Contacts</span></div>
              <div style="display:flex; flex-direction:column; gap:0.8rem; font-size:0.85rem;">
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:0.4rem;">
                  <span>Smart City Command Control</span>
                  <strong>1912</strong>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:0.4rem;">
                  <span>Emergency Police Assistance</span>
                  <strong>112</strong>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:0.4rem;">
                  <span>Fire Responder Control</span>
                  <strong>101</strong>
                </div>
                <div style="display:flex; justify-content:space-between; padding-bottom:0.1rem;">
                  <span>Ambulance Services</span>
                  <strong>108</strong>
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- 3. Recent Announcements Published by Admin -->
        <div class="widget-card glass">
          <div class="widget-title">
            <span>📢 Official Municipal Announcements</span>
            <i data-lucide="megaphone" style="color:var(--primary);"></i>
          </div>
          <div style="display:flex; flex-direction:column; gap:1.2rem;">
            ${DB.getAnnouncements().map(a => `
              <div style="border-bottom: 1px solid var(--border-color); padding-bottom:1rem; display:flex; flex-direction:column; gap:0.4rem;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <h4 style="font-weight:700; font-size:1rem; color:var(--primary);">${a.title}</h4>
                  <span style="font-size:0.75rem; color:var(--text-muted);">${new Date(a.date).toLocaleDateString()}</span>
                </div>
                <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5;">${a.content}</p>
                <span style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">Issued by: ${a.author}</span>
              </div>
            `).join('')}
          </div>
        </div>

      </main>

    </div>
  `;

  lucide.createIcons();
  bindDashboardControls();
}

function bindDashboardControls() {
  const sosBtn = document.getElementById('sos-btn-trigger');
  
  sosBtn.addEventListener('click', () => {
    // Show high priority alert
    showToast('🚨 EMERGENCY SOS SENT! Dispatching telemetry logs to Integrated Command Center.', 'error', 6000);
    
    // Create simulated fullscreen overlay showing alerts flashing
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
    overlay.style.color = 'white';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '99999';
    overlay.style.gap = '2rem';
    overlay.style.animation = 'flashSOSOverlay 1s infinite alternate';

    overlay.innerHTML = `
      <i data-lucide="shield-alert" style="width: 120px; height: 120px;"></i>
      <h1 style="font-size: 3rem; font-family:var(--font-heading); font-weight:800; color:white; text-align:center;">SOS METRICS DISPATCHED</h1>
      <p style="font-size: 1.2rem; max-width:600px; text-align:center; color:white; font-weight:600;">
        Emergency command vehicles have locked GPS tracking coordinates. First responders alerted. Stay calm. Help is on the way.
      </p>
      <button id="close-sos-overlay" class="btn btn-secondary btn-lg" style="background-color:white; color:#ef4444; border:none; padding:1rem 2rem; font-size:1.1rem; border-radius:50px; font-weight:800;">DISMISS SOS PROTOCOL</button>
    `;

    document.body.appendChild(overlay);
    lucide.createIcons();

    // Flash keyframe animation
    const style = document.createElement('style');
    style.id = 'sos-animation-style';
    style.textContent = `
      @keyframes flashSOSOverlay {
        from { opacity: 0.95; }
        to { opacity: 0.85; }
      }
    `;
    document.head.appendChild(style);

    // Bind close
    document.getElementById('close-sos-overlay').addEventListener('click', () => {
      overlay.remove();
      style.remove();
      showToast('Emergency SOS dismissed.', 'info');
    });
  });
}
