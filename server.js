// server.js - ThreatTest Backend API
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { performance } = require('perf_hooks');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage (replace with database in production)
let tests = [];
let testResults = [];
let testIdCounter = 1;

// ==================== API ENDPOINTS ====================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Get all tests
app.get('/api/tests', (req, res) => {
    res.json({
        success: true,
        tests: tests,
        total: tests.length
    });
});

// Get test by ID
app.get('/api/tests/:id', (req, res) => {
    const test = tests.find(t => t.id === req.params.id);
    
    if (!test) {
        return res.status(404).json({
            success: false,
            error: 'Test not found'
        });
    }
    
    res.json({
        success: true,
        test: test
    });
});

// Create and run a quick URL test
app.post('/api/tests/url', async (req, res) => {
    const { name, url, method = 'GET', headers = {}, timeout = 5000 } = req.body;
    
    if (!url) {
        return res.status(400).json({
            success: false,
            error: 'URL is required'
        });
    }
    
    const testId = 'test_' + testIdCounter++;
    const test = {
        id: testId,
        name: name || `URL Test - ${url}`,
        url: url,
        method: method,
        type: 'url',
        status: 'running',
        startTime: new Date(),
        requests: 10,
        timeout: timeout,
        passed: 0,
        failed: 0,
        results: []
    };
    
    tests.push(test);
    
    // Run test asynchronously
    runUrlTest(test);
    
    res.json({
        success: true,
        testId: testId,
        message: 'Test started successfully'
    });
});

// Create and run a load test
app.post('/api/tests/load', async (req, res) => {
    const { 
        url, 
        requests = 100, 
        concurrent = 10, 
        timeout = 5000,
        method = 'GET',
        headers = {}
    } = req.body;
    
    if (!url) {
        return res.status(400).json({
            success: false,
            error: 'URL is required'
        });
    }
    
    const testId = 'test_' + testIdCounter++;
    const test = {
        id: testId,
        name: `Load Test - ${url}`,
        url: url,
        method: method,
        type: 'load',
        status: 'running',
        startTime: new Date(),
        requests: requests,
        concurrent: concurrent,
        timeout: timeout,
        passed: 0,
        failed: 0,
        results: [],
        responseTimes: []
    };
    
    tests.push(test);
    
    // Run test asynchronously
    runLoadTest(test);
    
    res.json({
        success: true,
        testId: testId,
        message: 'Load test started successfully'
    });
});

// Run failure scenario test
app.post('/api/tests/failure', async (req, res) => {
    const { type, url, requests = 100 } = req.body;
    
    const scenarios = {
        network: 'Network Latency Test',
        timeout: 'Timeout Handling Test',
        error: 'Error Rate Test',
        load: 'High Load Test'
    };
    
    if (!scenarios[type]) {
        return res.status(400).json({
            success: false,
            error: 'Invalid failure scenario type'
        });
    }
    
    const testId = 'test_' + testIdCounter++;
    const test = {
        id: testId,
        name: scenarios[type],
        url: url || 'chaos-test://' + type,
        method: 'CHAOS',
        type: 'failure',
        scenarioType: type,
        status: 'running',
        startTime: new Date(),
        requests: requests,
        passed: 0,
        failed: 0,
        results: []
    };
    
    tests.push(test);
    
    // Run test asynchronously
    runFailureScenario(test);
    
    res.json({
        success: true,
        testId: testId,
        message: `${scenarios[type]} started successfully`
    });
});

// Run security scan
app.post('/api/security/scan', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({
            success: false,
            error: 'URL is required'
        });
    }
    
    // Simulate security scan
    setTimeout(() => {
        const results = {
            url: url,
            timestamp: new Date(),
            vulnerabilities: [],
            checks: {
                ssl: { passed: true, message: 'Valid SSL certificate' },
                headers: { passed: true, message: 'Security headers present' },
                cors: { passed: true, message: 'CORS configured properly' },
                xss: { passed: true, message: 'No XSS vulnerabilities detected' }
            }
        };
        
        testResults.push({
            type: 'security',
            timestamp: new Date(),
            results: results
        });
    }, 2000);
    
    res.json({
        success: true,
        message: 'Security scan initiated'
    });
});

