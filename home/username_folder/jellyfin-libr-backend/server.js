require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Jellyfin configuration
const JELLYFIN_URL = 'http://192.168.0.36:8097';
const API_KEY = process.env.JELLYFIN_API_KEY;

app.use(cors());
app.use(express.json());

// Optional: serve static files if you have any (logo, css, etc.)
// app.use(express.static('public'));

/**
 * Get movies or series
 * Example: /api/items?type=Movie
 */
app.get('/api/items', async (req, res) => {
    try {
        const type = req.query.type || 'Movie';
        const url = `${JELLYFIN_URL}/Items?IncludeItemTypes=${type}&Recursive=true&SortBy=SortName`;

        const response = await fetch(url, {
            headers: { 'X-Emby-Token': API_KEY }
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Items fetch error:', response.status, text);
            return res.status(response.status).send(text);
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Items error:', err);
        res.status(500).send('Backend error');
    }
});

/**
 * Image proxy with aggressive caching
 * Streams images from Jellyfin + strong browser/CDN caching
 */
app.get('/api/image/:id/:type', async (req, res) => {
    try {
        const { id, type } = req.params;
        const imageUrl = `${JELLYFIN_URL}/Items/${id}/Images/${type}`;

        const response = await fetch(imageUrl, {
            headers: { 'X-Emby-Token': API_KEY }
        });

        if (!response.ok) {
            console.error('Image fetch error:', response.status, await response.text());
            return res.status(404).send('Image not found');
        }

        // Aggressive caching settings - perfect for movie/series posters
        const cacheSeconds = 90 * 24 * 60 * 60; // 90 days

        res.set({
            'Content-Type': response.headers.get('content-type') || 'image/jpeg',
            'Cache-Control': `public, max-age=${cacheSeconds}, immutable`,
            'Expires': new Date(Date.now() + cacheSeconds * 1000).toUTCString(),
        });

        // Stream the image directly (very memory efficient)
        response.body.pipe(res);

    } catch (err) {
        console.error('Image proxy error:', err);
        res.status(500).send('Image proxy error');
    }
});

app.listen(PORT, () => {
    console.log(`✅ Jellyfin backend running at http://localhost:${PORT}`);
});