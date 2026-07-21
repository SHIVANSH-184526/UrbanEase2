/* Citizen Complaints Portal Logic (js/complaints.js) */

import { DB } from './state.js';
import { showToast } from './app.js';

let selectedCoordinates = null;
let currentDetailId = null;
let imageBase64 = '';

export function RenderComplaintsPortal(user) {
  const outlet = document.getElementById('router-outlet');
  
  outlet.innerHTML = `
    <div class="dashboard-container">
      
      <!-- Sidebar navigation -->
      <aside class="db-sidebar">
        <div class="db-user-card">
          <div class="db-avatar">${user.name.charAt(0)}</div>
          <div class="db-user-info">
            <span class="db-user-name">${user.name}</span>
            <span class="db-user-role">${user.role} Account</span>
          </div>
        </div>
        
        <nav class="db-nav">
          <a href="#/dashboard" class="db-nav-link"><i data-lucide="layout-dashboard"></i> Dashboard</a>
          <a href="#/map" class="db-nav-link"><i data-lucide="map"></i> Interactive Map</a>
          <a href="#/complaints" class="db-nav-link active"><i data-lucide="message-square-warning"></i> Report Issues</a>
          <a href="#/profile" class="db-nav-link"><i data-lucide="user-cog"></i> Profile Settings</a>
        </nav>
      </aside>

      <!-- Main Portal Content -->
      <main class="db-main">
        
        <div class="db-header">
          <div>
            <h1>Citizen Incident Portal</h1>
            <p style="color:var(--text-secondary); margin-top:0.3rem;">File urban mobility complaints and track resolution cycles in real time.</p>
          </div>
          <div class="db-header-actions">
            <!-- Summary reputation block -->
            <div style="font-size:0.85rem; font-weight:600; color:var(--text-secondary); display:flex; align-items:center; gap:0.5rem; background:var(--card-bg); padding:0.5rem 1rem; border-radius:10px; border:1px solid var(--card-border);">
              <i data-lucide="medal" style="color:var(--color-resolved); width:18px; height:18px;"></i>
              <span>Reputation Score: <strong>${user.reputationScore}</strong></span>
            </div>
          </div>
        </div>

        <!-- Portal Columns Grid -->
        <div class="complaints-container">
          
          <!-- Column 1: Submit Form -->
          <div class="glass" style="padding: 2rem; display:flex; flex-direction:column; gap:1.5rem; height:fit-content;">
            <h3 style="font-size: 1.25rem; font-weight: 700; border-bottom:1px solid var(--border-color); padding-bottom:0.8rem;">
              <i data-lucide="edit-3" style="color:var(--primary); vertical-align:middle; display:inline-block; margin-right:0.4rem;"></i>
              File New Mobility Report
            </h3>

            <!-- Fake Warning Alert -->
            <div class="warning-alert-banner">
              <i data-lucide="alert-triangle"></i>
              <div>
                <strong>Identity verified via GPS.</strong> Filing verified fake/spam reports will decrease your reputation score and lead to account suspension.
              </div>
            </div>

            <form id="complaint-submit-form" class="auth-form">
              <div class="form-group">
                <label>Issue Title</label>
                <input type="text" id="comp-title" class="form-control" placeholder="Briefly describe the obstacle (e.g. Broken pavement)" required>
              </div>

              <div class="form-group">
                <label>Category</label>
                <select id="comp-category" class="form-control" required>
                  <option value="" disabled selected>Choose category...</option>
                  <option value="pothole">Pothole / Road damage</option>
                  <option value="street-light-failure">Street Light Failure</option>
                  <option value="traffic-signal-failure">Traffic Signal Failure</option>
                  <option value="garbage-blocking">Garbage Blockade on footpaths</option>
                  <option value="damaged-footpath">Damaged Wheelchair Ramps / Sidewalks</option>
                  <option value="accident">Accident / Road obstruction</option>
                </select>
              </div>

              <div class="form-group">
                <label>Severity Level</label>
                <select id="comp-severity" class="form-control" required>
                  <option value="low">Low (Minor inconvenience)</option>
                  <option value="medium" selected>Medium (Pedestrians forced onto road)</option>
                  <option value="high">High (Injury risk / Complete blockage)</option>
                </select>
              </div>

              <div class="form-group">
                <label>Issue Location (GPS Coordinates)</label>
                <div style="display:flex; gap:0.5rem;">
                  <input type="text" id="comp-coords" class="form-control" placeholder="Click map below to set coordinates..." readonly required style="cursor:not-allowed;">
                  <button type="button" id="btn-comp-gps" class="btn btn-outline" style="padding:0 0.8rem;"><i data-lucide="map-pin"></i></button>
                </div>
                <span style="font-size:0.75rem; color:var(--text-muted);">Click anywhere on the mini-map to calibrate coordinates automatically.</span>
              </div>

              <!-- Mini map for GPS verification -->
              <div id="mini-map" class="glass" style="height:160px; width:100%; border-radius:10px; z-index:1;"></div>

              <div class="form-group">
                <label>Detailed Description</label>
                <textarea id="comp-description" class="form-control" rows="3" placeholder="Provide dimensions, safety impact, specific storefront markers, etc." required></textarea>
              </div>

              <!-- Image Upload Drag Zone -->
              <div class="form-group">
                <label>Upload Supporting Photo</label>
                <div class="image-upload-zone" id="upload-zone">
                  <i data-lucide="camera" style="width:32px; height:32px; color:var(--text-muted);"></i>
                  <span style="font-size:0.85rem; font-weight:600;">Drag file here or click to browse</span>
                  <span style="font-size:0.75rem; color:var(--text-muted);">Max size 2MB. JPEG, PNG.</span>
                  <input type="file" id="comp-image-file" accept="image/*" style="position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer;">
                </div>
                
                <div id="upload-preview-container" class="image-preview-container">
                  <img id="upload-preview" src="" alt="Incident Preview">
                </div>
              </div>

              <button type="submit" class="btn btn-primary" style="width:100%;">Submit Verified Report</button>
            </form>
          </div>

          <!-- Column 2: Complaints List & Details view -->
          <div style="display:flex; flex-direction:column; gap:2rem;">
            
            <!-- Details view block (Conditional) -->
            <div id="complaint-details-panel" class="glass widget-card hidden">
              <!-- Dynamically populated when a complaint is clicked -->
            </div>

            <!-- List view -->
            <div class="widget-card glass">
              <div class="widget-title">
                <span>📋 Active Municipal Reports</span>
                <span style="font-size:0.8rem; color:var(--text-secondary); font-weight:500;">Click any card to track details</span>
              </div>
              
              <div id="complaints-list-container" style="display:flex; flex-direction:column; gap:1rem; max-height:650px; overflow-y:auto; padding-right:0.2rem;">
                <!-- Populated via Javascript -->
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  `;

  lucide.createIcons();
  
  // DOM setup
  setTimeout(() => {
    initMiniMap();
    bindComplaintsControls(user);
    renderComplaintsList(user);
  }, 100);
}

