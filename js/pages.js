/* Static Information Pages Renderer (js/pages.js) */

import { showToast } from './app.js';

export function RenderStaticPage(pageKey) {
  const outlet = document.getElementById('router-outlet');
  
  if (pageKey === 'features') {
    renderFeaturesPage(outlet);
  } else if (pageKey === 'vision') {
    renderVisionPage(outlet);
  } else if (pageKey === 'faq') {
    renderFaqPage(outlet);
  } else if (pageKey === 'about') {
    renderAboutPage(outlet);
  } else if (pageKey === 'contact') {
    renderContactPage(outlet);
  } else if (pageKey === 'feedback') {
    renderFeedbackPage(outlet);
  } else if (pageKey === 'privacy-policy') {
    renderPrivacyPage(outlet);
  } else if (pageKey === 'terms') {
    renderTermsPage(outlet);
  }

  lucide.createIcons();
}

function renderFeaturesPage(outlet) {
  outlet.innerHTML = `
    <section class="hero-section">
      <span class="hero-tag">Core Features</span>
      <h1 class="hero-title">UrbanEase Platform Capabilities</h1>
      <p class="hero-subtitle">Explore the technological components built to enhance city navigation and civic accountability.</p>
    </section>

    <section style="padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; display:flex; flex-direction:column; gap:3rem;">
      <div class="cards-grid">
        <div class="feature-card glass">
          <div class="feature-card-icon"><i data-lucide="map-pinned"></i></div>
          <h3 class="feature-card-title">Dynamic City Mapping</h3>
          <p class="feature-card-desc">Features detailed location marking of metro stations, parking bays, emergency zones, and citizen reports, filterable by categories.</p>
        </div>
        
        <div class="feature-card glass">
          <div class="feature-card-icon"><i data-lucide="shuffle"></i></div>
          <h3 class="feature-card-title">Accessibility Routing</h3>
          <p class="feature-card-desc">Calculates obstacle-free paths for wheelchairs, strollers, and cyclists, overlaying real-time transit status information.</p>
        </div>

        <div class="feature-card glass">
          <div class="feature-card-icon"><i data-lucide="shield-check"></i></div>
          <h3 class="feature-card-title">Anti-Spam Verification</h3>
          <p class="feature-card-desc">Integrates user reputation scores, GPS proximity limits, and duplicate scanning algorithms to eliminate fake alerts.</p>
        </div>

        <div class="feature-card glass">
          <div class="feature-card-icon"><i data-lucide="git-pull-request"></i></div>
          <h3 class="feature-card-title">Department Workflows</h3>
          <p class="feature-card-desc">Tracks reported issues from 'Pending' through 'Assigned' and 'In Progress' states to resolution, documented in citizen timelines.</p>
        </div>

        <div class="feature-card glass">
          <div class="feature-card-icon"><i data-lucide="users"></i></div>
          <h3 class="feature-card-title">Administrative Portal</h3>
          <p class="feature-card-desc">Grants municipal administrators complete controls to verify new registrations, suspend abusers, change roles, and post system notices.</p>
        </div>

        <div class="feature-card glass">
          <div class="feature-card-icon"><i data-lucide="pie-chart"></i></div>
          <h3 class="feature-card-title">Chart Visualizations</h3>
          <p class="feature-card-desc">Visualizes key civic performance metrics such as department resolution rates and monthly registration metrics.</p>
        </div>
      </div>
    </section>
  `;
}

