// =====================================================
// k6 Performance Smoke Test — ITing
// =====================================================
// Endpoints public (không cần JWT):
//   GET /api/jobs/search
//   GET /api/jobs/latest
//   GET /api/jobs/hot
//   GET /api/companies/{id}
//   GET /api/payments/subscription-tiers
//
// Mục tiêu NFR 3.3.1:
//   - p(95) < 2000ms
//   - error rate < 1%
//   - throughput ≥ 50 req/s
//
// Chạy local:
//   k6 run -e TARGET_URL=http://localhost:8080 tests/perf/k6-smoke.js
//
// Chạy stress (200 user — NFR 3.3.3):
//   k6 run -e VUS=200 -e DURATION=10m tests/perf/k6-smoke.js

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const TARGET_URL = __ENV.TARGET_URL || 'http://localhost:8080';
const VUS = parseInt(__ENV.VUS || '50', 10);
const DURATION = __ENV.DURATION || '5m';

// Header bí mật để bỏ qua nginx rate-limit per-IP (load-test bắn tải cao từ 1 IP CI).
// Phải khớp giá trị trong deploy/config/nginx/nginx.conf (map $http_x_loadtest_bypass).
// Có thể override qua secret: -e K6_BYPASS_TOKEN=...
const BYPASS_TOKEN = __ENV.K6_BYPASS_TOKEN || 'itg-k6-smoke-bypass-9f3a7c21e8';
const PARAMS = { headers: { 'X-Loadtest-Bypass': BYPASS_TOKEN } };

const errors = new Rate('errors');
const apiDuration = new Trend('api_duration_ms', true);

export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: VUS,
      duration: DURATION,
    },
  },
  thresholds: {
    'http_req_duration{group:::jobs}':      ['p(95)<2000'],
    'http_req_duration{group:::companies}': ['p(95)<2000'],
    'http_req_failed':                      ['rate<0.01'],
    'errors':                               ['rate<0.01'],
  },
};

export default function () {
  group('jobs', () => {
    const search = http.get(`${TARGET_URL}/api/jobs/search?page=0&size=10`, PARAMS);
    apiDuration.add(search.timings.duration, { endpoint: 'search' });
    check(search, { 'search 200': (r) => r.status === 200 }) || errors.add(1);

    const latest = http.get(`${TARGET_URL}/api/jobs/latest?limit=20`, PARAMS);
    apiDuration.add(latest.timings.duration, { endpoint: 'latest' });
    check(latest, { 'latest 200': (r) => r.status === 200 }) || errors.add(1);

    const hot = http.get(`${TARGET_URL}/api/jobs/hot?limit=10`, PARAMS);
    apiDuration.add(hot.timings.duration, { endpoint: 'hot' });
    check(hot, { 'hot 200': (r) => r.status === 200 }) || errors.add(1);
  });

  group('companies', () => {
    const tiers = http.get(`${TARGET_URL}/api/payments/subscription-tiers`, PARAMS);
    apiDuration.add(tiers.timings.duration, { endpoint: 'tiers' });
    check(tiers, { 'tiers 200': (r) => r.status === 200 }) || errors.add(1);
  });

  sleep(1);
}

// Custom summary handler — in console + write JSON cho artifact
export function handleSummary(data) {
  return {
    'stdout': textSummary(data),
    'k6-summary.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data) {
  const m = data.metrics;
  return `
==================== k6 Smoke Result ====================
Target:        ${TARGET_URL}
VUs:           ${VUS}     Duration: ${DURATION}
Total reqs:    ${m.http_reqs.values.count}
Throughput:    ${m.http_reqs.values.rate.toFixed(2)} req/s
p(95) ms:      ${m.http_req_duration.values['p(95)'].toFixed(1)}
Error rate:    ${(m.http_req_failed.values.rate * 100).toFixed(2)}%
=========================================================
`;
}