// Get test statistics
app.get('/api/stats', (req, res) => {
    const totalTests = tests.length;
    const passedTests = tests.filter(t => t.status === 'success').length;
    const failedTests = tests.filter(t => t.status === 'failed').length;
    const runningTests = tests.filter(t => t.status === 'running').length;
    
    let totalRequests = 0;
    let totalResponseTime = 0;
    
    tests.forEach(test => {
        if (test.avgResponse) {
            totalRequests += test.requests;
            totalResponseTime += test.avgResponse * test.requests;
        }
    });
    
    const avgResponse = totalRequests > 0 ? Math.floor(totalResponseTime / totalRequests) : 0;
    
    res.json({
        success: true,
        stats: {
            totalTests,
            passedTests,
            failedTests,
            runningTests,
            avgResponseTime: avgResponse,
            successRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0
        }
    });
});

// Delete test
app.delete('/api/tests/:id', (req, res) => {
    const index = tests.findIndex(t => t.id === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: 'Test not found'
        });
    }
    
    tests.splice(index, 1);
    
    res.json({
        success: true,
        message: 'Test deleted successfully'
    });
});

// Generate report
app.get('/api/reports/generate', (req, res) => {
    const { startDate, endDate } = req.query;
    
    let filteredTests = tests;
    
    if (startDate) {
        filteredTests = filteredTests.filter(t => 
            new Date(t.startTime) >= new Date(startDate)
        );
    }
    
    if (endDate) {
        filteredTests = filteredTests.filter(t => 
            new Date(t.startTime) <= new Date(endDate)
        );
    }
    
    const report = {
        generatedAt: new Date(),
        period: {
            start: startDate || 'All time',
            end: endDate || 'Present'
        },
        summary: {
            totalTests: filteredTests.length,
            passed: filteredTests.filter(t => t.status === 'success').length,
            failed: filteredTests.filter(t => t.status === 'failed').length,
            avgResponseTime: calculateAvgResponseTime(filteredTests)
        },
        tests: filteredTests
    };
    
    res.json({
        success: true,
        report: report
    });
});

// ==================== TEST EXECUTION FUNCTIONS ====================

async function runUrlTest(test) {
    const results = [];
    
    for (let i = 0; i < test.requests; i++) {
        const startTime = performance.now();
        
        try {
            const response = await axios({
                method: test.method,
                url: test.url,
                timeout: test.timeout,
                validateStatus: () => true // Don't throw on any status
            });
            
            const endTime = performance.now();
            const responseTime = Math.floor(endTime - startTime);
            
            const result = {
                requestNumber: i + 1,
                status: response.status,
                responseTime: responseTime,
                success: response.status >= 200 && response.status < 400
            };
            
            results.push(result);
            
            if (result.success) {
                test.passed++;
            } else {
                test.failed++;
            }
            
        } catch (error) {
            const endTime = performance.now();
            const responseTime = Math.floor(endTime - startTime);
            
            results.push({
                requestNumber: i + 1,
                status: 0,
                responseTime: responseTime,
                success: false,
                error: error.message
            });
            
            test.failed++;
        }
    }
    
    test.results = results;
    test.avgResponse = Math.floor(
        results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
    );
    test.status = test.failed === 0 ? 'success' : 'failed';
    test.endTime = new Date();
}

