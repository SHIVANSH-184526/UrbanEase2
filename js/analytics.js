/* Analytics Visualization Dashboard Engine (js/analytics.js) */

import { DB } from './state.js';

let chart1 = null;
let chart2 = null;
let chart3 = null;
let chart4 = null;

export function RenderAnalyticsCharts() {
  const complaints = DB.getComplaints();
  
  // Calculate Categories Counts
  const catCounts = {
    pothole: 0,
    'street-light-failure': 0,
    'traffic-signal-failure': 0,
    'garbage-blocking': 0,
    'damaged-footpath': 0,
    accident: 0
  };
  
  complaints.forEach(c => {
    if (catCounts[c.category] !== undefined) {
      catCounts[c.category]++;
    }
  });

  // Calculate Status Counts
  const statusCounts = {
    pending: 0,
    'under-review': 0,
    approved: 0,
    assigned: 0,
    'in-progress': 0,
    resolved: 0,
    closed: 0,
    rejected: 0
  };
  
  complaints.forEach(c => {
    if (statusCounts[c.status] !== undefined) {
      statusCounts[c.status]++;
    }
  });

  // 1. Complaint Categories Distribution (Pie/Doughnut)
  const ctx1 = document.getElementById('chart-categories');
  if (ctx1) {
    if (chart1) chart1.destroy();
    
    chart1 = new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['Potholes', 'Lights', 'Signals', 'Garbage', 'Footpaths', 'Accidents'],
        datasets: [{
          data: [
            catCounts['pothole'],
            catCounts['street-light-failure'],
            catCounts['traffic-signal-failure'],
            catCounts['garbage-blocking'],
            catCounts['damaged-footpath'],
            catCounts['accident']
          ],
          backgroundColor: [
            '#ef4444', // red
            '#f59e0b', // orange
            '#facc15', // yellow
            '#10b981', // green
            '#3b82f6', // blue
            '#8b5cf6'  // purple
          ],
          borderWidth: 1,
          borderColor: 'transparent'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
              font: { family: 'Inter', size: 11 }
            }
          }
        }
      }
    });
  }

  // 2. Case Resolution Status Performance (Horizontal Bar)
  const ctx2 = document.getElementById('chart-resolutions');
  if (ctx2) {
    if (chart2) chart2.destroy();

    chart2 = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: ['Pending', 'Reviewing', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'],
        datasets: [{
          label: 'Total Incidents',
          data: [
            statusCounts['pending'],
            statusCounts['under-review'],
            statusCounts['assigned'],
            statusCounts['in-progress'],
            statusCounts['resolved'],
            statusCounts['closed'],
            statusCounts['rejected']
          ],
          backgroundColor: [
            'rgba(245, 158, 11, 0.75)', // pending
            'rgba(99, 102, 241, 0.75)',  // review
            'rgba(59, 130, 246, 0.75)',  // approved/assigned
            'rgba(6, 182, 212, 0.75)',   // progress
            'rgba(16, 185, 129, 0.75)',  // resolved
            'rgba(100, 116, 139, 0.75)', // closed
            'rgba(239, 68, 68, 0.75)'    // rejected
          ],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim(),
              stepSize: 1
            },
            grid: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
            }
          },
          x: {
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
            },
            grid: { display: false }
          }
        }
      }
    });
  }

  // 3. Monthly Citizen Growth (Line Chart)
  const ctx3 = document.getElementById('chart-registrations');
  if (ctx3) {
    if (chart3) chart3.destroy();

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    chart3 = new Chart(ctx3, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
          label: 'Active Citizens',
          data: [150, 240, 420, 580, 810, 1050, 1280],
          borderColor: '#2563eb', // primary blue
          backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.05)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
            },
            grid: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
            }
          },
          x: {
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
            },
            grid: { display: false }
          }
        }
      }
    });
  }

  // 4. Verified vs Spammed Trends (Stacked Bar)
  const ctx4 = document.getElementById('chart-fake-trends');
  if (ctx4) {
    if (chart4) chart4.destroy();

    chart4 = new Chart(ctx4, {
      type: 'bar',
      data: {
        labels: ['May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'Verified Complaints',
            data: [28, 45, 62],
            backgroundColor: '#10b981', // green
            borderRadius: 6
          },
          {
            label: 'Spam Detected & Blocked',
            data: [12, 8, 3], // showing downward trend as fake detection discourages bad actors
            backgroundColor: '#ef4444', // red
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
            }
          }
        },
        scales: {
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
            },
            grid: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
            }
          },
          x: {
            stacked: true,
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
            },
            grid: { display: false }
          }
        }
      }
    });
  }
}
