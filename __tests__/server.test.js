/**
 * ThreatTest Server Test Suite
 * Tests for API endpoints and core functionality
 */

const request = require('supertest');
const app = require('../server.js');

describe('ThreatTest API Endpoints', () => {
    
    // Health Check Tests
    describe('GET /api/health', () => {
        it('should return healthy status', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'healthy');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
        });
    });

    // Tests Endpoints
    describe('GET /api/tests', () => {
        it('should return list of tests', async () => {
            const response = await request(app)
                .get('/api/tests')
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(Array.isArray(response.body.tests)).toBe(true);
            expect(response.body).toHaveProperty('total');
        });
    });

    describe('POST /api/tests/url', () => {
        it('should fail without URL', async () => {
            const response = await request(app)
                .post('/api/tests/url')
                .send({
                    name: 'Test'
                })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error');
        });

        it('should create URL test with valid data', async () => {
            const response = await request(app)
                .post('/api/tests/url')
                .send({
                    name: 'Homepage Test',
                    url: 'https://example.com',
                    method: 'GET',
                    timeout: 5000
                })
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('testId');
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('POST /api/tests/load', () => {
        it('should fail without URL', async () => {
            const response = await request(app)
                .post('/api/tests/load')
                .send({
                    requests: 100
                })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });

        it('should create load test with valid data', async () => {
            const response = await request(app)
                .post('/api/tests/load')
                .send({
                    url: 'https://example.com',
                    requests: 100,
                    concurrent: 10,
                    timeout: 5000
                })
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('testId');
        });
    });

    describe('POST /api/tests/failure', () => {
        it('should fail with invalid scenario type', async () => {
            const response = await request(app)
                .post('/api/tests/failure')
                .send({
                    type: 'invalid_type',
                    url: 'https://example.com'
                })
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error).toContain('Invalid failure scenario type');
        });

        it('should create failure test with valid type', async () => {
            const response = await request(app)
                .post('/api/tests/failure')
                .send({
                    type: 'network',
                    url: 'https://example.com',
                    requests: 50
                })
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('testId');
        });

        it('should support all failure scenario types', async () => {
            const types = ['network', 'timeout', 'error', 'load'];

            for (const type of types) {
                const response = await request(app)
                    .post('/api/tests/failure')
                    .send({
                        type: type,
                        requests: 50
                    })
                    .expect(200);

                expect(response.body).toHaveProperty('success', true);
            }
        });
    });

    // Security Scan Tests
    describe('POST /api/security/scan', () => {
        it('should fail without URL', async () => {
            const response = await request(app)
                .post('/api/security/scan')
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });

        it('should initiate security scan with valid URL', async () => {
            const response = await request(app)
                .post('/api/security/scan')
                .send({
                    url: 'https://example.com'
                })
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message');
        });
    });

    // Stats Tests
    describe('GET /api/stats', () => {
        it('should return comprehensive statistics', async () => {
            const response = await request(app)
                .get('/api/stats')
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('stats');
            expect(response.body.stats).toHaveProperty('totalTests');
            expect(response.body.stats).toHaveProperty('passedTests');
            expect(response.body.stats).toHaveProperty('failedTests');
            expect(response.body.stats).toHaveProperty('runningTests');
            expect(response.body.stats).toHaveProperty('avgResponseTime');
            expect(response.body.stats).toHaveProperty('successRate');
        });
    });

    // Report Generation Tests
    describe('GET /api/reports/generate', () => {
        it('should generate report without date filters', async () => {
            const response = await request(app)
                .get('/api/reports/generate')
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('report');
            expect(response.body.report).toHaveProperty('generatedAt');
            expect(response.body.report).toHaveProperty('summary');
            expect(response.body.report).toHaveProperty('tests');
        });

        it('should generate report with date filters', async () => {
            const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const endDate = new Date().toISOString();

            const response = await request(app)
                .get('/api/reports/generate')
                .query({ startDate, endDate })
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.report.period.start).toBe(startDate);
            expect(response.body.report.period.end).toBe(endDate);
        });
    });

    // Delete Test Tests
    describe('DELETE /api/tests/:id', () => {
        it('should return 404 for non-existent test', async () => {
            const response = await request(app)
                .delete('/api/tests/non_existent_id')
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'Test not found');
        });
    });

    // Get Test by ID Tests
    describe('GET /api/tests/:id', () => {
        it('should return 404 for non-existent test', async () => {
            const response = await request(app)
                .get('/api/tests/non_existent_id')
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'Test not found');
        });
    });
});

describe('ThreatTest Frontend Tests', () => {
    describe('Static Files', () => {
        it('should serve index.html on root', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.text).toContain('ThreatTest');
        });
    });
});

describe('API Response Formats', () => {
    it('all responses should have consistent structure', async () => {
        const testEndpoints = [
            { method: 'get', path: '/api/health' },
            { method: 'get', path: '/api/tests' },
            { method: 'get', path: '/api/stats' }
        ];

        for (const endpoint of testEndpoints) {
            const response = await request(app)[endpoint.method](endpoint.path);
            
            // All endpoints should return JSON
            expect(response.type).toBe('application/json');
            
            // Most endpoints return success/message properties
            if (endpoint.path !== '/api/health') {
                expect(response.body).toHaveProperty('success');
            }
        }
    });
});

describe('Error Handling', () => {
    it('should handle invalid JSON gracefully', async () => {
        const response = await request(app)
            .post('/api/tests/url')
            .set('Content-Type', 'application/json')
            .send('invalid json');
        
        // Should return 400 or 500 error
        expect([400, 413]).toContain(response.status);
    });

    it('should return 404 for unknown endpoints', async () => {
        const response = await request(app)
            .get('/api/unknown-endpoint')
            .expect(404);
    });
});
