/* Admin Dashboard Panel Logic (js/admin.js) */

import { DB } from './state.js';
import { showToast } from './app.js';
import { RenderAnalyticsCharts } from './analytics.js';

let activeAdminTab = 'complaints'; // default tab
let activeReviewId = null;

export function RenderAdminDashboard(adminUser) {
  const outlet = document.getElementById('router-outlet');

  // Admin shell layout
  outlet.innerHTML = `
    <div class="dashboard-container">
      
      <!-- Admin Sidebar -->
      <aside class="db-sidebar">
        <div class="db-user-card">
          <div class="db-avatar" style="background-color: var(--secondary); color: var(--bg-primary);">${adminUser.name.charAt(0)}</div>
          <div class="db-user-info">
            <span class="db-user-name">${adminUser.name}</span>
            <span class="db-user-role">Administrator</span>
          </div>
        </div>
        
        <nav class="db-nav">
          <button class="db-nav-link admin-nav-btn" data-tab="complaints"><i data-lucide="message-square-warning"></i> Complaints</button>
          <button class="db-nav-link admin-nav-btn" data-tab="users"><i data-lucide="users"></i> User Accounts</button>
          <button class="db-nav-link admin-nav-btn" data-tab="analytics"><i data-lucide="bar-chart-3"></i> System Analytics</button>
          <button class="db-nav-link admin-nav-btn" data-tab="system"><i data-lucide="settings"></i> Configurations</button>
        </nav>
      </aside>

      <!-- Admin Main Panel -->
      <main class="db-main" id="admin-main-panel">
        <!-- Rendered dynamically based on active tab -->
      </main>

    </div>
  `;

  lucide.createIcons();
  
  // Bind Sidebar tabs
  const tabBtns = document.querySelectorAll('.admin-nav-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab, adminUser);
    });
  });

  // Load default tab
  switchTab(activeAdminTab, adminUser);
}

