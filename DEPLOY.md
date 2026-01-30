# Deployment Guide: ESF Estimator

This guide explains how to deploy your project to your VPS using **Portainer** and **Nginx Proxy Manager**.

## 1. Prerequisites
- Your code is pushed to a remote Git repository (GitHub, GitLab, etc.).
- Ensure your VPS has **Portainer** and **Nginx Proxy Manager** running.

## 2. Project Configuration Changes (Already Applied)
I have prepared your project for Docker deployment:
- **Frontend**: Created `Dockerfile` and `nginx.conf`. Configured API URL to automatically switch to relative path `/api` in production.
- **Backend**: Created `server/Dockerfile`. Configured database path to use a separate volume (`/data/esf.db`).
- **Orchestration**: Created `docker-compose.yml` to link frontend and backend.

## 3. Deploy via Portainer

1.  **Login to Portainer** on your VPS.
2.  Go to **Stacks** (on the left menu) → click **+ Add stack**.
3.  **Name**: `esf-estimator` (or similar).
4.  **Build method**: Select **Repository**.
5.  **Repository URL**: Enter the HTTPS URL of your git repository (e.g., `https://github.com/yourname/esf-estimator.git`).
    *   *Note: If it's a private repo, you'll need to enable "Authentication" and provide your credentials/token.*
6.  **Compose path**: `docker-compose.yml` (Default).
7.  **Environment variables**: You shouldn't need any for the default setup.
8.  Click **Deploy the stack**.

*Portainer will clone your repo, build the Docker images for frontend and backend, and starts them.*

## 4. Configure Nginx Proxy Manager

1.  **Login to Nginx Proxy Manager**.
2.  Click **Proxy Hosts** → **Add Proxy Host**.
3.  **Details Tab**:
    *   **Domain Names**: Enter your desired domain (e.g., `esf.yourdomain.com`).
    *   **Scheme**: `http`
    *   **Forward Host**: Enter your VPS IP Address (e.g., `192.168.1.50` or external IP).
        *   *Tip: Do not use `localhost` or `127.0.0.1` as that refers to the Nginx container itself.*
    *   **Forward Port**: `3080` (This is the port we exposed in `docker-compose.yml`).
    *   **Cache Assets**: Optional (On).
    *   **Block Common Exploits**: On.
4.  **SSL Tab**:
    *   **SSL Certificate**: Request a new SSL Certificate.
    *   **Force SSL**: On.
    *   **HTTP/2 Support**: On.
    *   **Email**: Your email for Let's Encrypt.
    *   **Agree to TOS**: Check.
5.  Click **Save**.

## 5. Verification
- Open your domain (e.g., `https://esf.yourdomain.com`).
- The application should load.
- Try logging in (API check).
    - Default connection to backend is proxied via Nginx at `/api`.
    
## Troubleshooting
- **Frontend not loading?** Check Portainer logs for `esf-frontend`. Ensure port `3080` is open on your VPS firewall.
- **API Errors?** Check Network tab in browser. Requests should go to `https://esf.yourdomain.com/api/...`.
- **Database Persistence**: Your data is stored in a Docker volume named `esf_data`.
