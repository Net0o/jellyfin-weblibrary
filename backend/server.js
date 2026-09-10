require('dotenv').config();

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

const path = require('path');

// Jellyfin configuration
const JELLYFIN_URL = (process.env.JELLYFIN_URL || '').replace(/\/+$/, '');
const API_KEY = process.env.JELLYFIN_API_KEY;

if (!JELLYFIN_URL) {
    console.error('ERROR: JELLYFIN_URL is not set.');
    process.exit(1);
}

if (!API_KEY) {
    console.error('ERROR: JELLYFIN_API_KEY is not set.');
    process.exit(1);
}

// Jellyfin 12 authentication
const JELLYFIN_HEADERS = {
    'Authorization': `MediaBrowser Token="${API_KEY}"`,
    'Accept': 'application/json'
};

app.use(cors());
app.use(express.json());

if (!API_KEY) {
    console.error('ERROR: JELLYFIN_API_KEY is not set in .env');
}

const frontendPath = path.join(__dirname, '..', 'frontend');

app.use(express.static(frontendPath));

/**
 * Generic Jellyfin request helper
 */
async function jellyfinFetch(path, options = {}) {
    const url = `${JELLYFIN_URL}${path}`;

    console.log(`Jellyfin request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
        ...options,
        headers: {
            ...JELLYFIN_HEADERS,
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const text = await response.text();

        console.error(
            `Jellyfin API error ${response.status}:`,
            text
        );

        const error = new Error(
            `Jellyfin returned HTTP ${response.status}`
        );

        error.status = response.status;
        error.body = text;

        throw error;
    }

    return response;
}


/**
 * GET /api/items
 *
 * Example:
 *   /api/items?type=Movie
 *   /api/items?type=Series
 *   /api/items?type=Movie&Genres=Action
 */
app.get('/api/items', async (req, res) => {
    try {
        const type = req.query.type || 'Movie';

        const params = new URLSearchParams();

        // Copy frontend supplied query parameters.
        for (const [key, value] of Object.entries(req.query)) {
            if (key !== 'type') {
                params.set(key, value);
            }
        }

        if (!params.has('IncludeItemTypes')) {
            params.set('IncludeItemTypes', type);
        }

        if (!params.has('Recursive')) {
            params.set('Recursive', 'true');
        }

        if (!params.has('SortBy')) {
            params.set('SortBy', 'SortName');
        }

        if (!params.has('SortOrder')) {
            params.set('SortOrder', 'Ascending');
        }

        // Fields required by the frontend.
        const requiredFields = [
            'DateCreated',
            'ProductionYear',
            'ProviderIds',
            'ImageTags'
        ];

        const existingFields = params.get('Fields')
            ? params.get('Fields')
                .split(',')
                .map(x => x.trim())
                .filter(Boolean)
            : [];

        for (const field of requiredFields) {
            if (!existingFields.includes(field)) {
                existingFields.push(field);
            }
        }

        params.set('Fields', existingFields.join(','));

        const response = await jellyfinFetch(
            `/Items?${params.toString()}`
        );

        const data = await response.json();

        res.json(data);

    } catch (err) {
        console.error('Items error:', err);

        res.status(err.status || 500).json({
            error: 'Failed to fetch items from Jellyfin',
            status: err.status || 500,
            details: err.body || err.message
        });
    }
});


/**
 * GET /api/genres
 *
 * Example:
 *   /api/genres?type=Movie
 *   /api/genres?type=Series
 */
app.get('/api/genres', async (req, res) => {
    try {
        const type = req.query.type || 'Movie';

        /*
         * Jellyfin still exposes GET /Genres in the current API.
         * We ask Jellyfin for the requested item type.
         */
        const params = new URLSearchParams({
            IncludeItemTypes: type,
            Recursive: 'true',
            SortBy: 'SortName',
            SortOrder: 'Ascending'
        });

        const response = await jellyfinFetch(
            `/Genres?${params.toString()}`
        );

        const data = await response.json();

        const genres = (data.Items || [])
            .map(item => item.Name)
            .filter(name => name && name.trim() !== '')
            .sort((a, b) => a.localeCompare(b));

        res.json({ genres });

    } catch (err) {
        console.error('Genres error:', err);

        res.status(err.status || 500).json({
            error: 'Failed to fetch genres from Jellyfin',
            status: err.status || 500,
            details: err.body || err.message
        });
    }
});


/**
 * GET /api/image/:id/:type
 *
 * Example:
 *   /api/image/12345/Primary
 */
app.get('/api/image/:id/:type', async (req, res) => {
    try {
        const { id, type } = req.params;

        const imageUrl =
            `/Items/${encodeURIComponent(id)}/Images/${encodeURIComponent(type)}`;

        const response = await jellyfinFetch(imageUrl);

        const contentType =
            response.headers.get('content-type') || 'image/jpeg';

        const cacheSeconds = 90 * 24 * 60 * 60;

        res.set({
            'Content-Type': contentType,
            'Cache-Control': `public, max-age=${cacheSeconds}, immutable`,
            'Expires': new Date(
                Date.now() + cacheSeconds * 1000
            ).toUTCString()
        });

        response.body.pipe(res);

    } catch (err) {
        console.error('Image error:', err);

        res.status(err.status || 404).send(
            'Image not found'
        );
    }
});


/**
 * Simple health check.
 */
app.get('/api/health', async (req, res) => {
  try {
    const response = await jellyfinFetch('/System/Info');
    const data = await response.json();

    res.json({
      ok: true,
      jellyfinVersion: data.Version,
      serverName: data.ServerName
    });
  } catch (err) {
    res.status(err.status || 500).json({
      ok: false,
      error: err.message,
      details: err.body || null
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Jellyfin backend running on http://localhost:${PORT}`);
  console.log(`Jellyfin URL: ${JELLYFIN_URL}`);
});