function switchTab(tab, adminUser) {
  activeAdminTab = tab;
  
  // Toggle Sidebar Active styling
  document.querySelectorAll('.admin-nav-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tab) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const panel = document.getElementById('admin-main-panel');
  if (!panel) return;

  // Clear sub-panel views
  activeReviewId = null;

  if (tab === 'complaints') {
    renderComplaintManager(panel, adminUser);
  } else if (tab === 'users') {
    renderUserManager(panel, adminUser);
  } else if (tab === 'analytics') {
    renderAnalyticsTab(panel);
  } else if (tab === 'system') {
    renderSystemConfig(panel, adminUser);
  }

  lucide.createIcons();
}

/* ==========================================
   COMPLAINTS MANAGER PANEL
   ========================================== */
function renderComplaintManager(container, adminUser) {
  const complaints = DB.getComplaints();

  container.innerHTML = `
    <div class="db-header">
      <div>
        <h1>Citizen Complaint Manager</h1>
        <p style="color:var(--text-secondary); margin-top:0.3rem;">Process submitted reports, assign municipal teams, and update progress timelines.</p>
      </div>
    </div>

    <div class="complaints-container">
      
      <!-- List panel -->
      <div class="widget-card glass">
        <div class="widget-title">
          <span>📋 Incoming Review Queue (${complaints.length})</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.8rem; max-height:550px; overflow-y:auto; padding-right:0.2rem;" id="admin-complaints-list">
          ${complaints.map(c => {
            let badgeClass = 'badge-pending';
            if (c.status === 'resolved') badgeClass = 'badge-resolved';
            if (c.status === 'in-progress') badgeClass = 'badge-progress';
            if (c.status === 'rejected') badgeClass = 'badge-rejected';
            
            return `
              <div class="glass glass-hover p-4 admin-comp-card" data-id="${c.id}" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.3rem;">
                    <span class="badge ${badgeClass}">${c.status}</span>
                    <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">${c.id}</span>
                  </div>
                  <h4 style="font-weight:700; font-size:0.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.title}</h4>
                  <div style="display:flex; gap:1rem; font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;">
                    <span>Severity: <strong style="color:var(--color-error); text-transform:capitalize;">${c.severity}</strong></span>
                    <span>Reporter: <strong>${c.reporter}</strong></span>
                  </div>
                </div>
                <i data-lucide="chevron-right" style="color:var(--text-muted);"></i>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Action detail review panel -->
      <div id="admin-review-panel" class="glass widget-card hidden">
        <!-- Rendered on selecting complaint -->
      </div>

    </div>
  `;

  // Bind list clicks
  document.querySelectorAll('.admin-comp-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      showComplaintReview(id, adminUser);
    });
  });
}

function showComplaintReview(id, adminUser) {
  activeReviewId = id;
  const panel = document.getElementById('admin-review-panel');
  if (!panel) return;

  const complaints = DB.getComplaints();
  const c = complaints.find(item => item.id === id);

  if (!c) return;

  const dateStr = new Date(c.date).toLocaleString();

  panel.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid var(--border-color); padding-bottom:0.8rem;">
      <div>
        <span class="badge badge-${c.status}">${c.status}</span>
        <span style="font-size:0.8rem; color:var(--text-muted); font-weight:700; margin-left:0.5rem;">Review ID: ${c.id}</span>
        <h3 style="font-size:1.3rem; font-weight:800; margin-top:0.5rem;">${c.title}</h3>
      </div>
      <button id="btn-close-review" class="btn-icon" style="border:none;"><i data-lucide="x"></i></button>
    </div>

    <div style="font-size:0.9rem; line-height:1.6; display:flex; flex-direction:column; gap:0.6rem;">
      <p style="color:var(--text-secondary);">${c.description}</p>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; margin-top:0.5rem; font-size:0.8rem; background:var(--bg-secondary); padding:0.8rem; border-radius:8px;">
        <div>Reporter: <strong>${c.reporter}</strong></div>
        <div>Filing Date: <strong>${dateStr}</strong></div>
        <div>Severity: <strong style="text-transform:capitalize; color:var(--color-error);">${c.severity}</strong></div>
        <div>GPS Pin: <strong>${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}</strong></div>
      </div>
    </div>

    ${c.image ? `
      <div style="border-radius:10px; overflow:hidden; border:1px solid var(--border-color); max-height:200px; width:100%;">
        <img src="${c.image}" alt="Complaint Support image" style="width:100%; height:100%; object-fit:cover;">
      </div>
    ` : ''}

    <form id="admin-action-form" class="auth-form" style="border-top:1px solid var(--border-color); padding-top:1rem; gap:1rem;">
      
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
        <div class="form-group">
          <label>Assign Department</label>
          <select id="act-department" class="form-control">
            <option value="Unassigned" ${c.department === 'Unassigned' ? 'selected' : ''}>Unassigned</option>
            <option value="Municipal Works Division" ${c.department === 'Municipal Works Division' ? 'selected' : ''}>Municipal Works</option>
            <option value="Traffic Management Directorate" ${c.department === 'Traffic Management Directorate' ? 'selected' : ''}>Traffic Management</option>
            <option value="Solid Waste Management" ${c.department === 'Solid Waste Management' ? 'selected' : ''}>Solid Waste Dept</option>
            <option value="City Power & Lighting Dept" ${c.department === 'City Power & Lighting Dept' ? 'selected' : ''}>Power & Lighting</option>
            <option value="Metro Accessibility Unit" ${c.department === 'Metro Accessibility Unit' ? 'selected' : ''}>Metro Access Unit</option>
          </select>
        </div>

        <div class="form-group">
          <label>Update Status Workflow</label>
          <select id="act-status" class="form-control">
            <option value="pending" ${c.status === 'pending' ? 'selected' : ''}>Pending Review</option>
            <option value="under-review" ${c.status === 'under-review' ? 'selected' : ''}>Under Review</option>
            <option value="approved" ${c.status === 'approved' ? 'selected' : ''}>Approve Issue</option>
            <option value="assigned" ${c.status === 'assigned' ? 'selected' : ''}>Assign Team</option>
            <option value="in-progress" ${c.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="resolved" ${c.status === 'resolved' ? 'selected' : ''}>Resolved / Solved</option>
            <option value="closed" ${c.status === 'closed' ? 'selected' : ''}>Closed Case</option>
            <option value="rejected" ${c.status === 'rejected' ? 'selected' : ''}>Reject / Fake Alert</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Add Official Comments (Timeline log)</label>
        <textarea id="act-comment" class="form-control" rows="2" placeholder="e.g. Inspector dispatched. Repair scheduled."></textarea>
      </div>

      <div style="display:flex; gap:1rem;">
        <button type="submit" class="btn btn-primary" style="flex:1;">Save Review Changes</button>
        <button type="button" id="btn-suspend-reporter" class="btn btn-outline" style="border-color:var(--color-error); color:var(--color-error);">Suspend Reporter</button>
      </div>
    </form>
  `;

  panel.classList.remove('hidden');
  lucide.createIcons();

  // Close review
  document.getElementById('btn-close-review').addEventListener('click', () => {
    panel.classList.add('hidden');
    activeReviewId = null;
  });

  // Action submission
  document.getElementById('admin-action-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const dept = document.getElementById('act-department').value;
    const status = document.getElementById('act-status').value;
    const commentText = document.getElementById('act-comment').value.trim();

    const comments = [...c.comments];
    if (commentText) {
      comments.unshift({
        author: 'admin',
        comment: commentText,
        date: new Date().toISOString()
      });
    }

    DB.updateComplaint(c.id, {
      department: dept,
      status,
      comments
    });

    DB.addAuditLog(adminUser.name, `Updated complaint status to ${status} for ${c.id}`, c.id);
    showToast(`Saved complaint updates for ${c.id}`, 'success');
    
    // Refresh List & Details
    renderComplaintManager(document.getElementById('admin-main-panel'), adminUser);
    showComplaintReview(c.id, adminUser);
  });

  // Suspend reporter click
  document.getElementById('btn-suspend-reporter').addEventListener('click', () => {
    const reporter = DB.getUsers().find(u => u.username === c.reporter);
    if (!reporter) return;

    if (reporter.role === 'admin') {
      showToast('Cannot suspend administrative accounts.', 'error');
      return;
    }

    DB.updateUser(c.reporter, { status: 'suspended', reputationScore: 0 });
    DB.addAuditLog(adminUser.name, `Suspended user ${c.reporter} for false report activity`, c.reporter);
    
    showToast(`Suspended citizen account: ${c.reporter}`, 'success');
    showComplaintReview(c.id, adminUser);
  });
}

