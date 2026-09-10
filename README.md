# jellyfin-weblibrary
<h1><b>A simple web-based library for browsing your Jellyfin movies and series.</b></h1>

<img width="1458" height="823" alt="image" src="https://github.com/user-attachments/assets/5fac61af-2722-48a4-a89d-4d85015b8278" />

<h2>Comes with alphabetical search / search field / genre filtering / IMDB & CSFD buttons / Jellyfin 12 API support</h2>

Jellyfin-weblibrary is using Jellyfin & IMDB API key which you have to enter in the .env file

<h3>Configuration steps:</h3>

Jellyfin WebLibrary
===================

Docker
------

The easiest way to run Jellyfin WebLibrary is with Docker.

Environment variables
---------------------

JELLYFIN_URL
    URL of your Jellyfin server.

JELLYFIN_API_KEY
    Jellyfin API key/token.

TMDB_API_KEY
    TMDB API key.

PORT
    Web server port. Default: 3002.

Example
-------

Create a .env file:

JELLYFIN_URL=http://your-jellyfin-server:8096
JELLYFIN_API_KEY=your_api_key
TMDB_API_KEY=your_tmdb_api_key
PORT=3002

Then run:

docker compose up -d --build

The application will be available at:

http://YOUR_SERVER_IP:3002

Configuration
-------------

The Jellyfin URL and API keys are provided through environment
variables and are never hardcoded into the application.

License
-------

AGPL-3.0

Docker-compose
-------
```
services:
  jellyfin-weblibrary:
    build: .
    container_name: jellyfin-weblibrary

    ports:
      - "3002:3002"

    environment:
      JELLYFIN_URL: ${JELLYFIN_URL}
      JELLYFIN_API_KEY: ${JELLYFIN_API_KEY}
      TMDB_API_KEY: ${TMDB_API_KEY}
      PORT: 3002

    restart: unless-stopped
```
