/* UrbanEase Database Simulation (js/state.js) */

const STORAGE_PREFIX = 'urbanease_';

// Default Seed Data
const DEFAULT_USERS = [
  {
    username: 'admin',
    name: 'Director General',
    email: 'admin@urbanease.gov.in',
    password: 'admin', // Simple password for presentation convenience
    role: 'admin',
    status: 'active',
    registeredAt: '2026-07-01T09:00:00Z',
    reputationScore: 100,
    activityLogs: [
      { action: 'Admin initialized system', time: '2026-07-01T09:00:00Z' }
    ]
  },
  {
    username: 'citizen',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@gmail.com',
    password: 'citizen',
    role: 'citizen',
    status: 'active',
    registeredAt: '2026-07-10T11:24:00Z',
    reputationScore: 85,
    activityLogs: [
      { action: 'Registered user account', time: '2026-07-10T11:24:00Z' },
      { action: 'Logged in to dashboard', time: '2026-07-20T14:30:00Z' }
    ]
  },
  {
    username: 'priya_k',
    name: 'Priya Krishnan',
    email: 'priya.k@outlook.com',
    password: 'user123',
    role: 'citizen',
    status: 'pending', // Pending approval workflow
    registeredAt: '2026-07-20T08:15:00Z',
    reputationScore: 50,
    activityLogs: [
      { action: 'Registered user account, waiting for approval', time: '2026-07-20T08:15:00Z' }
    ]
  },
  {
    username: 'spammer_bob',
    name: 'Bob Miller',
    email: 'bob.spam@junkmail.com',
    password: 'password123',
    role: 'citizen',
    status: 'suspended',
    registeredAt: '2026-07-15T18:40:00Z',
    reputationScore: 5,
    activityLogs: [
      { action: 'Registered user account', time: '2026-07-15T18:40:00Z' },
      { action: 'Account suspended due to fake report detection', time: '2026-07-18T10:00:00Z' }
    ]
  }
];

const DEFAULT_COMPLAINTS = [
  {
    id: 'COMP-2026-001',
    title: 'Severe Pothole on Residency Road',
    description: 'A deep pothole has formed in the middle lane of Residency Road right after the main intersection. Multiple vehicles had to veer off sharply to avoid it. High risk for two-wheelers.',
    category: 'pothole',
    severity: 'high',
    status: 'resolved',
    lat: 12.9725,
    lng: 77.6012,
    image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop',
    reporter: 'citizen',
    supports: 12,
    supportedBy: ['citizen', 'priya_k'],
    department: 'Municipal Works Division',
    comments: [
      { author: 'admin', comment: 'Assigned to road maintenance crew. Status changed to In Progress.', date: '2026-07-12T10:12:00Z' },
      { author: 'admin', comment: 'Pothole filled and sealed. Road inspected. Resolving.', date: '2026-07-14T16:45:00Z' }
    ],
    date: '2026-07-11T14:35:00Z'
  },
  {
    id: 'COMP-2026-002',
    title: 'Damaged Wheelchair Ramp at Metro Station Entry A',
    description: 'The concrete ramp leading to Entry A of MG Road Metro Station is cracked and has a steep, dangerous gap that makes it impossible for manual wheelchairs to climb without assistance.',
    category: 'damaged-footpath',
    severity: 'high',
    status: 'in-progress',
    lat: 12.9738,
    lng: 77.6068,
    image: 'https://images.unsplash.com/photo-1598048145816-43ad3712b7a9?q=80&w=600&auto=format&fit=crop',
    reporter: 'citizen',
    supports: 8,
    supportedBy: ['citizen'],
    department: 'Metro Accessibility Unit',
    comments: [
      { author: 'admin', comment: 'Department assigned. Repair works scheduled for this weekend.', date: '2026-07-19T09:20:00Z' }
    ],
    date: '2026-07-18T11:05:00Z'
  },
  {
    id: 'COMP-2026-003',
    title: 'Garbage Blockade on Commercial Street Footpath',
    description: 'Commercial waste and broken wooden boxes are dumped on the footpath in front of Store 45, forcing pedestrians to walk on the narrow main street, causing traffic bottlenecks.',
    category: 'garbage-blocking',
    severity: 'medium',
    status: 'under-review',
    lat: 12.9808,
    lng: 77.6074,
    image: '',
    reporter: 'citizen',
    supports: 3,
    supportedBy: [],
    department: 'Solid Waste Management',
    comments: [],
    date: '2026-07-20T08:30:00Z'
  },
  {
    id: 'COMP-2026-004',
    title: 'Street Light Failure near Cubbon Park Gate',
    description: 'A row of three streetlights is completely dead along Hudson Road right next to the park entrance. Extremely dark at night, making the walkway feel highly unsafe.',
    category: 'street-light-failure',
    severity: 'medium',
    status: 'pending',
    lat: 12.9755,
    lng: 77.5962,
    image: '',
    reporter: 'citizen',
    supports: 1,
    supportedBy: [],
    department: 'City Power & Lighting Dept',
    comments: [],
    date: '2026-07-20T17:15:00Z'
  },
  {
    id: 'COMP-2026-005',
    title: 'Traffic Signal Failure at Trinity Junction',
    description: 'The traffic signal at Trinity Junction is stuck on flashing yellow for the past hour. Heavy congestion building up, traffic police not present yet.',
    category: 'traffic-signal-failure',
    severity: 'high',
    status: 'pending',
    lat: 12.9732,
    lng: 77.6210,
    image: '',
    reporter: 'citizen',
    supports: 5,
    supportedBy: [],
    department: 'Traffic Management Directorate',
    comments: [],
    date: '2026-07-20T20:45:00Z'
  }
];