/* ==========================================
   USER MANAGEMENT PANEL
   ========================================== */
function renderUserManager(container, adminUser) {
  const users = DB.getUsers();

  container.innerHTML = `
    <div class="db-header">
      <div>
        <h1>User Moderation Control</h1>
        <p style="color:var(--text-secondary); margin-top:0.3rem;">Approve newly registered accounts, block fake users, reset credentials, and modify permissions.</p>
      </div>
    </div>

    <div class="widget-card glass">
      <div class="widget-title"><span>👥 Registered Smart City Accounts</span></div>
      <div class="logs-table-wrapper">
        <table class="logs-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Reputation</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => {
              let statusClass = 'badge-approved'; // active
              if (u.status === 'suspended') statusClass = 'badge-rejected';
              if (u.status === 'pending') statusClass = 'badge-pending';
              
              return `
                <tr>
                  <td style="font-weight:700;">${u.username}</td>
                  <td>${u.name}</td>
                  <td>${u.email}</td>
                  <td style="text-transform:capitalize;">${u.role}</td>
                  <td><span class="badge ${statusClass}">${u.status}</span></td>
                  <td><strong>${u.reputationScore}</strong></td>
                  <td style="text-align:right;">
                    <div style="display:inline-flex; gap:0.4rem;">
                      ${u.status === 'pending' ? `<button class="btn btn-secondary btn-icon user-action-btn" data-action="approve" data-user="${u.username}" title="Approve Registration" style="padding:0.3rem 0.5rem; font-size:0.75rem;"><i data-lucide="check" style="width:12px; height:12px;"></i> Approve</button>` : ''}
                      ${u.status === 'active' && u.role !== 'admin' ? `<button class="btn btn-outline user-action-btn" data-action="suspend" data-user="${u.username}" title="Suspend Account" style="color:var(--color-rejected); border-color:rgba(239,68,68,0.25); padding:0.3rem 0.5rem; font-size:0.75rem;"><i data-lucide="ban" style="width:12px; height:12px;"></i> Suspend</button>` : ''}
                      ${u.status === 'suspended' ? `<button class="btn btn-outline user-action-btn" data-action="activate" data-user="${u.username}" title="Reactivate Account" style="color:var(--color-resolved); border-color:rgba(16,185,129,0.25); padding:0.3rem 0.5rem; font-size:0.75rem;"><i data-lucide="shield-check" style="width:12px; height:12px;"></i> Activate</button>` : ''}
                      <button class="btn btn-outline btn-icon user-action-btn" data-action="reset" data-user="${u.username}" title="Reset User Password"><i data-lucide="key-round" style="width:12px; height:12px;"></i></button>
                      ${u.role !== 'admin' ? `<button class="btn btn-outline btn-icon user-action-btn" data-action="delete" data-user="${u.username}" title="Delete User" style="color:var(--color-rejected);"><i data-lucide="trash-2" style="width:12px; height:12px;"></i></button>` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  lucide.createIcons();

  // Bind actions
  document.querySelectorAll('.user-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      const username = btn.getAttribute('data-user');
      handleUserModeration(action, username, adminUser);
    });
  });
}