function renderVisionPage(outlet) {
  outlet.innerHTML = `
    <section class="hero-section">
      <span class="hero-tag">Smart City Vision</span>
      <h1 class="hero-title">Towards a Barrier-Free Connected Future</h1>
      <p class="hero-subtitle">Learn about our foundational goals to ensure all citizens enjoy safe and reliable urban transit.</p>
    </section>

    <section style="padding: 4rem 2rem; max-width: 900px; margin: 0 auto; display:flex; flex-direction:column; gap:2.5rem; line-height:1.7;">
      <div>
        <h2 style="font-family:var(--font-heading); font-size:1.8rem; margin-bottom:1rem;">1. Universal Mobility Goals</h2>
        <p style="color:var(--text-secondary); margin-bottom:1rem;">
          In modern smart cities, physical movement is a basic human right. Traditional public structures often present unintended barriers to citizens carrying strollers, wheelchair users, and the elderly.
        </p>
        <p style="color:var(--text-secondary);">
          Our vision is to bridge the gap between physical infrastructure and digital information, giving commuters immediate visual guidance to travel through paths that are safe and accommodating.
        </p>
      </div>

      <div class="glass" style="padding:2rem; background: linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(37,99,235,0.05) 100%);">
        <h3 style="font-weight:700; margin-bottom:0.8rem; color:var(--primary);">Future Integration Scope</h3>
        <ul style="padding-left:1.2rem; display:flex; flex-direction:column; gap:0.6rem; font-size:0.9rem; color:var(--text-secondary);">
          <li><strong>IoT Smart Parking Sensors</strong>: Real-time slot allocations via street sensors.</li>
          <li><strong>Command Control CCTV Links</strong>: Automated AI image verification on pothole severity.</li>
          <li><strong>Emergency Fleet Corridors</strong>: Dynamic green lights grid tracking to bypass traffic jams.</li>
          <li><strong>Voice Assistant Controls</strong>: Audio routing updates for vision-impaired citizens.</li>
        </ul>
      </div>
    </section>
  `;
}

function renderFaqPage(outlet) {
  outlet.innerHTML = `
    <section class="hero-section">
      <span class="hero-tag">Citizen FAQ</span>
      <h1 class="hero-title">Frequently Asked Questions</h1>
      <p class="hero-subtitle">Find quick answers regarding registration, reporting procedures, and routing features.</p>
    </section>

    <section style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto;">
      <div style="display:flex; flex-direction:column; gap:1.2rem;">
        
        <details class="glass" style="padding:1.2rem; cursor:pointer;" open>
          <summary style="font-weight:700; font-size:1.05rem; display:flex; align-items:center; justify-content:space-between; list-style:none;">
            <span>How do I file an accessibility complaint?</span>
            <i data-lucide="chevron-down" style="width:18px; height:18px;"></i>
          </summary>
          <p style="color:var(--text-secondary); margin-top:0.8rem; font-size:0.9rem; line-height:1.6; cursor:default;">
            Once logged in to your Citizen Dashboard, click on 'Report Issues'. Select the issue category (e.g. Damaged pavement), use the mini-map to pin the GPS location, upload a photo, and hit submit. The review log will update as municipal teams take action.
          </p>
        </details>

        <details class="glass" style="padding:1.2rem; cursor:pointer;">
          <summary style="font-weight:700; font-size:1.05rem; display:flex; align-items:center; justify-content:space-between; list-style:none;">
            <span>What is the Citizen Reputation Score?</span>
            <i data-lucide="chevron-down" style="width:18px; height:18px;"></i>
          </summary>
          <p style="color:var(--text-secondary); margin-top:0.8rem; font-size:0.9rem; line-height:1.6; cursor:default;">
            The reputation score is a verification metric (scaled 0-100) assigned to each user. Newly created profiles start at 70 points. Submitting valid complaints that get supported by the community increases your score. Filing false or spam alerts decreases your score and triggers automatic suspension.
          </p>
        </details>

        <details class="glass" style="padding:1.2rem; cursor:pointer;">
          <summary style="font-weight:700; font-size:1.05rem; display:flex; align-items:center; justify-content:space-between; list-style:none;">
            <span>Why is my account status set to "Pending Approval"?</span>
            <i data-lucide="chevron-down" style="width:18px; height:18px;"></i>
          </summary>
          <p style="color:var(--text-secondary); margin-top:0.8rem; font-size:0.9rem; line-height:1.6; cursor:default;">
            To ensure maximum security and high-fidelity civic reporting, municipal system settings require administrators to manually review and approve new registrations. Once approved, you will receive access.
          </p>
        </details>

        <details class="glass" style="padding:1.2rem; cursor:pointer;">
          <summary style="font-weight:700; font-size:1.05rem; display:flex; align-items:center; justify-content:space-between; list-style:none;">
            <span>How does the duplicate alert scanner work?</span>
            <i data-lucide="chevron-down" style="width:18px; height:18px;"></i>
          </summary>
          <p style="color:var(--text-secondary); margin-top:0.8rem; font-size:0.9rem; line-height:1.6; cursor:default;">
            When submitting a complaint, the algorithm scans for similar active reports located within 300 meters. If one is found, the portal alerts you and suggests supporting the existing ticket to increase its municipal priority rather than cluttering queue lines with duplicate items.
          </p>
        </details>

      </div>
    </section>
  `;

  // Bind details summary icon rotations
  document.querySelectorAll('details').forEach(el => {
    el.addEventListener('toggle', () => {
      const icon = el.querySelector('i');
      if (el.open) {
        icon.style.transform = 'rotate(180deg)';
      } else {
        icon.style.transform = 'rotate(0deg)';
      }
    });
  });
}

