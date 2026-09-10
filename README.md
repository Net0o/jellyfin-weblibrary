# Jellyfin-WebLibrary
<h1><b>A simple web-based library checker for your Jellyfin movies and series.</b></h1>

<img width="1458" height="823" alt="image" src="https://github.com/user-attachments/assets/5fac61af-2722-48a4-a89d-4d85015b8278" />



<b>Supports Jellyfin 12</b>

It provides a quick way to check and browse your Jellyfin library with:

* Alphabetical browsing
* Search
* Genre filtering
* IMDb and CSFD links
* Movie and series information
* Jellyfin library integration

## Requirements

* A running Jellyfin server
* A Jellyfin API key
* A TMDB API key
* Docker

## Docker

The application runs as a single Docker container with the frontend and backend included.

### Environment variables

| Variable           | Description                       |
| ------------------ | --------------------------------- |
| `JELLYFIN_URL`     | URL of your Jellyfin server       |
| `JELLYFIN_API_KEY` | Jellyfin API key                  |
| `TMDB_API_KEY`     | TMDB API key                      |
| `PORT`             | Web server port (default: `3002`) |

### Docker Compose

Example:

```yaml
services:
  jellyfin-weblibrary:
    build:
      context: https://github.com/Net0o/jellyfin-weblibrary.git
      dockerfile: Dockerfile

    container_name: jellyfin-weblibrary

    ports:
      - "3002:3002"

    environment:
      JELLYFIN_URL: "http://your-jellyfin-server-ip:8096"
      JELLYFIN_API_KEY: "your-jellyfin-api-key"
      TMDB_API_KEY: "your-tmdb-api-key"
      PORT: "3002"

    restart: unless-stopped
```

After starting the container, open:

```text
http://YOUR_SERVER_IP:3002
```

The host port can be changed if `3002` is already in use. The application itself listens on port `3002` inside the container.

## License

AGPL-3.0