function handleUserModeration(action, username, adminUser) {
  if (action === 'approve') {
    DB.updateUser(username, { status: 'active' });
    DB.addAuditLog(adminUser.name, `Approved user account registration for ${username}`, username);
    showToast(`Account approved and activated: ${username}`, 'success');
  } else if (action === 'suspend') {
    DB.updateUser(username, { status: 'suspended', reputationScore: 0 });
    DB.addAuditLog(adminUser.name, `Suspended user ${username}`, username);
    showToast(`Account suspended: ${username}`, 'success');
  } else if (action === 'activate') {
    DB.updateUser(username, { status: 'active', reputationScore: 70 });
    DB.addAuditLog(adminUser.name, `Activated suspended user ${username}`, username);
    showToast(`Account reactivated successfully: ${username}`, 'success');
  } else if (action === 'reset') {
    const defaultResetPassword = 'reset123';
    DB.updateUser(username, { password: defaultResetPassword });
    DB.addAuditLog(adminUser.name, `Reset password for user ${username}`, username);
    showToast(`Credentials reset. Password is: "${defaultResetPassword}"`, 'info', 5000);
  } else if (action === 'delete') {
    if (confirm(`Are you sure you want to permanently delete user: ${username}?`)) {
      DB.deleteUser(username);
      DB.addAuditLog(adminUser.name, `Deleted user ${username}`, username);
      showToast(`User deleted from registry: ${username}`, 'success');
    }
  }

  // Refresh page
  renderUserManager(document.getElementById('admin-main-panel'), adminUser);
}

/* ==========================================
   SYSTEM ANALYTICS PANEL
   ========================================== */
function renderAnalyticsTab(container) {
  container.innerHTML = `
    <div class="db-header">
      <div>
        <h1>Smart City Portal Analytics</h1>
        <p style="color:var(--text-secondary); margin-top:0.3rem;">Aggregate statistics on complaints resolutions, accessibility, registration growth, and fake report rates.</p>
      </div>
    </div>

    <!-- Charts Layout Grid -->
    <div class="cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));">
      
      <!-- Chart 1: Categories -->
      <div class="widget-card glass">
        <div class="widget-title"><span>📊 Complaint Categories Distribution</span></div>
        <div style="height: 250px; position:relative;">
          <canvas id="chart-categories"></canvas>
        </div>
      </div>

      <!-- Chart 2: Statuses -->
      <div class="widget-card glass">
        <div class="widget-title"><span>📈 Case Resolution Performance</span></div>
        <div style="height: 250px; position:relative;">
          <canvas id="chart-resolutions"></canvas>
        </div>
      </div>

      <!-- Chart 3: Registrations -->
      <div class="widget-card glass" style="grid-column: span 1;">
        <div class="widget-title"><span>👥 Monthly Citizen Registrations</span></div>
        <div style="height: 250px; position:relative;">
          <canvas id="chart-registrations"></canvas>
        </div>
      </div>

      <!-- Chart 4: Fake trends -->
      <div class="widget-card glass">
        <div class="widget-title"><span>⚠️ Verified vs. Spammed Incidents</span></div>
        <div style="height: 250px; position:relative;">
          <canvas id="chart-fake-trends"></canvas>
        </div>
      </div>

    </div>
  `;

  // Render Chart.js instances inside DOM
  setTimeout(() => {
    RenderAnalyticsCharts();
  }, 100);
}

