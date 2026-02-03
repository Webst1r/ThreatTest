# 🚀 ThreatTest Deployment Guide

Complete step-by-step guide to deploy ThreatTest to production.

## Table of Contents
1. [Pre-deployment Checklist](#pre-deployment-checklist)
2. [Platform-Specific Guides](#platform-specific-guides)
3. [Database Setup](#database-setup)
4. [SSL Configuration](#ssl-configuration)
5. [Monitoring Setup](#monitoring-setup)
6. [Post-Deployment](#post-deployment)

## Pre-deployment Checklist

### Required Items
- [ ] Node.js application tested locally
- [ ] Environment variables configured
- [ ] Database credentials (if using)
- [ ] Domain name purchased (optional)
- [ ] SSL certificate ready (or Let's Encrypt)
- [ ] Backup strategy planned

### Security Checklist
- [ ] Remove all console.log() in production code
- [ ] Set secure environment variables
- [ ] Enable CORS only for trusted domains
- [ ] Implement rate limiting
- [ ] Add authentication (if needed)
- [ ] Use HTTPS only
- [ ] Set secure headers

### Performance Checklist
- [ ] Enable gzip compression
- [ ] Set up CDN (if needed)
- [ ] Configure caching
- [ ] Optimize database queries
- [ ] Set up monitoring

## Platform-Specific Guides

### 1. Heroku Deployment (Easiest)

**Cost**: Free tier available, $7/month for hobby tier

**Steps**:

1. Install Heroku CLI:
```bash
npm install -g heroku
```

2. Login:
```bash
heroku login
```

3. Create app:
```bash
heroku create threattest-your-name
```

4. Add Procfile:
```bash
echo "web: npm start" > Procfile
```

5. Configure environment:
```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=3000
```

6. Deploy:
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

7. Open app:
```bash
heroku open
```

**Pros**: Easy, automatic SSL, monitoring included
**Cons**: More expensive for production scale

### 2. Railway Deployment (Modern)

**Cost**: $5/month minimum, pay for usage

**Steps**:

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variables in dashboard
7. Deploy automatically

**Pros**: Modern UI, great DX, automatic deployments
**Cons**: Limited free tier

### 3. DigitalOcean App Platform

**Cost**: $5/month for basic tier

**Steps**:

1. Go to https://cloud.digitalocean.com
2. Click "Apps" → "Create App"
3. Connect GitHub repository
4. Configure:
   - Type: Web Service
   - Run Command: `npm start`
   - HTTP Port: 3000
5. Add environment variables
6. Launch app

**Pros**: Affordable, reliable, managed service
**Cons**: Less features than Heroku

### 4. VPS Deployment (Most Control)

**Recommended for**: Production deployments, custom needs

#### Setup Ubuntu 22.04 VPS

1. **Initial Server Setup**:
```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Create non-root user
adduser deployer
usermod -aG sudo deployer

# Setup SSH key authentication
su - deployer
mkdir ~/.ssh
chmod 700 ~/.ssh
```

2. **Install Node.js**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

3. **Install PM2**:
```bash
sudo npm install -g pm2
```

4. **Install Nginx**:
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
```

5. **Setup Application**:
```bash
cd /var/www
sudo mkdir threattest
sudo chown deployer:deployer threattest
cd threattest

# Clone repository
git clone https://github.com/your-username/threattest.git .

# Install dependencies
npm install --production

# Configure environment
cp .env.example .env
nano .env
# Edit with your production values
```

6. **Start with PM2**:
```bash
pm2 start server.js --name threattest
pm2 save
pm2 startup
```

7. **Configure Nginx**:
```bash
sudo nano /etc/nginx/sites-available/threattest
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
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

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/threattest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

8. **Install SSL with Let's Encrypt**:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

9. **Setup Firewall**:
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### 5. Docker Deployment

**For any platform that supports Docker**:

1. **Build image**:
```bash
docker build -t threattest .
```

2. **Run container**:
```bash
docker run -d -p 3000:3000 \
  --name threattest \
  --env-file .env \
  threattest
```

3. **Or use Docker Compose**:
```bash
docker-compose up -d
```

4. **Deploy to Docker Hub**:
```bash
docker tag threattest your-username/threattest:latest
docker push your-username/threattest:latest
```

## Database Setup

### PostgreSQL (Recommended)

1. **Install PostgreSQL**:
```bash
sudo apt install postgresql postgresql-contrib -y
```

2. **Create database**:
```bash
sudo -u postgres psql
CREATE DATABASE threattest;
CREATE USER threattest_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE threattest TO threattest_user;
\q
```

3. **Update application**:
```javascript
// In server.js
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production'
});
```

4. **Create tables**:
```sql
CREATE TABLE tests (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255),
  url TEXT,
  method VARCHAR(10),
  type VARCHAR(50),
  status VARCHAR(20),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  requests INTEGER,
  passed INTEGER,
  failed INTEGER,
  avg_response INTEGER,
  results JSONB
);
```

### MongoDB (Alternative)

1. **Install MongoDB**:
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install
sudo apt update
sudo apt install mongodb-org -y

# Start
sudo systemctl start mongod
sudo systemctl enable mongod
```

2. **Connect in application**:
```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
```

## SSL Configuration

### Using Let's Encrypt (Free)

```bash
sudo certbot --nginx -d your-domain.com
```

### Using Custom Certificate

1. **Place certificate files**:
```bash
sudo mkdir /etc/nginx/ssl
sudo cp your-cert.crt /etc/nginx/ssl/
sudo cp your-key.key /etc/nginx/ssl/
```

2. **Update Nginx config**:
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/your-cert.crt;
    ssl_certificate_key /etc/nginx/ssl/your-key.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # ... rest of config
}
```

## Monitoring Setup

### 1. PM2 Monitoring

```bash
# Basic monitoring
pm2 monit

# Web monitoring
pm2 web

# Plus monitoring (requires account)
pm2 plus
```

### 2. Uptime Monitoring

Use services like:
- **UptimeRobot** (free): https://uptimerobot.com
- **Pingdom**: https://pingdom.com
- **StatusCake**: https://statuscake.com

### 3. Error Tracking

Install Sentry:
```bash
npm install @sentry/node
```

Add to server.js:
```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### 4. Log Management

```bash
# View PM2 logs
pm2 logs

# Setup log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## Post-Deployment

### 1. Verify Deployment

```bash
# Check if app is running
curl http://your-domain.com/api/health

# Check SSL
curl https://your-domain.com/api/health

# Check response time
curl -w "@-" -o /dev/null -s http://your-domain.com <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
      time_redirect:  %{time_redirect}\n
   time_pretransfer:  %{time_pretransfer}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

### 2. Performance Testing

Run tests on your deployed application:
```bash
# Install autocannon for load testing
npm install -g autocannon

# Test your API
autocannon -c 10 -d 5 http://your-domain.com/api/health
```

### 3. Backup Strategy

Set up automated backups:
```bash
# Backup script
#!/bin/bash
BACKUP_DIR="/var/backups/threattest"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
pg_dump threattest > $BACKUP_DIR/db_$DATE.sql

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/threattest

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Schedule with cron:
```bash
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### 4. Setup CI/CD (Optional)

GitHub Actions example:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/threattest
          git pull
          npm install --production
          pm2 restart threattest
```

## Troubleshooting

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs threattest

# Check system resources
free -h
df -h

# Check port availability
sudo netstat -tulpn | grep :3000
```

### SSL Issues
```bash
# Test SSL configuration
sudo nginx -t

# Renew certificate
sudo certbot renew --dry-run
```

### Performance Issues
```bash
# Monitor system
htop

# Check PM2 status
pm2 status

# View detailed metrics
pm2 monit
```

## Cost Estimates

| Platform | Basic | Production |
|----------|-------|------------|
| Heroku | $7/mo | $25-50/mo |
| Railway | $5/mo | $20-40/mo |
| DigitalOcean | $5/mo | $20-40/mo |
| VPS (Linode/DO) | $5/mo | $10-20/mo |

## Support Resources

- Documentation: Your README.md
- Platform docs: Check platform-specific documentation
- Community: Stack Overflow, Reddit
- Professional: Hire DevOps consultant if needed

---

**Remember**: Always test thoroughly before deploying to production!
