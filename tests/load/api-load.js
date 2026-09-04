// UAFSAIDA — k6 Load Test
// Run with: k6 run tests/load/api-load.js

import http from 'k6/http';
import { check, sleep } from 'k6';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 users
    { duration: '3m', target: 10 },   // Stay at 10 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% of requests < 3s
    http_req_failed: ['rate<0.005'],    // Error rate < 0.5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// ═══════════════════════════════════════════════════════════════
// TEST SCENARIOS
// ═══════════════════════════════════════════════════════════════

export default function () {
  // Scenario 1: Health check (lightweight)
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 200ms': (r) => r.timings.duration < 200,
    'health has status ok': (r) => JSON.parse(r.body).status === 'ok',
  });

  sleep(1);

  // Scenario 2: Login page (static)
  const loginRes = http.get(`${BASE_URL}/login`);
  check(loginRes, {
    'login page status is 200': (r) => r.status === 200,
    'login page has GitHub button': (r) => r.body.includes('Continue with GitHub'),
  });

  sleep(1);

  // Scenario 3: Workspace page
  const workspaceRes = http.get(`${BASE_URL}/workspace`);
  check(workspaceRes, {
    'workspace status is 200': (r) => r.status === 200,
  });

  sleep(2);
}

// ═══════════════════════════════════════════════════════════════
// SETUP (runs once before all VUs)
// ═══════════════════════════════════════════════════════════════

export function setup() {
  console.log(`Starting load test against ${BASE_URL}`);
  console.log('Scenarios: health check, login page, workspace page');
  console.log('Thresholds: p95 < 3s, error rate < 0.5%');
  
  // Verify the target is reachable
  const res = http.get(`${BASE_URL}/api/health`);
  if (res.status !== 200) {
    console.error(`Target unreachable: ${res.status}`);
  }
  
  return { startTime: Date.now() };
}

// ═══════════════════════════════════════════════════════════════
// TEARDOWN (runs once after all VUs finish)
// ═══════════════════════════════════════════════════════════════

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Load test completed in ${duration}s`);
}