const DEFAULT_PARKING = [
  { id: 'PK-001', name: 'MG Road Multi-Level Parking', lat: 12.9745, lng: 77.6080, capacity: 250, occupied: 182, charges: '₹40/hr', accessible: true },
  { id: 'PK-002', name: 'Brigade Road Public Lot', lat: 12.9712, lng: 77.6071, capacity: 120, occupied: 118, charges: '₹50/hr', accessible: true },
  { id: 'PK-003', name: 'Cubbon Park Parking West', lat: 12.9760, lng: 77.5925, capacity: 80, occupied: 35, charges: '₹20/hr', accessible: false },
  { id: 'PK-004', name: 'Residency Road Commercial Parking', lat: 12.9720, lng: 77.6030, capacity: 150, occupied: 64, charges: '₹40/hr', accessible: true },
  { id: 'PK-005', name: 'Kanteerava Stadium South Lot', lat: 12.9690, lng: 77.5930, capacity: 300, occupied: 45, charges: '₹30/hr', accessible: true }
];

const DEFAULT_STATIONS = [
  { id: 'ST-001', name: 'MG Road Metro Station', type: 'metro', lat: 12.9738, lng: 77.6068, routes: ['Purple Line'], timetable: ['Every 5 mins (06:00 - 23:00)'], accessible: true },
  { id: 'ST-002', name: 'Trinity Metro Station', type: 'metro', lat: 12.9732, lng: 77.6210, routes: ['Purple Line'], timetable: ['Every 5 mins (06:00 - 23:00)'], accessible: true },
  { id: 'ST-003', name: 'Residency Road Bus Stop', type: 'bus', lat: 12.9723, lng: 77.6025, routes: ['335E', '333P', 'G-4'], timetable: ['Approx. every 10 mins'], accessible: true },
  { id: 'ST-004', name: 'Brigade Junction Bus Stop', type: 'bus', lat: 12.9715, lng: 77.6075, routes: ['330A', 'V-335E', 'K-1'], timetable: ['Approx. every 12 mins'], accessible: false },
  { id: 'ST-005', name: 'Bangalore Cantonment Railway Station', type: 'railway', lat: 12.9930, lng: 77.5980, routes: ['South Western Suburban Train'], timetable: ['Hourly inter-city & local services'], accessible: true }
];

const DEFAULT_ANNOUNCEMENTS = [
  { id: 1, title: 'Accessibility Audit Completed for Central Ward', content: 'Our municipal body has successfully audited 14 public buildings and installed modern ramps and tactile footpaths along MG Road.', date: '2026-07-18T10:00:00Z', author: 'Director General' },
  { id: 2, title: 'Road Closures on Hudson Road for Metro Extensions', content: 'Pedestrian and vehicular traffic will be diverted on Hudson Road starting July 22nd due to pillar installations. Please use alternate route planning.', date: '2026-07-20T07:00:00Z', author: 'Traffic Directorate' }
];

