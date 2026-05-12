# Nexam – Deployment Guide (mddmcollege.com)

## Stack
- **Frontend**: React (Create React App) — built and served as static files by Express
- **Backend**: Node.js + Express + MS SQL Server
- **Process Manager**: PM2
- **Reverse Proxy**: Nginx + Let's Encrypt (SSL)

---

## Prerequisites (on your Linux VPS)

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt-get install -y nginx

# Install Certbot for SSL
sudo apt-get install -y certbot python3-certbot-nginx
```

---

## 1. Clone the Repository

```bash
cd /var/www
git clone https://github.com/mohityadav-git/testPortal.git nexam
cd nexam
```

---

## 2. Configure Server Environment

```bash
cd /var/www/nexam/server
cp .env.example .env
nano .env
```

Fill in your values:
```
DB_SERVER=93.127.199.57
DB_NAME=NewSchooolManagement
DB_USER=sa
DB_PASSWORD=GoldenGate@2025
DB_TRUSTED_CONNECTION=false
PORT=5000
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
```

---

## 3. Install Server Dependencies

```bash
cd /var/www/nexam/server
npm install --omit=dev
```

---

## 4. Build the React Frontend

```bash
cd /var/www/nexam/school-weekly-test
npm install
npm run build
```

This uses `.env.production` which sets `REACT_APP_API_URL=https://mddmcollege.com`.

---

## 5. Copy React Build into Server

```bash
# The Express server serves the React app from server/public
mkdir -p /var/www/nexam/server/public
cp -r /var/www/nexam/school-weekly-test/build/. /var/www/nexam/server/public/
```

---

## 6. Create Uploads & Logs Directories

```bash
mkdir -p /var/www/nexam/server/uploads
mkdir -p /var/www/nexam/server/logs
```

---

## 7. Start with PM2

```bash
cd /var/www/nexam/server
pm2 start ecosystem.config.js --env production
pm2 save                        # Save so it restarts after reboot
pm2 startup                     # Follow the printed command to enable autostart
```

Useful PM2 commands:
```bash
pm2 status                      # Check if running
pm2 logs nexam-server           # View live logs
pm2 restart nexam-server        # Restart after code changes
pm2 stop nexam-server           # Stop the server
```

---

## 8. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/mddmcollege.com
```

Paste:
```nginx
server {
    listen 80;
    server_name mddmcollege.com www.mddmcollege.com;

    # Max upload size (for question images / study materials)
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/mddmcollege.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 9. Enable SSL (HTTPS)

```bash
sudo certbot --nginx -d mddmcollege.com -d www.mddmcollege.com
```

Certbot will automatically update your Nginx config to use HTTPS and set up auto-renewal.

---

## Updating the App (After Code Changes)

```bash
cd /var/www/nexam

# Pull latest code
git pull origin main

# Rebuild the frontend
cd school-weekly-test && npm install && npm run build
cp -r build/. ../server/public/

# Restart the server
cd ../server && npm install --omit=dev
pm2 restart nexam-server
```

---

## Checking the Server is Healthy

```bash
curl http://localhost:5000/health
# Expected: {"status":"ok"}
```