async function runLoadTest(test) {
    const results = [];
    const batchSize = test.concurrent;
    const totalBatches = Math.ceil(test.requests / batchSize);
    
    for (let batch = 0; batch < totalBatches; batch++) {
        const batchPromises = [];
        const requestsInBatch = Math.min(batchSize, test.requests - (batch * batchSize));
        
        for (let i = 0; i < requestsInBatch; i++) {
            const requestNum = batch * batchSize + i + 1;
            
            batchPromises.push(
                (async () => {
                    const startTime = performance.now();
                    
                    try {
                        const response = await axios({
                            method: test.method,
                            url: test.url,
                            timeout: test.timeout,
                            validateStatus: () => true
                        });
                        
                        const endTime = performance.now();
                        const responseTime = Math.floor(endTime - startTime);
                        
                        return {
                            requestNumber: requestNum,
                            status: response.status,
                            responseTime: responseTime,
                            success: response.status >= 200 && response.status < 400
                        };
                        
                    } catch (error) {
                        const endTime = performance.now();
                        const responseTime = Math.floor(endTime - startTime);
                        
                        return {
                            requestNumber: requestNum,
                            status: 0,
                            responseTime: responseTime,
                            success: false,
                            error: error.message
                        };
                    }
                })()
            );
        }
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        batchResults.forEach(result => {
            if (result.success) {
                test.passed++;
            } else {
                test.failed++;
            }
        });
    }
    
    test.results = results;
    test.responseTimes = results.map(r => r.responseTime);
    test.avgResponse = Math.floor(
        results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
    );
    test.minResponse = Math.min(...test.responseTimes);
    test.maxResponse = Math.max(...test.responseTimes);
    test.status = test.failed < (test.requests * 0.1) ? 'success' : 'failed';
    test.endTime = new Date();
}

async function runFailureScenario(test) {
    const results = [];
    
    for (let i = 0; i < test.requests; i++) {
        const startTime = performance.now();
        
        // Simulate different failure scenarios
        let result;
        
        switch (test.scenarioType) {
            case 'network':
                // Simulate network latency
                await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
                result = {
                    requestNumber: i + 1,
                    responseTime: Math.floor(performance.now() - startTime),
                    success: Math.random() > 0.2
                };
                break;
                
            case 'timeout':
                // Simulate timeouts
                const shouldTimeout = Math.random() > 0.7;
                if (shouldTimeout) {
                    await new Promise(resolve => setTimeout(resolve, test.timeout || 5000));
                    result = {
                        requestNumber: i + 1,
                        responseTime: test.timeout,
                        success: false,
                        error: 'Request timeout'
                    };
                } else {
                    result = {
                        requestNumber: i + 1,
                        responseTime: Math.floor(Math.random() * 500),
                        success: true
                    };
                }
                break;
                
            case 'error':
                // Simulate random errors
                const hasError = Math.random() > 0.75;
                result = {
                    requestNumber: i + 1,
                    responseTime: Math.floor(Math.random() * 300),
                    success: !hasError,
                    status: hasError ? 500 : 200
                };
                break;
                
            case 'load':
                // Simulate high load
                const loadDelay = Math.random() * 2000;
                await new Promise(resolve => setTimeout(resolve, loadDelay));
                result = {
                    requestNumber: i + 1,
                    responseTime: Math.floor(loadDelay),
                    success: Math.random() > 0.15
                };
                break;
                
            default:
                result = {
                    requestNumber: i + 1,
                    responseTime: Math.floor(Math.random() * 200),
                    success: true
                };
        }
        
        results.push(result);
        
        if (result.success) {
            test.passed++;
        } else {
            test.failed++;
        }
    }
    
    test.results = results;
    test.avgResponse = Math.floor(
        results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
    );
    test.status = test.failed < (test.requests * 0.2) ? 'success' : 'failed';
    test.endTime = new Date();
}

// Helper function
function calculateAvgResponseTime(tests) {
    let totalRequests = 0;
    let totalResponseTime = 0;
    
    tests.forEach(test => {
        if (test.avgResponse) {
            totalRequests += test.requests;
            totalResponseTime += test.avgResponse * test.requests;
        }
    });
    
    return totalRequests > 0 ? Math.floor(totalResponseTime / totalRequests) : 0;
}

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🛡️  ThreatTest Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

module.exports = app;
