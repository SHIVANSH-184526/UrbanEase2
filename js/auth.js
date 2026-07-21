/* Authentication Controller (js/auth.js) */

import { DB } from './state.js';
import { showToast } from './app.js';

export const Auth = {
  // Renders standard User Login
  renderUserLogin() {
    const outlet = document.getElementById('router-outlet');
    outlet.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card glass">
          <div class="auth-header">
            <h2 class="logo-text">Citizen Portal</h2>
            <p>Sign in to access your dashboard, routes, and file reports.</p>
          </div>
          
          <div class="auth-nav-toggle">
            <a href="#/login" class="auth-toggle-btn active">Citizen Sign In</a>
            <a href="#/admin-login" class="auth-toggle-btn">Admin Portal</a>
          </div>

          <form id="user-login-form" class="auth-form">
            <div id="login-alert" class="auth-alert auth-alert-error hidden"></div>
            
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" id="username" class="form-control" placeholder="Enter username (try 'citizen')" required>
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" class="form-control" placeholder="Enter password (try 'citizen')" required>
            </div>
            
            <div class="auth-footer-links">
              <a href="#/forgot-password">Forgot Password?</a>
              <span style="color: var(--text-muted);">|</span>
              <a href="#/register">Create Citizen Account</a>
            </div>

            <div class="auth-btn-container">
              <button type="submit" class="btn btn-primary w-100" style="width:100%;">Sign In</button>
            </div>
          </form>
        </div>
      </div>
    `;
    lucide.createIcons();
    this.bindUserLogin();
  },

  bindUserLogin() {
    const form = document.getElementById('user-login-form');
    const alertBox = document.getElementById('login-alert');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alertBox.classList.add('hidden');

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      const users = DB.getUsers();
      const user = users.find(u => u.username === username);

      if (!user) {
        alertBox.textContent = 'Account username not registered.';
        alertBox.classList.remove('hidden');
        return;
      }

      if (user.password !== password) {
        alertBox.textContent = 'Incorrect password credentials.';
        alertBox.classList.remove('hidden');
        return;
      }

      if (user.role === 'admin') {
        alertBox.textContent = 'Admins must sign in through the Admin Portal tab.';
        alertBox.classList.remove('hidden');
        return;
      }

      if (user.status === 'pending') {
        alertBox.innerHTML = '<strong>Approval Required:</strong> Your citizen account is pending administrative approval. Please try again later.';
        alertBox.classList.remove('hidden');
        return;
      }

      if (user.status === 'suspended') {
        alertBox.innerHTML = '<strong>Access Blocked:</strong> This account has been suspended due to policy violations (e.g. repeated fake report filings).';
        alertBox.classList.remove('hidden');
        return;
      }

      // Success
      DB.setCurrentUser(user);
      DB.updateUser(user.username, {
        activityLogs: [{ action: 'Logged in to dashboard', time: new Date().toISOString() }, ...user.activityLogs.slice(0, 9)]
      });

      showToast(`Welcome back, ${user.name}!`, 'success');
      window.location.hash = '#/dashboard';
    });
  },

  // Renders Separate Admin Login
  renderAdminLogin() {
    const outlet = document.getElementById('router-outlet');
    outlet.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card glass">
          <div class="auth-header">
            <h2 class="logo-text" style="background: linear-gradient(135deg, var(--primary), var(--accent));">Admin Center</h2>
            <p>Secure administrative gateway for municipal controls and monitoring.</p>
          </div>
          
          <div class="auth-nav-toggle">
            <a href="#/login" class="auth-toggle-btn">Citizen Sign In</a>
            <a href="#/admin-login" class="auth-toggle-btn active">Admin Portal</a>
          </div>

          <form id="admin-login-form" class="auth-form">
            <div id="admin-alert" class="auth-alert auth-alert-error hidden"></div>
            
            <div class="form-group">
              <label for="admin-username">Admin ID</label>
              <input type="text" id="admin-username" class="form-control" placeholder="Enter Admin Username (try 'admin')" required>
            </div>
            
            <div class="form-group">
              <label for="admin-password">Secure Password</label>
              <input type="password" id="admin-password" class="form-control" placeholder="Enter password (try 'admin')" required>
            </div>

            <div class="auth-btn-container">
              <button type="submit" class="btn btn-secondary w-100" style="width:100%;">Authorize Access</button>
            </div>
          </form>
        </div>
      </div>
    `;
    lucide.createIcons();
    this.bindAdminLogin();
  },

  bindAdminLogin() {
    const form = document.getElementById('admin-login-form');
    const alertBox = document.getElementById('admin-alert');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alertBox.classList.add('hidden');

      const username = document.getElementById('admin-username').value.trim();
      const password = document.getElementById('admin-password').value;

      const users = DB.getUsers();
      const user = users.find(u => u.username === username && u.role === 'admin');

      if (!user || user.password !== password) {
        alertBox.textContent = 'Invalid Administrative ID or Password credentials.';
        alertBox.classList.remove('hidden');
        return;
      }

      // Success
      DB.setCurrentUser(user);
      DB.addAuditLog(user.name, 'Admin logged in', 'Session Management');
      
      showToast('Administrative authorization granted.', 'success');
      window.location.hash = '#/admin';
    });
  },

  // Renders citizen registration form
  renderUserRegister() {
    const outlet = document.getElementById('router-outlet');
    const settings = DB.getSystemSettings();
    const infoMessage = settings.approvalWorkflowEnabled 
      ? 'Note: New accounts undergo administrative verification before access is granted.' 
      : 'Create an account to start routing and filing complaints.';

    outlet.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card glass">
          <div class="auth-header">
            <h2 class="logo-text">Citizen Registry</h2>
            <p>${infoMessage}</p>
          </div>

          <form id="user-register-form" class="auth-form">
            <div id="register-alert" class="auth-alert hidden"></div>
            
            <div class="form-group">
              <label for="reg-name">Full Name</label>
              <input type="text" id="reg-name" class="form-control" placeholder="Enter first & last name" required>
            </div>

            <div class="form-group">
              <label for="reg-email">Email Address</label>
              <input type="email" id="reg-email" class="form-control" placeholder="Enter email address" required>
            </div>

            <div class="form-group">
              <label for="reg-username">Choose Username</label>
              <input type="text" id="reg-username" class="form-control" placeholder="Letters & numbers only" required>
            </div>
            
            <div class="form-group">
              <label for="reg-password">Password</label>
              <input type="password" id="reg-password" class="form-control" placeholder="Minimum 6 characters" required>
            </div>

            <div class="auth-footer-links">
              <span>Already registered?</span>
              <a href="#/login">Citizen Login</a>
            </div>

            <div class="auth-btn-container">
              <button type="submit" class="btn btn-primary w-100" style="width:100%;">Complete Registration</button>
            </div>
          </form>
        </div>
      </div>
    `;
    lucide.createIcons();
    this.bindUserRegister();
  },

  bindUserRegister() {
    const form = document.getElementById('user-register-form');
    const alertBox = document.getElementById('register-alert');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alertBox.classList.add('hidden');
      alertBox.className = 'auth-alert'; // reset classes

      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const username = document.getElementById('reg-username').value.trim().toLowerCase();
      const password = document.getElementById('reg-password').value;

      // Validation
      if (username.length < 3) {
        alertBox.textContent = 'Username must be at least 3 characters.';
        alertBox.classList.add('auth-alert-error');
        alertBox.classList.remove('hidden');
        return;
      }

      if (password.length < 6) {
        alertBox.textContent = 'Password must be at least 6 characters.';
        alertBox.classList.add('auth-alert-error');
        alertBox.classList.remove('hidden');
        return;
      }

      const users = DB.getUsers();
      if (users.some(u => u.username === username)) {
        alertBox.textContent = 'Username is already taken by another citizen.';
        alertBox.classList.add('auth-alert-error');
        alertBox.classList.remove('hidden');
        return;
      }

      if (users.some(u => u.email === email)) {
        alertBox.textContent = 'Email address is already registered.';
        alertBox.classList.add('auth-alert-error');
        alertBox.classList.remove('hidden');
        return;
      }

      // Check settings for approval workflow
      const settings = DB.getSystemSettings();
      const initialStatus = settings.approvalWorkflowEnabled ? 'pending' : 'active';

      const newUser = {
        username,
        name,
        email,
        password,
        role: 'citizen',
        status: initialStatus,
        registeredAt: new Date().toISOString(),
        reputationScore: 70, // Standard starting reputation score
        activityLogs: [
          { action: 'Registered user account', time: new Date().toISOString() }
        ]
      };

      DB.addUser(newUser);

      if (settings.approvalWorkflowEnabled) {
        alertBox.innerHTML = '<strong>Success!</strong> Account created. It is now <strong>Pending Approval</strong>. The Admin will review and authorize access.';
        alertBox.classList.add('auth-alert-success');
        alertBox.classList.remove('hidden');
        form.reset();
        showToast('Registration complete. Awaiting Admin activation.', 'info', 5000);
      } else {
        showToast('Account registered! Redirecting to login...', 'success');
        setTimeout(() => {
          window.location.hash = '#/login';
        }, 1500);
      }
    });
  },

  // Renders citizen profile page
  renderProfile() {
    const outlet = document.getElementById('router-outlet');
    const user = DB.getCurrentUser();

    outlet.innerHTML = `
      <div class="profile-container glass">
        <div class="profile-header">
          <div class="profile-avatar">${user.name.charAt(0)}</div>
          <div class="profile-meta">
            <h2>${user.name}</h2>
            <p>Citizen Account | Registered: ${new Date(user.registeredAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div class="profile-grid">
          <div>
            <h3 style="margin-bottom:1rem;">Profile Settings</h3>
            <form id="profile-edit-form" class="auth-form">
              <div id="profile-alert" class="auth-alert hidden"></div>
              
              <div class="form-group">
                <label>Name</label>
                <input type="text" id="prof-name" class="form-control" value="${user.name}" required>
              </div>

              <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="prof-email" class="form-control" value="${user.email}" required>
              </div>

              <div class="form-group">
                <label>Username</label>
                <input type="text" class="form-control" value="${user.username}" disabled style="opacity:0.6; cursor:not-allowed;">
                <span style="font-size:0.75rem; color:var(--text-muted);">Usernames cannot be changed. Contact admin for assistance.</span>
              </div>

              <button type="submit" class="btn btn-primary" style="align-self:flex-start;">Update Profile</button>
            </form>
          </div>

          <div style="border-left:1px solid var(--border-color); padding-left:2.5rem;">
            <h3 style="margin-bottom:1rem;">Security</h3>
            <form id="password-change-form" class="auth-form">
              <div id="password-alert" class="auth-alert hidden"></div>

              <div class="form-group">
                <label>Current Password</label>
                <input type="password" id="pass-current" class="form-control" required>
              </div>

              <div class="form-group">
                <label>New Password</label>
                <input type="password" id="pass-new" class="form-control" required>
              </div>

              <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" id="pass-confirm" class="form-control" required>
              </div>

              <button type="submit" class="btn btn-outline" style="align-self:flex-start;">Change Password</button>
            </form>
          </div>
        </div>
      </div>
    `;

    lucide.createIcons();
    this.bindProfileForms();
  },

  bindProfileForms() {
    const user = DB.getCurrentUser();

    // Profile form
    const profForm = document.getElementById('profile-edit-form');
    const profAlert = document.getElementById('profile-alert');

    profForm.addEventListener('submit', (e) => {
      e.preventDefault();
      profAlert.classList.add('hidden');
      profAlert.className = 'auth-alert';

      const name = document.getElementById('prof-name').value.trim();
      const email = document.getElementById('prof-email').value.trim();

      const users = DB.getUsers();
      // Email duplicate check excluding self
      if (users.some(u => u.email === email && u.username !== user.username)) {
        profAlert.textContent = 'This email address is already in use by another user.';
        profAlert.classList.add('auth-alert-error');
        profAlert.classList.remove('hidden');
        return;
      }

      DB.updateUser(user.username, { name, email });
      showToast('Profile updated successfully!', 'success');
      profAlert.textContent = 'Settings updated successfully.';
      profAlert.classList.add('auth-alert-success');
      profAlert.classList.remove('hidden');
    });

    // Password change form
    const passForm = document.getElementById('password-change-form');
    const passAlert = document.getElementById('password-alert');

    passForm.addEventListener('submit', (e) => {
      e.preventDefault();
      passAlert.classList.add('hidden');
      passAlert.className = 'auth-alert';

      const current = document.getElementById('pass-current').value;
      const newPass = document.getElementById('pass-new').value;
      const confirmPass = document.getElementById('pass-confirm').value;

      if (current !== user.password) {
        passAlert.textContent = 'Incorrect current password.';
        passAlert.classList.add('auth-alert-error');
        passAlert.classList.remove('hidden');
        return;
      }

      if (newPass.length < 6) {
        passAlert.textContent = 'New password must be at least 6 characters.';
        passAlert.classList.add('auth-alert-error');
        passAlert.classList.remove('hidden');
        return;
      }

      if (newPass !== confirmPass) {
        passAlert.textContent = 'Passwords do not match.';
        passAlert.classList.add('auth-alert-error');
        passAlert.classList.remove('hidden');
        return;
      }

      DB.updateUser(user.username, { password: newPass });
      showToast('Password changed successfully!', 'success');
      passAlert.textContent = 'Password changed successfully.';
      passAlert.classList.add('auth-alert-success');
      passAlert.classList.remove('hidden');
      passForm.reset();
    });
  },

  // Forgot password form
  renderForgotPassword() {
    const outlet = document.getElementById('router-outlet');
    outlet.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card glass">
          <div class="auth-header">
            <h2 class="logo-text">Reset Password</h2>
            <p>Provide your registered email address to receive password instructions.</p>
          </div>

          <form id="forgot-password-form" class="auth-form">
            <div id="reset-alert" class="auth-alert hidden"></div>
            
            <div class="form-group">
              <label for="reset-email">Email Address</label>
              <input type="email" id="reset-email" class="form-control" placeholder="e.g. rahul@gmail.com" required>
            </div>

            <div class="auth-footer-links">
              <a href="#/login">Return to Sign In</a>
            </div>

            <div class="auth-btn-container">
              <button type="submit" class="btn btn-primary w-100" style="width:100%;">Send Instructions</button>
            </div>
          </form>
        </div>
      </div>
    `;
    lucide.createIcons();
    this.bindForgotPassword();
  },

  bindForgotPassword() {
    const form = document.getElementById('forgot-password-form');
    const alertBox = document.getElementById('reset-alert');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alertBox.classList.add('hidden');
      alertBox.className = 'auth-alert';

      const email = document.getElementById('reset-email').value.trim();
      const users = DB.getUsers();
      const user = users.find(u => u.email === email);

      if (!user) {
        alertBox.textContent = 'This email is not associated with any registered account.';
        alertBox.classList.add('auth-alert-error');
        alertBox.classList.remove('hidden');
        return;
      }

      // Successful simulated reset email sending
      alertBox.innerHTML = `<strong>Email Sent:</strong> Simulated recovery link sent to <strong>${email}</strong>. For quick testing, your password is <strong>"${user.password}"</strong>.`;
      alertBox.classList.add('auth-alert-success');
      alertBox.classList.remove('hidden');
      showToast('Simulated reset email sent.', 'success');
    });
  }
};
