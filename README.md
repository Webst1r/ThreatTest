# 🛡️ ThreatTest - Application Resilience Testing Platform

A comprehensive platform for testing application resilience, performance, and security through automated load testing, failure scenarios, and continuous monitoring.

## ✨ Features

### Core Testing Capabilities
- **URL Testing**: Quick endpoint health checks and response validation
- **Load Testing**: Concurrent request simulation with configurable parameters
- **Failure Scenarios**: Network latency, timeouts, error rates, and high load testing
- **Security Scanning**: Basic vulnerability detection and security header validation

### Enhanced UI/UX
- ✅ **Minimizable FAB Menu**: Floating action buttons that don't block content
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile devices
- ✅ **Real-time Updates**: Live monitoring of test execution
- ✅ **Collapsible Sidebar**: Better screen space management
- ✅ **Beautiful Animations**: Smooth transitions and engaging interactions

### Analytics & Reporting
- Real-time test statistics
- Response time analytics
- Success/failure rate tracking
- Exportable test reports

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git

### Installation

1. **Clone or download the project**
```bash
# If using git
git clone <your-repo-url>
cd threattest

# Or extract the files if downloaded
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Start the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

5. **Access the application**
Open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Project Structure

```
threattest/
├── server.js              # Backend API server
├── package.json           # Node.js dependencies
├── .env.example          # Environment configuration template
├── public/               # Frontend files
│   └── index.html        # Main application UI
├── docs/                 # Documentation
└── README.md            # This file
```

## 🔌 API Endpoints

### Health Check
```http
GET /api/health
```

### Test Management
```http
GET    /api/tests           # Get all tests
GET    /api/tests/:id       # Get specific test
DELETE /api/tests/:id       # Delete test
```

### Test Execution
```http
POST /api/tests/url         # Run URL test
POST /api/tests/load        # Run load test
POST /api/tests/failure     # Run failure scenario
```

### Statistics & Reports
```http
GET /api/stats              # Get test statistics
GET /api/reports/generate   # Generate report
```

### Security
```http
POST /api/security/scan     # Run security scan
```

## 📊 Usage Examples

### Run a Quick URL Test
```javascript
fetch('http://localhost:3000/api/tests/url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Homepage Test',
    url: 'https://example.com',
    method: 'GET',
    timeout: 5000
  })
})
```

### Run a Load Test
```javascript
fetch('http://localhost:3000/api/tests/load', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://api.example.com/endpoint',
    requests: 100,
    concurrent: 10,
    timeout: 5000
  })
})
```

## 🚢 Deployment Guide

### Option 1: Deploy to Heroku

1. **Create a Heroku account** at https://heroku.com

2. **Install Heroku CLI**
```bash
npm install -g heroku
```

3. **Login to Heroku**
```bash
heroku login
```

4. **Create a new Heroku app**
```bash
heroku create your-app-name
```

5. **Deploy**
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

6. **Set environment variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=3000
```

7. **Open your app**
```bash
heroku open
```

### Option 2: Deploy to Railway

1. **Create account** at https://railway.app

2. **Click "New Project"** → "Deploy from GitHub repo"

3. **Select your repository**

4. **Configure**:
   - Build Command: `npm install`
   - Start Command: `npm start`

5. **Add environment variables** in the Railway dashboard

6. **Deploy** - Railway will automatically deploy your app

### Option 3: Deploy to Render

1. **Create account** at https://render.com

2. **New Web Service** → Connect your repository

3. **Configure**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free or Starter

4. **Add environment variables**

5. **Create Web Service** - Automatic deployment

### Option 4: Deploy to DigitalOcean App Platform

1. **Create account** at https://digitalocean.com

2. **Apps** → **Create App**

3. **Connect GitHub** repository

4. **Configure**:
   - Run Command: `npm start`
   - Environment: Node.js

5. **Launch App**

### Option 5: VPS Deployment (Ubuntu)

1. **SSH into your server**
```bash
ssh user@your-server-ip
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PM2** (Process Manager)
```bash
sudo npm install -g pm2
```

4. **Clone your repository**
```bash
git clone <your-repo-url>
cd threattest
```

5. **Install dependencies**
```bash
npm install --production
```

6. **Start with PM2**
```bash
pm2 start server.js --name threattest
pm2 save
pm2 startup
```

7. **Setup Nginx** (optional, for domain/SSL)
```bash
sudo apt install nginx
```

Create Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. **Install SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔒 Security Recommendations

### Before Going to Production

1. **Environment Variables**
   - Never commit `.env` file
   - Use secure password/token generation
   - Enable HTTPS in production

2. **Rate Limiting**
```javascript
// Add to server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

3. **Authentication**
```javascript
// Example: Add JWT authentication
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Protect routes
app.use('/api/tests', authMiddleware);
```

4. **Database Integration**
```javascript
// Replace in-memory storage with PostgreSQL/MongoDB
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});
```

## 📈 Next Steps & Enhancements

### Essential Additions

1. **Database Integration**
   - PostgreSQL or MongoDB for persistent storage
   - Test history and analytics
   - User management

2. **Authentication System**
   - User registration/login
   - API key management
   - Role-based access control

3. **Advanced Features**
   - Scheduled tests (cron jobs)
   - Email/Slack notifications
   - Test result comparison
   - Performance trends
   - Custom test scripts
   - API documentation (Swagger)

4. **Monitoring & Logging**
   - Winston for logging
   - Sentry for error tracking
   - Prometheus metrics
   - Grafana dashboards

5. **CI/CD Integration**
   - GitHub Actions
   - Jenkins integration
   - Docker containerization

### Optional Enhancements

1. **WebSocket Support**
   - Real-time test updates
   - Live monitoring dashboard

2. **Multi-tenant Support**
   - Organizations/teams
   - Shared test suites

3. **API Integrations**
   - Slack notifications
   - PagerDuty alerts
   - Datadog integration

## 🛠️ Development

### Running Tests
```bash
npm test
```

### Code Formatting
```bash
npm run format
```

### Building for Production
```bash
# Set NODE_ENV
export NODE_ENV=production

# Optimize and build
npm run build
```

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

**Dependencies not installing**
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**CORS errors**
```bash
# Add your frontend URL to ALLOWED_ORIGINS in .env
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.com
```

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues or questions:
- Create an issue on GitHub
- Email: support@threattest.io (example)

## 🎯 Roadmap

- [ ] Database integration
- [ ] User authentication
- [ ] Scheduled tests
- [ ] Email notifications
- [ ] Docker support
- [ ] Kubernetes deployment
- [ ] API documentation
- [ ] Mobile app
- [ ] Plugin system

---

**Built with ❤️ for developers who care about resilience**
