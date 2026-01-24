import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metric for tracking error rate
const errorRate = new Rate('error_rate');

export const options = {
    stages: [
        { duration: '10s', target: 5 },  // Ramp up to 5 users
        { duration: '20s', target: 5 },  // Stay at 5 users
        { duration: '10s', target: 0 },  // Ramp down
    ],
    thresholds: {
        'http_req_duration': ['p(95)<500'], // 95% of requests must complete below 500ms
        'error_rate': ['rate<0.05'], // Error rate should be less than 5%
    },
};

const BASE_URL = 'http://localhost:3011';

export default function () {
    group('Health Check', function () {
        const res = http.get(`${BASE_URL}/health`);
        const result = check(res, { 
            'status is 200': (r) => r.status === 200 
        });
        errorRate.add(!result);
    });

    group('License Validate', function () {
        const payload = JSON.stringify({
            licenseKey: 'load-test-key-001',
            deviceIdHash: 'load-test-device-001'
        });
        
        const params = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const res = http.post(`${BASE_URL}/license/validate`, payload, params);
        
        // We accept 200, 401 (invalid key), or 403 (revoked) as valid protocol responses
        // Anything else (like 500) is an error.
        const result = check(res, { 
            'status is handled': (r) => [200, 401, 403].includes(r.status) 
        });
        errorRate.add(!result);
    });

    sleep(1);
}
