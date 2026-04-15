# Private Live Stream Relay Panel

A complete web application to run a private HLS live stream relay from authorized sources using FFmpeg, NestJS, and Nuxt 3.

## Restrictions
This system is strictly designed for **authorized / user-owned / licensed stream sources** only. It does not contain bypasses for DRM, geo-restrictions, or protections.

## Features
- Secure admin panel 
- One-click FFmpeg process relay
- Automatic HLS segment generation
- Real-time WebSocket logs and status updates
- Built-in video player using HLS.js

## Project Structure
- `backend/`: NestJS backend. Manages the database, JWT auth, FFMpeg child process spawning, and WebSockets.
- `frontend/`: Nuxt 3 application with SPA mode. Provides `/admin` panel and public `/watch` page.
- `docker-compose.yml`: For deploying everything including Nginx, Backend, Frontend, and PostgreSQL.
- `nginx/nginx.conf`: Serves static HLS files securely and reverse-proxies frontend and backend.

## Deployment to Coolify

1. Connect your server to Coolify.
2. Add a new **Docker Compose** resource.
3. Paste the contents of `docker-compose.yml` into the configuration.
4. Add the environment variables specified in `.env.example` to your Coolify environment tab. **Be sure to set valid `ADMIN_EMAIL` and `ADMIN_PASSWORD`**.
5. Deploy the resource. Coolify will map the Nginx container to the domain you setup.
6. The public HLS feed will be available at `<domain>/hls/index.m3u8`.
7. Watch the stream at `<domain>/watch`.

## Admin Usage
- Navigate to `<domain>/login`.
- Login with the credentials defined in the `.env` file (which seeds the DB on first start).
- In the dashboard, paste your active HTTP/HTTPS M3U8/RTMP source.
- Click "Save & Restart Relay".
- Check the console for logs and verify the public watch page.
