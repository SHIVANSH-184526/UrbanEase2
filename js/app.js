/* UrbanEase Core Coordinator & SPA Router (js/app.js) */

import { DB } from './state.js';
import { Auth } from './auth.js';
import { RenderMapPage } from './map.js';
import { RenderUserDashboard } from './dashboard.js';
import { RenderAdminDashboard } from './admin.js';
import { RenderComplaintsPortal } from './complaints.js';
import { RenderStaticPage } from './pages.js';

// Global Toast System
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle-2';
  if (type === 'error') iconName = 'alert-triangle';
  if (type === 'warning') iconName = 'alert-circle';

  toast.innerHTML = `
    <i data-lucide="${iconName}" class="toast-icon"></i>
    <div class="toast-content">${message}</div>
    <i data-lucide="x" class="toast-close"></i>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  // Show animation
  setTimeout(() => toast.classList.add('show'), 50);

  // Auto remove
  let autoTimer = setTimeout(() => removeToast(toast), duration);

  // Close button click
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(autoTimer);
    removeToast(toast);
  });
}

function removeToast(toast) {
  toast.classList.remove('show');
  toast.addEventListener('transitionend', () => toast.remove());
}

// Global Loader
export function setLoader(visible) {
  const outlet = document.getElementById('router-outlet');
  if (!outlet) return;
  
  if (visible) {
    outlet.innerHTML = `
      <div class="page-loader">
        <div class="spinner"></div>
      </div>
    `;
  }
}

// SPA Router
class Router {
  constructor() {
    this.routes = {
      '': () => this.renderHome(),
      '/': () => this.renderHome(),
      '/features': () => RenderStaticPage('features'),
      '/vision': () => RenderStaticPage('vision'),
      '/faq': () => RenderStaticPage('faq'),
      '/about': () => RenderStaticPage('about'),
      '/contact': () => RenderStaticPage('contact'),
      '/feedback': () => RenderStaticPage('feedback'),
      '/privacy-policy': () => RenderStaticPage('privacy-policy'),
      '/terms': () => RenderStaticPage('terms'),
      
      // Auth Routes
      '/login': () => Auth.renderUserLogin(),
      '/register': () => Auth.renderUserRegister(),
      '/admin-login': () => Auth.renderAdminLogin(),
      '/forgot-password': () => Auth.renderForgotPassword(),
      '/profile': () => Auth.renderProfile(),
      
      // Portal Routes
      '/dashboard': () => this.protectedRoute(RenderUserDashboard, 'citizen'),
      '/map': () => this.protectedRoute(RenderMapPage, 'citizen'),
      '/complaints': () => this.protectedRoute(RenderComplaintsPortal, 'citizen'),
      
      // Admin Routes
      '/admin': () => this.protectedRoute(RenderAdminDashboard, 'admin')
    };

    window.addEventListener('hashchange', () => this.handleRouting());
    window.addEventListener('DOMContentLoaded', () => {
      this.initTheme();
      this.handleRouting();
      this.setupHeaderActions();
      this.setupMobileMenu();
    });
  }

  handleRouting() {
    let rawHash = window.location.hash;
    let path = rawHash.replace('#', '') || '/';
    
    // Smooth scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Update Header Active Links
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href').replace('#', '') || '/';
      if (path === href || (path.startsWith(href) && href !== '/')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Handle mobile nav items active states
    document.querySelectorAll('.mobile-nav-item').forEach(link => {
      const href = link.getAttribute('href').replace('#', '') || '/';
      if (path === href) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    this.updateHeaderSession();

    // Route matching
    const renderFn = this.routes[path] || (() => this.render404());
    setLoader(true);
    
    // Micro-delay to simulate dynamic transition and let loader show
    setTimeout(() => {
      try {
        renderFn();
      } catch (err) {
        console.error('Routing Render Error:', err);
        this.render500(err.message);
      }
    }, 150);
  }

  // Middleware/Route Guards
  protectedRoute(renderCallback, requiredRole) {
    const user = DB.getCurrentUser();
    
    if (!user) {
      showToast('Authentication required. Please sign in.', 'warning');
      if (requiredRole === 'admin') {
        window.location.hash = '#/admin-login';
      } else {
        window.location.hash = '#/login';
      }
      return;
    }

    if (user.status === 'suspended') {
      showToast('Your account is suspended. Access denied.', 'error');
      DB.setCurrentUser(null);
      window.location.hash = '#/login';
      return;
    }

    if (user.status === 'pending') {
      showToast('Your registration is pending administrator approval.', 'warning');
      DB.setCurrentUser(null);
      window.location.hash = '#/login';
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      showToast('Unauthorized access.', 'error');
      window.location.hash = user.role === 'admin' ? '#/admin' : '#/dashboard';
      return;
    }

    // Pass session data to renderer
    renderCallback(user);
  }

  // Header dynamic updating
  updateHeaderSession() {
    const btnContainer = document.getElementById('auth-header-btn');
    if (!btnContainer) return;

    const user = DB.getCurrentUser();
    if (user) {
      if (user.role === 'admin') {
        btnContainer.innerHTML = `
          <div style="display:flex; align-items:center; gap:0.8rem;">
            <a href="#/admin" class="btn btn-primary btn-sm"><i data-lucide="layout-dashboard"></i> Admin Panel</a>
            <button id="logout-btn" class="btn btn-outline btn-sm">Log Out</button>
          </div>
        `;
      } else {
        btnContainer.innerHTML = `
          <div style="display:flex; align-items:center; gap:0.8rem;">
            <a href="#/dashboard" class="btn btn-primary btn-sm"><i data-lucide="layout-dashboard"></i> Dashboard</a>
            <a href="#/profile" class="btn btn-outline btn-icon" title="View Profile"><i data-lucide="user"></i></a>
            <button id="logout-btn" class="btn btn-outline btn-sm">Log Out</button>
          </div>
        `;
      }
      
      // Bind logout action
      document.getElementById('logout-btn').addEventListener('click', () => {
        DB.setCurrentUser(null);
        showToast('Logged out successfully.', 'success');
        window.location.hash = '#/login';
      });
    } else {
      btnContainer.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.8rem;">
          <a href="#/login" class="btn btn-outline btn-sm">Sign In</a>
          <a href="#/register" class="btn btn-primary btn-sm">Register</a>
        </div>
      `;
    }
    lucide.createIcons();
  }

  setupHeaderActions() {
    // Theme Toggler
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const root = document.documentElement;
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        root.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled.`, 'info');
      });
    }
  }

  initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  setupMobileMenu() {
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav) {
      const handleResize = () => {
        if (window.innerWidth <= 600) {
          mobileNav.classList.remove('hidden');
        } else {
          mobileNav.classList.add('hidden');
        }
      };
      window.addEventListener('resize', handleResize);
      handleResize(); // Initial execution
    }
  }

  renderHome() {
    const outlet = document.getElementById('router-outlet');
    outlet.innerHTML = `
      <section class="hero-section">
        <span class="hero-tag">Smart City Smart Portal</span>
        <h1 class="hero-title">Transforming Urban Mobility & Accessibility for All Citizens</h1>
        <p class="hero-subtitle">Experience a connected, barrier-free smart environment. Discover optimal travel routes, track public transit, locate parking, and report local accessibility issues to the Municipal Corporation instantly.</p>
        <div class="hero-actions">
          <a href="#/login" class="btn btn-primary btn-lg"><i data-lucide="navigation"></i> Access Citizen Dashboard</a>
          <a href="#/vision" class="btn btn-outline btn-lg">Explore Vision</a>
        </div>
      </section>

      <section style="padding: 4rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 3rem; background-color: var(--bg-secondary);">
        <h2 style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; text-align: center;">Smart Portals & Modules</h2>
        
        <div class="cards-grid">
          <div class="feature-card glass glass-hover">
            <div class="feature-card-icon"><i data-lucide="map"></i></div>
            <h3 class="feature-card-title">Interactive Smart City Map</h3>
            <p class="feature-card-desc">Navigate through town with live markers pointing to local hospitals, metro lines, accessible paths, parking slots, and road blockages.</p>
            <a href="#/login" class="btn btn-outline mt-auto" style="width:fit-content;">Launch Map</a>
          </div>
          
          <div class="feature-card glass glass-hover">
            <div class="feature-card-icon"><i data-lucide="route"></i></div>
            <h3 class="feature-card-title">Multi-Modal Route Planner</h3>
            <p class="feature-card-desc">Input source and destinations to compute custom routes tailored for wheelchairs, cyclists, emergency runs, or typical daily commutes.</p>
            <a href="#/login" class="btn btn-outline mt-auto" style="width:fit-content;">Plan Route</a>
          </div>
          
          <div class="feature-card glass glass-hover">
            <div class="feature-card-icon"><i data-lucide="alert-triangle"></i></div>
            <h3 class="feature-card-title">Verified Citizen Complaints</h3>
            <p class="feature-card-desc">File complaints on street issues like potholes or street light failures. Features GPS matching, duplication checks, and community verification scorecards.</p>
            <a href="#/login" class="btn btn-outline mt-auto" style="width:fit-content;">Submit Complaint</a>
          </div>
        </div>
      </section>

      <section style="padding: 5rem 2rem; max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;">
        <div>
          <span style="color: var(--primary); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">Smart City Vision</span>
          <h2 style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; margin: 0.8rem 0 1.2rem 0; line-height: 1.2;">Zero Accessibility Barriers & Safe Travel</h2>
          <p style="color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; margin-bottom: 1.5rem;">
            UrbanEase connects the physical infrastructure of the municipality with the digital needs of every citizen. The platform ensures that parents with strollers, disabled commuters, elderly citizens, and emergency response vehicles have immediate visual map data on what routes are safest and fully accessible.
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div style="display:flex; gap: 0.6rem; align-items:flex-start;">
              <i data-lucide="check-circle" style="color: var(--color-resolved); flex-shrink: 0; margin-top: 0.2rem;"></i>
              <div>
                <h4 style="font-weight:700; font-size:0.95rem;">WCAG Compliant UX</h4>
                <p style="color:var(--text-secondary); font-size:0.8rem; margin-top:0.2rem;">Design built with high accessibility compliance and text compatibility.</p>
              </div>
            </div>
            <div style="display:flex; gap: 0.6rem; align-items:flex-start;">
              <i data-lucide="check-circle" style="color: var(--color-resolved); flex-shrink: 0; margin-top: 0.2rem;"></i>
              <div>
                <h4 style="font-weight:700; font-size:0.95rem;">Audit & Accountability</h4>
                <p style="color:var(--text-secondary); font-size:0.8rem; margin-top:0.2rem;">Every reported incident undergoes multi-level state reviews and audits.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="glass" style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; background: linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(6,182,212,0.05) 100%);">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
            <h3 style="font-size: 1.15rem; font-weight:700;">Live City Statistics</h3>
            <span class="badge badge-approved">Real-time Feed</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div class="glass" style="padding:1rem; text-align:center;">
              <div style="font-family: var(--font-heading); font-size: 2rem; font-weight:800; color: var(--primary);">94.8%</div>
              <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.3rem;">Resolution Rate</div>
            </div>
            <div class="glass" style="padding:1rem; text-align:center;">
              <div style="font-family: var(--font-heading); font-size: 2rem; font-weight:800; color: var(--accent);">420+</div>
              <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.3rem;">Audited Ramps</div>
            </div>
            <div class="glass" style="padding:1rem; text-align:center;">
              <div style="font-family: var(--font-heading); font-size: 2rem; font-weight:800; color: var(--color-resolved);">1,280</div>
              <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.3rem;">Active Citizens</div>
            </div>
            <div class="glass" style="padding:1rem; text-align:center;">
              <div style="font-family: var(--font-heading); font-size: 2rem; font-weight:800; color: var(--color-pending);">14 min</div>
              <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.3rem;">Avg Response Time</div>
            </div>
          </div>
        </div>
      </section>
    `;
    lucide.createIcons();
  }

  render404() {
    const outlet = document.getElementById('router-outlet');
    outlet.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:calc(100vh - 350px); text-align:center; padding: 2rem; gap:1.5rem;">
        <div class="glass" style="width: 100px; height: 100px; display:flex; align-items:center; justify-content:center; color: var(--primary); font-size: 3rem;">
          <i data-lucide="compass" style="width:64px; height:64px;"></i>
        </div>
        <h1 style="font-family: var(--font-heading); font-size: 4rem; font-weight: 800; color: var(--primary);">404</h1>
        <h2 style="font-weight:700;">Page Not Found</h2>
        <p style="color:var(--text-secondary); max-width:400px; font-size:0.95rem;">The resource you are looking for does not exist or has been relocated within the municipal portal.</p>
        <a href="#/" class="btn btn-primary">Return to City Homepage</a>
      </div>
    `;
    lucide.createIcons();
  }

  render500(errMessage = '') {
    const outlet = document.getElementById('router-outlet');
    outlet.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:calc(100vh - 350px); text-align:center; padding: 2rem; gap:1.5rem;">
        <div class="glass" style="width: 100px; height: 100px; display:flex; align-items:center; justify-content:center; color: var(--color-error); font-size: 3rem; border-color: rgba(239, 68, 68, 0.25);">
          <i data-lucide="shield-alert" style="width:64px; height:64px;"></i>
        </div>
        <h1 style="font-family: var(--font-heading); font-size: 4rem; font-weight: 800; color: var(--color-error);">500</h1>
        <h2 style="font-weight:700;">Internal Portal Error</h2>
        <p style="color:var(--text-secondary); max-width:500px; font-size:0.95rem;">The application encountered an unexpected exception while loading components. Please try refreshing or clearing cache.</p>
        ${errMessage ? `<pre style="background:var(--bg-secondary); padding: 0.8rem; border-radius: 8px; font-size: 0.8rem; color: var(--color-error); border: 1px solid var(--border-color); max-width:600px; overflow-x:auto;">Error context: ${errMessage}</pre>` : ''}
        <a href="#/" class="btn btn-primary">Return to City Homepage</a>
      </div>
    `;
    lucide.createIcons();
  }
}

export const RouterInstance = new Router();
export default RouterInstance;
