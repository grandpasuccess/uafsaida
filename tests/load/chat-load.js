// UAFSAIDA — k6 Load Test (Chat API)
// Run with: k6 run tests/load/chat-load.js

import http from 'k6/http';
import { check, sleep } from 'k6';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export const options = {
  stages: [
    { duration: '30s', target: 5 },    // Ramp up to 5 users
    { duration: '2m', target: 5 },     // Stay at 5 users
    { duration: '30s', target: 20 },   // Ramp up to 20 users
    { duration: '2m', target: 20 },    // Stay at 20 users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests < 5s
    http_req_failed: ['rate<0.01'],     // Error rate < 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// ═══════════════════════════════════════════════════════════════
// TEST SCENARIOS
// ═══════════════════════════════════════════════════════════════

export default function () {
  // Scenario 1: Chat message (authenticated)
  const chatPayload = JSON.stringify({
    message: 'Build me a todo app',
  });

  const chatRes = http.post(`${BASE_URL}/api/chat`, chatPayload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token',
    },
  });

  check(chatRes, {
    'chat status is 200': (r) => r.status === 200,
    'chat response time < 5s': (r) => r.timings.duration < 5000,
    'chat has success field': (r) => {
      try {
        return JSON.parse(r.body).success === true;
      } catch {
        return false;
      }
    },
  });

  sleep(2);

  // Scenario 2: Projects list (authenticated)
  const projectsRes = http.get(`${BASE_URL}/api/projects`, {
    headers: { Authorization: 'Bearer test-token' },
  });

  check(projectsRes, {
    'projects status is 200': (r) => r.status === 200,
    'projects response time < 3s': (r) => r.timings.duration < 3000,
  });

  sleep(1);
}

// ═══════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════

export function setup() {
  console.log(`Starting chat API load test against ${BASE_URL}`);
  console.log('Scenarios: chat message, projects list');
  console.log('Thresholds: p95 < 5s, error rate < 1%');
  
  return { startTime: Date.now() };
}

// ═══════════════════════════════════════════════════════════════
// TEARDOWN
// ═══════════════════════════════════════════════════════════════

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Chat load test completed in ${duration}s`);
}
