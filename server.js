const express = require('express');
const { createClient } = require('redis');
const client = require('prom-client');
require('dotenv').config(); // Optional if you want environment variables later

const app = express();
const PORT = 3000;

// Redis setup
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;

const redisClient = createClient({
    url: `redis://${redisHost}:${redisPort}`
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Prometheus metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const requestCounter = new client.Counter({
    name: 'api_requests_total',
    help: 'Total number of API requests',
    labelNames: ['method', 'route', 'status_code'],
});

// Connect to Redis
(async () => {
    await redisClient.connect();
})();

// Main API with Rate Limiting
app.get('/api/data', async (req, res) => {
    const userId = req.ip; // Identify users by IP

    const rateLimit = 5; // Max 5 requests
    const windowSeconds = 60; // per 60 seconds window

    let requests = await redisClient.get(userId);

    if (requests) {
        requests = parseInt(requests);

        if (requests >= rateLimit) {
            requestCounter.inc({ method: req.method, route: '/api/data', status_code: 429 });

            const ttl = await redisClient.ttl(userId); // How many seconds until reset

            return res.status(429)
                .set('Retry-After', ttl)
                .send(`❌ Rate limit exceeded. Please wait ${ttl} seconds and try again.`);
        }

        await redisClient.incr(userId);
    } else {
        await redisClient.set(userId, 1, { EX: windowSeconds });
    }

    const ttl = await redisClient.ttl(userId);
    const remaining = rateLimit - (parseInt(await redisClient.get(userId)) || 0);

    requestCounter.inc({ method: req.method, route: '/api/data', status_code: 200 });

    res.status(200).send(
        `✅ Access granted\n` +
        `User: guest\n` +
        `Remaining Requests: ${remaining > 0 ? remaining : 0}\n` +
        `Reset In: ${ttl} seconds`
    );
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});