/* ==========================================
   SYSTEM CONFIGURATION PANEL
   ========================================== */
function renderSystemConfig(container, adminUser) {
  const settings = DB.getSystemSettings();
  const logs = DB.getAuditLogs();

  container.innerHTML = `
    <div class="db-header">
      <div>
        <h1>Portal System Settings</h1>
        <p style="color:var(--text-secondary); margin-top:0.3rem;">Manage registration approvals, publish system announcements, and review admin actions logs.</p>
      </div>
    </div>

    <div class="dashboard-layout-grid">
      
      <!-- Left Configs Column -->
      <div style="display:flex; flex-direction:column; gap:2rem;">
        
        <!-- Toggle approvals -->
        <div class="widget-card glass">
          <div class="widget-title"><span>🔧 Registration Workflows</span></div>
          <div class="layers-menu">
            <div class="layer-toggle-row">
              <div>
                <strong style="display:block; font-size:0.9rem;">Enforce Admin Approvals</strong>
                <span style="font-size:0.75rem; color:var(--text-muted);">When turned on, new user accounts require manual activation.</span>
              </div>
              <label class="switch">
                <input type="checkbox" id="sett-approval" ${settings.approvalWorkflowEnabled ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Publish Announcements form -->
        <div class="widget-card glass">
          <div class="widget-title"><span>📢 Issue Global Municipal Announcement</span></div>
          <form id="announcement-form" class="auth-form" style="gap:1rem;">
            <div class="form-group">
              <label>Headline Title</label>
              <input type="text" id="ann-title" class="form-control" placeholder="e.g. Accessibility audit done" required>
            </div>
            
            <div class="form-group">
              <label>Notice Content</label>
              <textarea id="ann-body" class="form-control" rows="3" placeholder="Provide full details and date timelines..." required></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="align-self:flex-start;">Publish Announcement</button>
          </form>
        </div>

      </div>

      <!-- Right Logs Column -->
      <div class="widget-card glass">
        <div class="widget-title">
          <span>📜 Administrative Audit Log</span>
          <i data-lucide="shield-check" style="color:var(--color-resolved);"></i>
        </div>
        <div class="logs-table-wrapper" style="max-height: 400px; overflow-y:auto;">
          <table class="logs-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Operation</th>
                <th>Target</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td style="font-weight:700; white-space:nowrap;">${l.adminName}</td>
                  <td>${l.action}</td>
                  <td>${l.target}</td>
                  <td style="font-size:0.75rem; color:var(--text-muted); white-space:nowrap;">${new Date(l.timestamp).toLocaleTimeString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  // Bind settings toggle
  document.getElementById('sett-approval').addEventListener('change', (e) => {
    const approvalWorkflowEnabled = e.target.checked;
    DB.setSystemSettings({ ...settings, approvalWorkflowEnabled });
    DB.addAuditLog(adminUser.name, `Toggled Enforce Approvals to ${approvalWorkflowEnabled}`, 'System Settings');
    showToast(`Approvals workflow registration is now ${approvalWorkflowEnabled ? 'Enabled' : 'Disabled'}.`, 'info');
  });

  // Bind announcement publishing
  document.getElementById('announcement-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('ann-title').value.trim();
    const content = document.getElementById('ann-body').value.trim();

    const newAnnouncement = {
      title,
      content,
      date: new Date().toISOString(),
      author: adminUser.name
    };

    DB.addAnnouncement(newAnnouncement);
    DB.addAuditLog(adminUser.name, `Published notice headline: "${title}"`, 'Announcements Board');

    showToast('Global notice successfully published to citizen dashboard.', 'success');
    document.getElementById('announcement-form').reset();
    
    // Refresh tab
    switchTab('system', adminUser);
  });
}