function initMiniMap() {
  const defaultLat = 12.9716;
  const defaultLng = 77.5946;

  const miniMap = L.map('mini-map', {
    zoomControl: false,
    attributionControl: false
  }).setView([defaultLat, defaultLng], 13);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
  }).addTo(miniMap);

  let selectionMarker = null;

  miniMap.on('click', (e) => {
    const { lat, lng } = e.latlng;
    selectedCoordinates = { lat, lng };

    document.getElementById('comp-coords').value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    if (selectionMarker) {
      selectionMarker.setLatLng(e.latlng);
    } else {
      const icon = L.divIcon({
        className: 'gps-selection-dot',
        html: `<div style="background-color: var(--primary); border: 2px solid white; border-radius:50%; width:14px; height:14px; box-shadow:0 0 10px var(--primary-glow);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
      selectionMarker = L.marker(e.latlng, { icon }).addTo(miniMap);
    }

    // Centering mini map
    miniMap.panTo(e.latlng);
  });
}

function bindComplaintsControls(user) {
  const form = document.getElementById('complaint-submit-form');
  const fileInput = document.getElementById('comp-image-file');
  const uploadZone = document.getElementById('upload-zone');
  const previewImg = document.getElementById('upload-preview');
  const previewContainer = document.getElementById('upload-preview-container');

  // Coordinates Calibration Btn
  document.getElementById('btn-comp-gps').addEventListener('click', () => {
    // Calibrate mock coords near Cubbon Park gate
    const lat = 12.9755;
    const lng = 77.5962;
    selectedCoordinates = { lat, lng };
    document.getElementById('comp-coords').value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    showToast('GPS position calibrated to current device coordinates.', 'success');
  });

  // Handle Image Upload base64 conversion
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size exceeds 2MB threshold.', 'error');
        fileInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        imageBase64 = evt.target.result;
        previewImg.src = imageBase64;
        previewContainer.style.display = 'block';
        uploadZone.style.display = 'none';
        showToast('Photo uploaded and verified successfully.', 'success');
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('comp-title').value.trim();
    const category = document.getElementById('comp-category').value;
    const severity = document.getElementById('comp-severity').value;
    const description = document.getElementById('comp-description').value.trim();

    if (!selectedCoordinates) {
      showToast('Coordinates missing. Click the mini-map to pin coordinates.', 'warning');
      return;
    }

    // 1. Duplicate Detection Logic (checks if another complaint of same category exists within 300 meters)
    const existingComplaints = DB.getComplaints();
    const duplicate = existingComplaints.find(c => {
      if (c.category !== category || c.status === 'resolved' || c.status === 'rejected') return false;
      
      // distance check (approx degree diff threshold of 0.003 is ~300 meters)
      const latDiff = Math.abs(c.lat - selectedCoordinates.lat);
      const lngDiff = Math.abs(c.lng - selectedCoordinates.lng);
      return latDiff < 0.003 && lngDiff < 0.003;
    });

    if (duplicate) {
      // Trigger modal alert offering to upvote instead of filing new
      showDuplicateAlertModal(duplicate, user);
      return;
    }

    // 2. Clear Report Submission
    submitComplaint(title, category, severity, description, user);
  });
}

function submitComplaint(title, category, severity, description, user) {
  // Generate mock ID
  const rawNum = Math.floor(1000 + Math.random() * 9000);
  const compId = `COMP-2026-${rawNum}`;

  const newComplaint = {
    id: compId,
    title,
    description,
    category,
    severity,
    status: 'pending',
    lat: selectedCoordinates.lat,
    lng: selectedCoordinates.lng,
    image: imageBase64,
    reporter: user.username,
    supports: 1,
    supportedBy: [user.username],
    department: 'Unassigned',
    comments: [],
    date: new Date().toISOString()
  };

  DB.addComplaint(newComplaint);

  // Increase user reputation score slightly on valid report
  const newReputation = Math.min(100, user.reputationScore + 2);
  DB.updateUser(user.username, { reputationScore: newReputation });

  showToast('Verified complaint submitted to municipal review queue.', 'success');
  
  // Reset form
  document.getElementById('complaint-submit-form').reset();
  document.getElementById('comp-coords').value = '';
  document.getElementById('upload-preview-container').style.display = 'none';
  document.getElementById('upload-zone').style.display = 'flex';
  selectedCoordinates = null;
  imageBase64 = '';

  // Refresh
  RenderComplaintsPortal(user);
}

function showDuplicateAlertModal(existing, currentUser) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content glass">
      <h3 style="color:var(--color-warning); font-size:1.3rem; display:flex; align-items:center; gap:0.5rem;">
        <i data-lucide="alert-circle"></i> Potential Duplicate Detected
      </h3>
      <p style="font-size:0.95rem; line-height:1.5; color:var(--text-secondary);">
        Another active report of the same category has already been logged nearby at these coordinates.
      </p>
      
      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1rem; border-radius:10px;">
        <strong style="color:var(--primary); font-size:0.9rem;">${existing.title}</strong>
        <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.3rem;">Status: <span class="badge badge-${existing.status}">${existing.status}</span></p>
        <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.2rem;">Submitted: ${new Date(existing.date).toLocaleDateString()}</p>
      </div>

      <p style="font-size:0.9rem; color:var(--text-secondary);">
        Instead of creating a duplicate report, we recommend <strong>supporting this existing complaint</strong> to increase its priority severity level.
      </p>

      <div style="display:flex; gap:1rem; margin-top:0.5rem;">
        <button id="modal-btn-support" class="btn btn-primary" style="flex:1;">Support Existing Alert</button>
        <button id="modal-btn-force" class="btn btn-outline" style="flex:1;">File Anyway</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  lucide.createIcons();

  document.getElementById('modal-btn-support').addEventListener('click', () => {
    modal.remove();
    supportComplaint(existing.id, currentUser);
  });

  document.getElementById('modal-btn-force').addEventListener('click', () => {
    modal.remove();
    const title = document.getElementById('comp-title').value.trim();
    const category = document.getElementById('comp-category').value;
    const severity = document.getElementById('comp-severity').value;
    const description = document.getElementById('comp-description').value.trim();
    submitComplaint(title, category, severity, description, currentUser);
  });
}

function supportComplaint(compId, user) {
  const complaints = DB.getComplaints();
  const c = complaints.find(item => item.id === compId);

  if (c) {
    if (c.supportedBy.includes(user.username)) {
      showToast('You have already supported this incident.', 'warning');
      return;
    }

    const newSupports = c.supports + 1;
    const newSupportedBy = [...c.supportedBy, user.username];
    
    // Auto severity upgrade if supports exceed a threshold
    let newSeverity = c.severity;
    if (newSupports > 10 && c.severity === 'medium') {
      newSeverity = 'high';
      showToast('Incident upgraded to HIGH severity due to community support.', 'info');
    }

    DB.updateComplaint(compId, {
      supports: newSupports,
      supportedBy: newSupportedBy,
      severity: newSeverity
    });

    // Reward reporter and voter reputation scores
    const reporter = DB.getUsers().find(u => u.username === c.reporter);
    if (reporter) {
      DB.updateUser(c.reporter, { reputationScore: Math.min(100, reporter.reputationScore + 3) });
    }
    DB.updateUser(user.username, { reputationScore: Math.min(100, user.reputationScore + 1) });

    showToast('Upvoted successfully. Priority level recalibrated.', 'success');
    
    // Refresh panels
    RenderComplaintsPortal(user);
    showComplaintDetails(compId, user);
  }
}

function renderComplaintsList(currentUser) {
  const container = document.getElementById('complaints-list-container');
  const complaints = DB.getComplaints();

  if (complaints.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="folder-open" class="empty-state-icon"></i>
        <h3>No complaints reported yet.</h3>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = complaints.map(c => {
    let iconClass = 'badge-pending';
    if (c.status === 'resolved') iconClass = 'badge-resolved';
    if (c.status === 'in-progress') iconClass = 'badge-progress';
    if (c.status === 'under-review') iconClass = 'badge-review';
    if (c.status === 'rejected') iconClass = 'badge-rejected';

    return `
      <div class="glass glass-hover p-4 complaint-list-card" data-id="${c.id}" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
        <div style="min-width:0; flex:1;">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.3rem;">
            <span class="badge ${iconClass}">${c.status}</span>
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">${c.id}</span>
          </div>
          <h4 style="font-weight:700; font-size:0.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.title}</h4>
          <div style="display:flex; gap:1rem; font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;">
            <span>Category: <strong style="text-transform:capitalize;">${c.category.replace('-', ' ')}</strong></span>
            <span>Supports: <strong>${c.supports}</strong></span>
          </div>
        </div>
        <i data-lucide="chevron-right" style="color:var(--text-muted); width:20px; height:20px; flex-shrink:0; margin-left:0.5rem;"></i>
      </div>
    `;
  }).join('');

  lucide.createIcons();

  // Add click events to cards
  document.querySelectorAll('.complaint-list-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      showComplaintDetails(id, currentUser);
    });
  });
}

function showComplaintDetails(id, currentUser) {
  currentDetailId = id;
  const panel = document.getElementById('complaint-details-panel');
  const complaints = DB.getComplaints();
  const c = complaints.find(item => item.id === id);

  if (!c) return;

  const dateStr = new Date(c.date).toLocaleString();
  
  // Calculate timeline states
  const stages = ['pending', 'under-review', 'approved', 'assigned', 'in-progress', 'resolved', 'closed'];
  const activeIndex = stages.indexOf(c.status);

  // Timeline render helper
  const timelineHTML = `
    <div class="status-timeline">
      <div class="status-timeline-line"></div>
      <div class="status-timeline-progress" style="width: ${activeIndex > 0 ? (activeIndex / (stages.length - 1)) * 100 : 0}%;"></div>
      ${stages.map((stg, idx) => {
        let nodeClass = '';
        if (idx === activeIndex) nodeClass = 'active';
        else if (idx < activeIndex) nodeClass = 'completed';
        
        return `
          <div class="timeline-step ${nodeClass}">
            <div class="step-node">${idx + 1}</div>
            <div class="step-label" style="text-transform:capitalize;">${stg.replace('-', ' ')}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  panel.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid var(--border-color); padding-bottom:0.8rem;">
      <div>
        <span class="badge badge-${c.status}">${c.status}</span>
        <span style="font-size:0.8rem; color:var(--text-muted); font-weight:700; margin-left:0.5rem;">ID: ${c.id}</span>
        <h3 style="font-size:1.3rem; font-weight:800; margin-top:0.5rem;">${c.title}</h3>
      </div>
      <button id="btn-close-details" class="btn-icon" style="border:none;"><i data-lucide="x"></i></button>
    </div>

    <!-- Description, Location details -->
    <div style="font-size:0.9rem; line-height:1.6; display:flex; flex-direction:column; gap:0.6rem;">
      <p style="color:var(--text-secondary);">${c.description}</p>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:0.5rem; font-size:0.8rem; background:var(--bg-secondary); padding:0.8rem; border-radius:8px;">
        <div>Category: <strong style="text-transform:capitalize;">${c.category.replace('-', ' ')}</strong></div>
        <div>Severity: <strong style="text-transform:capitalize; color:var(--color-error);">${c.severity}</strong></div>
        <div>Reporter: <strong>${c.reporter}</strong></div>
        <div>Filing Date: <strong>${dateStr}</strong></div>
        <div>Department: <strong>${c.department}</strong></div>
        <div>GPS Pin: <strong>${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}</strong></div>
      </div>
    </div>

    <!-- Timeline header -->
    <h4 style="font-weight:700; font-size:0.95rem; margin-top:0.5rem;">Workflow Timeline Tracking</h4>
    ${timelineHTML}

    <!-- Image preview block -->
    ${c.image ? `
      <div style="border-radius:10px; overflow:hidden; border:1px solid var(--border-color); max-height:220px; width:100%; margin-top:0.5rem;">
        <img src="${c.image}" alt="Incident Image" style="width:100%; height:100%; object-fit:cover;">
      </div>
    ` : ''}

    <!-- Upvote support area -->
    <div class="community-vote-box" style="margin-top:0.5rem;">
      <div class="community-vote-stats">
        <span class="vote-count">${c.supports} Supporters</span>
        <span class="vote-desc">Priority level adjusts dynamically based on support size.</span>
      </div>
      <button id="btn-upvote-comp" class="btn ${c.supportedBy.includes(currentUser.username) ? 'btn-outline' : 'btn-primary'}" ${c.supportedBy.includes(currentUser.username) ? 'disabled' : ''}>
        <i data-lucide="thumbs-up"></i> ${c.supportedBy.includes(currentUser.username) ? 'Supported' : 'Support Issue'}
      </button>
    </div>

    <!-- Official responses comments list -->
    <div class="comments-section">
      <h4 style="font-weight:700; font-size:0.95rem; display:flex; align-items:center; gap:0.4rem;">
        <i data-lucide="message-square" style="color:var(--primary);"></i> Official Review Log (${c.comments.length})
      </h4>
      <div class="comments-list">
        ${c.comments.length === 0 
          ? '<p style="font-size:0.8rem; color:var(--text-muted); font-style:italic;">No responses logged yet by city operators.</p>'
          : c.comments.map(comm => `
              <div class="comment-card">
                <div class="comment-author-row">
                  <span class="comment-author"><i data-lucide="shield" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:0.2rem;"></i> ${comm.author}</span>
                  <span class="comment-date">${new Date(comm.date).toLocaleString()}</span>
                </div>
                <div class="comment-body">${comm.comment}</div>
              </div>
            `).join('')
        }
      </div>
    </div>
  `;

  panel.classList.remove('hidden');
  lucide.createIcons();

  // Scroll to details on smaller viewports
  if (window.innerWidth < 900) {
    panel.scrollIntoView({ behavior: 'smooth' });
  }

  // Bind close details
  document.getElementById('btn-close-details').addEventListener('click', () => {
    panel.classList.add('hidden');
    currentDetailId = null;
  });

  // Bind upvote details
  document.getElementById('btn-upvote-comp').addEventListener('click', () => {
    supportComplaint(c.id, currentUser);
  });
}