function renderAboutPage(outlet) {
  outlet.innerHTML = `
    <section class="hero-section">
      <span class="hero-tag">About Us</span>
      <h1 class="hero-title">Smart City Research Initiative</h1>
      <p class="hero-subtitle">Developed under the Urban Ease Development wing to test prototype solutions for smart navigation.</p>
    </section>

    <section style="padding: 4rem 2rem; max-width: 900px; margin: 0 auto; line-height:1.7; display:flex; flex-direction:column; gap:2rem;">
      <h2 style="font-family:var(--font-heading); font-size:1.8rem;">Platform Objectives</h2>
      <p style="color:var(--text-secondary);">
        This engineering prototype demonstrates a unified command interface that municipal corporations can utilize to control street obstacles and traffic updates while empowering citizens to contribute directly.
      </p>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:2rem; margin-top:1rem;">
        <div class="glass" style="padding:1.5rem;">
          <h4 style="font-weight:700; margin-bottom:0.5rem; color:var(--primary);">Aesthetics & UX</h4>
          <p style="font-size:0.85rem; color:var(--text-secondary);">Features premium glassmorphism layouts, full light/dark mode compatibility, and WCAG accessibility contrast ratios.</p>
        </div>
        <div class="glass" style="padding:1.5rem;">
          <h4 style="font-weight:700; margin-bottom:0.5rem; color:var(--primary);">Future Integration Ready</h4>
          <p style="font-size:0.85rem; color:var(--text-secondary);">Architected to easily replace local mock data with live external government databases and IoT sensor APIs.</p>
        </div>
      </div>
    </section>
  `;
}

function renderContactPage(outlet) {
  outlet.innerHTML = `
    <section class="hero-section">
      <span class="hero-tag">Contact Center</span>
      <h1 class="hero-title">Get In Touch With City Hall</h1>
      <p class="hero-subtitle">Have questions or feedback? Submit a support inquiry directly to our technical queue.</p>
    </section>

    <section style="padding: 4rem 2rem; max-width: 600px; margin: 0 auto;">
      <div class="glass" style="padding:2.5rem;">
        <form id="contact-form" class="auth-form">
          <div class="form-group">
            <label>Name</label>
            <input type="text" id="cnt-name" class="form-control" placeholder="Enter your full name" required>
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input type="email" id="cnt-email" class="form-control" placeholder="Enter email address" required>
          </div>

          <div class="form-group">
            <label>Inquiry Subject</label>
            <input type="text" id="cnt-subject" class="form-control" placeholder="e.g. Accessibility audit questions" required>
          </div>

          <div class="form-group">
            <label>Message Content</label>
            <textarea id="cnt-message" class="form-control" rows="4" placeholder="Detail your query..." required></textarea>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;">Submit Support Ticket</button>
        </form>
      </div>
    </section>
  `;

  // Bind submission
  document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cnt-name').value.trim();
    const ticketId = Math.floor(10000 + Math.random() * 90000);
    
    showToast(`Thank you, ${name}. Support ticket #${ticketId} created successfully.`, 'success', 5000);
    document.getElementById('contact-form').reset();
  });
}