const DEFAULT_AUDIT_LOGS = [
  { id: 1, action: 'System Setup & Seed Data Load', target: 'Database', timestamp: '2026-07-20T10:00:00Z', adminName: 'Director General' },
  { id: 2, action: 'Suspended user spammer_bob due to repeated fake alerts', target: 'spammer_bob', timestamp: '2026-07-20T11:30:00Z', adminName: 'Director General' }
];

// Helper to fetch or initialize localStorage
function getStore(key, defaultValue) {
  const data = localStorage.getItem(STORAGE_PREFIX + key);
  if (data === null) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
}

function setStore(key, value) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
}

// Exportable State Object
export const DB = {
  // Collections
  getUsers() { return getStore('users', DEFAULT_USERS); },
  setUsers(users) { setStore('users', users); },
  
  getComplaints() { return getStore('complaints', DEFAULT_COMPLAINTS); },
  setComplaints(complaints) { setStore('complaints', complaints); },
  
  getParking() { return getStore('parking', DEFAULT_PARKING); },
  setParking(parking) { setStore('parking', parking); },
  
  getStations() { return getStore('stations', DEFAULT_STATIONS); },
  setStations(stations) { setStore('stations', stations); },
  
  getAnnouncements() { return getStore('announcements', DEFAULT_ANNOUNCEMENTS); },
  setAnnouncements(announcements) { setStore('announcements', announcements); },
  
  getAuditLogs() { return getStore('audit_logs', DEFAULT_AUDIT_LOGS); },
  setAuditLogs(logs) { setStore('audit_logs', logs); },

  // System Configurations
  getSystemSettings() {
    return getStore('settings', {
      approvalWorkflowEnabled: true, // Default to true so newly registered users require admin approval
      automaticFakeDetection: true,
      minReputationForUrgent: 40
    });
  },
  setSystemSettings(settings) { setStore('settings', settings); },

  // Global Session
  getCurrentUser() {
    const user = sessionStorage.getItem(STORAGE_PREFIX + 'session');
    return user ? JSON.parse(user) : null;
  },
  setCurrentUser(user) {
    if (user) {
      sessionStorage.setItem(STORAGE_PREFIX + 'session', JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_PREFIX + 'session');
    }
  },

  // State Modification Operations
  addUser(user) {
    const users = this.getUsers();
    users.push(user);
    this.setUsers(users);
  },

  updateUser(username, updatedFields) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.username === username);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedFields };
      this.setUsers(users);
      
      // Update session if it's the current user
      const current = this.getCurrentUser();
      if (current && current.username === username) {
        this.setCurrentUser({ ...current, ...updatedFields });
      }
      return true;
    }
    return false;
  },

  deleteUser(username) {
    const users = this.getUsers();
    const filtered = users.filter(u => u.username !== username);
    if (users.length !== filtered.length) {
      this.setUsers(filtered);
      return true;
    }
    return false;
  },

  addComplaint(complaint) {
    const complaints = this.getComplaints();
    complaints.unshift(complaint); // Newest first
    this.setComplaints(complaints);
  },

  updateComplaint(id, updatedFields) {
    const complaints = this.getComplaints();
    const index = complaints.findIndex(c => c.id === id);
    if (index !== -1) {
      complaints[index] = { ...complaints[index], ...updatedFields };
      this.setComplaints(complaints);
      return true;
    }
    return false;
  },

  addAnnouncement(announcement) {
    const list = this.getAnnouncements();
    announcement.id = list.length > 0 ? Math.max(...list.map(a => a.id)) + 1 : 1;
    list.unshift(announcement);
    this.setAnnouncements(list);
  },

  addAuditLog(adminName, action, target) {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1,
      adminName,
      action,
      target,
      timestamp: new Date().toISOString()
    });
    this.setAuditLogs(logs);
  },

  // Reset database function
  resetDatabase() {
    localStorage.removeItem(STORAGE_PREFIX + 'users');
    localStorage.removeItem(STORAGE_PREFIX + 'complaints');
    localStorage.removeItem(STORAGE_PREFIX + 'parking');
    localStorage.removeItem(STORAGE_PREFIX + 'stations');
    localStorage.removeItem(STORAGE_PREFIX + 'announcements');
    localStorage.removeItem(STORAGE_PREFIX + 'audit_logs');
    localStorage.removeItem(STORAGE_PREFIX + 'settings');
    this.setCurrentUser(null);
    window.location.reload();
  }
};
