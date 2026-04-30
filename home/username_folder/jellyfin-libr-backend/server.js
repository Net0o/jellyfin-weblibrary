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
 * Supports additional Jellyfin query params like Genres=Action,Adventure
 */
app.get('/api/items', async (req, res) => {
    try {
        const type = req.query.type || 'Movie';
        const params = new URLSearchParams(req.query);

        // Ensure required params are set
        if (!params.has('IncludeItemTypes')) {
            params.set('IncludeItemTypes', type);
        }
        if (!params.has('Recursive')) {
            params.set('Recursive', 'true');
        }
        if (!params.has('SortBy')) {
            params.set('SortBy', 'SortName');
        }

        // Force include DateCreated (needed for "NEW" badge) and ProductionYear (already used)
        let fields = params.get('Fields') || '';
        const requiredFields = 'DateCreated,ProductionYear';
        if (!fields.includes('DateCreated')) {
            fields = fields ? `${fields},${requiredFields}` : requiredFields;
        }
        params.set('Fields', fields);

        const url = `${JELLYFIN_URL}/Items?${params.toString()}`;

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
 * NEW: Get available genres for a given type (Movie / Series)
 * Example: /api/genres?type=Movie
 */
app.get('/api/genres', async (req, res) => {
    try {
        const type = req.query.type || 'Movie';

        const url = `${JELLYFIN_URL}/Genres?` + new URLSearchParams({
            IncludeItemTypes: type,
            Recursive: true
        }).toString();

        const response = await fetch(url, {
            headers: { 'X-Emby-Token': API_KEY }
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Genres fetch error:', response.status, text);
            return res.status(response.status).send(text);
        }

        const data = await response.json();

        // Return simple array of genre names (sorted alphabetically)
        const genres = (data.Items || [])
            .map(item => item.Name)
            .filter(name => name && name.trim() !== '')
            .sort((a, b) => a.localeCompare(b));

        res.json({ genres });
    } catch (err) {
        console.error('Genres endpoint error:', err);
        res.status(500).send('Backend error fetching genres');
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
    console.log(`? Jellyfin backend running at http://localhost:${PORT}`);
});