function renderFeedbackPage(outlet) {
  outlet.innerHTML = `
    <section class="hero-section">
      <span class="hero-tag">Feedback Registry</span>
      <h1 class="hero-title">Portal Feedback</h1>
      <p class="hero-subtitle">Help us improve the mobility platform. Share your user experience rating.</p>
    </section>

    <section style="padding: 4rem 2rem; max-width: 600px; margin: 0 auto;">
      <div class="glass" style="padding:2.5rem; display:flex; flex-direction:column; gap:1.5rem;">
        <h3 style="font-weight:700;">Rate Your Experience</h3>
        
        <div style="display:flex; justify-content:center; gap:0.8rem; font-size:2rem; margin:1rem 0;">
          <i data-lucide="star" class="star-rating-icon" data-val="1" style="cursor:pointer; color:var(--text-muted);"></i>
          <i data-lucide="star" class="star-rating-icon" data-val="2" style="cursor:pointer; color:var(--text-muted);"></i>
          <i data-lucide="star" class="star-rating-icon" data-val="3" style="cursor:pointer; color:var(--text-muted);"></i>
          <i data-lucide="star" class="star-rating-icon" data-val="4" style="cursor:pointer; color:var(--text-muted);"></i>
          <i data-lucide="star" class="star-rating-icon" data-val="5" style="cursor:pointer; color:var(--text-muted);"></i>
        </div>

        <form id="feedback-form" class="auth-form">
          <div class="form-group">
            <label>Suggestions & Comments</label>
            <textarea id="feed-comments" class="form-control" rows="4" placeholder="What features did you like? What needs improvement?" required></textarea>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;">Submit Feedback</button>
        </form>
      </div>
    </section>
  `;

  lucide.createIcons();

  // Bind rating stars
  let ratingValue = 0;
  const stars = document.querySelectorAll('.star-rating-icon');
  stars.forEach((star, idx) => {
    star.addEventListener('click', () => {
      ratingValue = idx + 1;
      stars.forEach((s, sIdx) => {
        if (sIdx < ratingValue) {
          s.style.fill = 'var(--color-pending)';
          s.style.color = 'var(--color-pending)';
        } else {
          s.style.fill = 'none';
          s.style.color = 'var(--text-muted)';
        }
      });
    });
  });

  // Bind submit
  document.getElementById('feedback-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (ratingValue === 0) {
      showToast('Please select a star rating rating.', 'warning');
      return;
    }

    showToast('Feedback submitted successfully. Thank you!', 'success');
    document.getElementById('feedback-form').reset();
    stars.forEach(s => {
      s.style.fill = 'none';
      s.style.color = 'var(--text-muted)';
    });
    ratingValue = 0;
  });
}

function renderPrivacyPage(outlet) {
  outlet.innerHTML = `
    <section style="padding:5rem 2rem; max-width:800px; margin:0 auto; line-height:1.8;">
      <h1 style="font-family:var(--font-heading); font-size:2.5rem; font-weight:800; margin-bottom:1.5rem;">Privacy Policy</h1>
      <p style="color:var(--text-secondary); margin-bottom:1rem;">Last Updated: July 20, 2026</p>
      
      <p style="color:var(--text-secondary); margin-bottom:1.5rem;">
        UrbanEase operates under Smart City developmental initiatives. This portal collects mock GPS parameters and profile configurations solely for demonstrating the system engineering prototype.
      </p>

      <h3 style="font-weight:700; margin:1.5rem 0 0.8rem 0;">Information Collection</h3>
      <p style="color:var(--text-secondary); margin-bottom:1rem;">
        All registration accounts, uploaded photos, and coordinates profiles are saved locally within your browser's <code>localStorage</code> database and are not synchronized to external web databases.
      </p>
    </section>
  `;
}

function renderTermsPage(outlet) {
  outlet.innerHTML = `
    <section style="padding:5rem 2rem; max-width:800px; margin:0 auto; line-height:1.8;">
      <h1 style="font-family:var(--font-heading); font-size:2.5rem; font-weight:800; margin-bottom:1.5rem;">Terms & Conditions</h1>
      <p style="color:var(--text-secondary); margin-bottom:1rem;">Last Updated: July 20, 2026</p>
      
      <p style="color:var(--text-secondary); margin-bottom:1.5rem;">
        By utilizing the UrbanEase platform, you agree to access features in accordance with smart city guidelines.
      </p>

      <h3 style="font-weight:700; margin:1.5rem 0 0.8rem 0;">Citizen Portal Etiquette</h3>
      <p style="color:var(--text-secondary); margin-bottom:1rem;">
        Citizens are prohibited from creating spam files, fake reviews, or spammed alerts. Doing so decreases reputation meters and restricts access credentials.
      </p>
    </section>
  `;
}
