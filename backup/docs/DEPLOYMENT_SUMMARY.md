# Kan Project Deployment Summary

## 🎯 Configuration Complete

Your Kan project is now configured for deployment to **projex.selfmaxing.io** (178.128.128.110)

### ✅ Files Created

1. **`ecosystem.config.js`** - PM2 process configuration
2. **`nginx-projex.conf`** - Nginx reverse proxy configuration
3. **`setup-pm2-nginx.sh`** - Automated deployment script
4. **`setup-env.sh`** - Environment variables setup script
5. **`DEPLOYMENT.md`** - Comprehensive deployment guide
6. **`.env`** - Environment variables (with backup of existing file)

---

## 🚀 Quick Deployment Steps

### Step 1: Build and Start the Application
```bash
cd /home/yamz/sites/kan
./setup-pm2-nginx.sh
```

This script will:
- Install dependencies
- Build the Next.js application
- Start the PM2 service
- Display next steps for Nginx and SSL

### Step 2: Configure Nginx (requires sudo)
```bash
sudo cp /home/yamz/sites/kan/nginx-projex.conf /etc/nginx/sites-available/projex.selfmaxing.io
sudo ln -sf /etc/nginx/sites-available/projex.selfmaxing.io /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 3: Set Up SSL Certificate
```bash
sudo certbot --nginx -d projex.selfmaxing.io
```

### Step 4: Configure DNS
Add an A record in your DNS provider for selfmaxing.io:
- **Type**: A
- **Name**: projex
- **Value**: 178.128.128.110
- **TTL**: 3600 (or your preferred value)

---

## 📋 Manual Deployment (Alternative)

If you prefer manual steps:

### 1. Install Dependencies
```bash
cd /home/yamz/sites/kan
pnpm install
```

### 2. Build the Application
```bash
cd apps/web
pnpm build
```

### 3. Start with PM2
```bash
cd /home/yamz/sites/kan
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Configure Nginx
```bash
sudo cp nginx-projex.conf /etc/nginx/sites-available/projex.selfmaxing.io
sudo ln -sf /etc/nginx/sites-available/projex.selfmaxing.io /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Set Up SSL
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d projex.selfmaxing.io
```

---

## 🔧 Configuration Details

### Application Settings
- **Port**: 3000 (internal)
- **Process Name**: kan-projex
- **Working Directory**: /home/yamz/sites/kan/apps/web
- **Log Files**: /home/yamz/sites/kan/logs/

### Nginx Settings
- **Domain**: projex.selfmaxing.io
- **Proxy**: http://127.0.0.1:3000
- **SSL**: Configured for Let's Encrypt
- **Max Upload Size**: 50MB

### Environment Variables
Key variables set in `.env`:
- `NEXT_PUBLIC_BASE_URL=https://projex.selfmaxing.io`
- `BETTER_AUTH_SECRET=<generated>`
- `NEXT_PUBLIC_DISABLE_EMAIL=true`
- `NEXT_PUBLIC_ALLOW_CREDENTIALS=true`

---

## 🔍 Verification Steps

### 1. Check PM2 Status
```bash
pm2 status
```
You should see `kan-projex` with status `online`.

### 2. Check Application Response
```bash
curl http://localhost:3000
```
Should return HTML content.

### 3. Check Nginx Configuration
```bash
sudo nginx -t
```
Should show "syntax is ok" and "test is successful".

### 4. Check DNS Resolution
```bash
dig projex.selfmaxing.io
```
Should return 178.128.128.110.

### 5. Check HTTPS Access
```bash
curl -I https://projex.selfmaxing.io
```
Should return 200 OK (after SSL is configured).

---

## 📊 Monitoring Commands

### PM2 Monitoring
```bash
pm2 status                    # Service status
pm2 logs kan-projex           # View logs
pm2 monit                     # Real-time monitoring
pm2 describe kan-projex       # Detailed information
```

### System Resources
```bash
pm2 monit                     # CPU and memory usage
htop                          # System resources
df -h                         # Disk usage
```

### Nginx Monitoring
```bash
sudo tail -f /var/log/nginx/projex.selfmaxing.io-access.log
sudo tail -f /var/log/nginx/projex.selfmaxing.io-error.log
```

---

## 🔄 Common Operations

### Restart Application
```bash
pm2 restart kan-projex
```

### Update Application
```bash
cd /home/yamz/sites/kan
git pull
pnpm install
cd apps/web
pnpm build
pm2 restart kan-projex
```

### View Logs
```bash
pm2 logs kan-projex --lines 100
```

### Stop Application
```bash
pm2 stop kan-projex
```

### Delete Application from PM2
```bash
pm2 delete kan-projex
```

---

## 🛡️ Security Checklist

- [ ] DNS A record configured and propagated
- [ ] SSL certificate installed and auto-renewal enabled
- [ ] Firewall configured (allow ports 80, 443)
- [ ] Strong `BETTER_AUTH_SECRET` generated
- [ ] Database secured (if using external database)
- [ ] Regular backups configured
- [ ] PM2 startup script enabled
- [ ] Nginx security headers configured
- [ ] Application logs monitored

---

## 🐛 Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs kan-projex

# Check if port is available
sudo lsof -i :3000

# Restart PM2
pm2 restart kan-projex
```

### Nginx Errors
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues
```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### DNS Not Resolving
```bash
# Check DNS propagation
dig projex.selfmaxing.io
nslookup projex.selfmaxing.io

# Wait for DNS propagation (can take up to 48 hours)
```

---

## 📞 Support Resources

- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **Kan Documentation**: https://docs.kan.bn/

---

## 📝 Notes

- The application uses SQLite by default. For production, consider PostgreSQL.
- Email features are disabled by default. Configure SMTP to enable them.
- SSL certificates auto-renew via certbot (check with `sudo certbot renew --dry-run`).
- PM2 will automatically restart the application on crashes or server reboots.
- Nginx logs are rotated automatically by logrotate.

---

**Generated**: $(date)
**Server IP**: 178.128.128.110
**Domain**: projex.selfmaxing.io
**Application Port**: 3000
