# 🎉 Deployment Complete!

## ✅ Your Kan Application is Live!

**URL**: https://projex.selfmaxing.io

---

## Deployment Summary

### ✅ All Steps Completed

1. **Application Built** ✓
   - Next.js build successful
   - All Lingui i18n removed
   - Template literal issues fixed

2. **PM2 Service Running** ✓
   - Service: `kan-projex`
   - Status: Online
   - Port: 3000
   - Auto-restart: Enabled

3. **Nginx Configured** ✓
   - Reverse proxy configured
   - HTTP to HTTPS redirect enabled
   - Static file caching enabled

4. **DNS Configured** ✓
   - Domain: projex.selfmaxing.io
   - IP: 178.128.128.110
   - Status: Resolving correctly

5. **SSL Certificate Installed** ✓
   - Provider: Let's Encrypt
   - Expires: 2026-02-09 (89 days)
   - Auto-renewal: Enabled
   - HTTPS: Working ✓

---

## Access Information

### Production URL
🌐 **https://projex.selfmaxing.io**

### Server Details
- **Server IP**: 178.128.128.110
- **Application Port**: 3000 (internal)
- **Web Server**: Nginx 1.26.3
- **Process Manager**: PM2

---

## Service Management

### PM2 Commands
```bash
pm2 status                    # Check service status
pm2 logs kan-projex           # View application logs
pm2 restart kan-projex        # Restart application
pm2 monit                     # Monitor resources
pm2 stop kan-projex           # Stop application
pm2 start kan-projex          # Start application
```

### Nginx Commands
```bash
sudo systemctl status nginx   # Check Nginx status
sudo systemctl reload nginx   # Reload configuration
sudo systemctl restart nginx  # Restart Nginx
sudo nginx -t                 # Test configuration
```

### SSL Certificate Management
```bash
sudo certbot certificates     # View certificate info
sudo certbot renew           # Manually renew certificates
sudo certbot renew --dry-run # Test renewal process
```

---

## Monitoring & Logs

### Application Logs
```bash
# PM2 logs
pm2 logs kan-projex
pm2 logs kan-projex --lines 100

# Application log files
tail -f /home/yamz/sites/kan/logs/pm2-out.log
tail -f /home/yamz/sites/kan/logs/pm2-error.log
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/projex.selfmaxing.io-access.log

# Error logs
sudo tail -f /var/log/nginx/projex.selfmaxing.io-error.log
```

### System Resources
```bash
pm2 monit                     # PM2 monitoring
htop                          # System resources
df -h                         # Disk usage
free -h                       # Memory usage
```

---

## Updating the Application

```bash
# Navigate to project directory
cd /home/yamz/sites/kan

# Pull latest changes
git pull

# Install dependencies
pnpm install

# Build application
cd apps/web
pnpm build

# Restart PM2 service
cd /home/yamz/sites/kan
pm2 restart kan-projex

# Check status
pm2 status
pm2 logs kan-projex --lines 50
```

---

## Configuration Files

### Key Files
- **PM2 Config**: `/home/yamz/sites/kan/ecosystem.config.js`
- **Nginx Config**: `/etc/nginx/sites-available/projex.selfmaxing.io`
- **Environment**: `/home/yamz/sites/kan/.env`
- **SSL Certificates**: `/etc/letsencrypt/live/projex.selfmaxing.io/`

### Environment Variables
```bash
NEXT_PUBLIC_BASE_URL=https://projex.selfmaxing.io
BETTER_AUTH_SECRET=<generated>
NEXT_PUBLIC_DISABLE_EMAIL=true
NEXT_PUBLIC_ALLOW_CREDENTIALS=true
```

---

## Security Features

✅ **SSL/TLS Encryption** - Let's Encrypt certificate
✅ **HTTPS Redirect** - All HTTP traffic redirected to HTTPS
✅ **Security Headers** - X-Frame-Options, X-Content-Type-Options, etc.
✅ **Auto-renewal** - SSL certificate renews automatically
✅ **Process Monitoring** - PM2 auto-restarts on crashes

---

## Backup & Maintenance

### Database Backup (if using PostgreSQL)
```bash
# Backup database
pg_dump -U username -d kan > backup_$(date +%Y%m%d).sql

# Restore database
psql -U username -d kan < backup_20251111.sql
```

### Application Backup
```bash
# Backup application files
tar -czf kan_backup_$(date +%Y%m%d).tar.gz /home/yamz/sites/kan
```

### SSL Certificate Auto-Renewal
Certbot automatically renews certificates. Check renewal:
```bash
sudo certbot renew --dry-run
```

---

## Troubleshooting

### Application Not Responding
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs kan-projex --lines 50

# Restart application
pm2 restart kan-projex
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Force renewal (if needed)
sudo certbot renew --force-renewal
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Port Already in Use
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>

# Restart PM2
pm2 restart kan-projex
```

---

## Performance Optimization

### Enable PM2 Cluster Mode (Optional)
For better performance on multi-core systems:

Edit `/home/yamz/sites/kan/ecosystem.config.js`:
```javascript
instances: 'max',  // Use all CPU cores
exec_mode: 'cluster'
```

Then restart:
```bash
pm2 restart kan-projex
```

### Monitor Performance
```bash
pm2 monit                     # Real-time monitoring
pm2 describe kan-projex       # Detailed info
```

---

## Support & Documentation

- **Kan Documentation**: https://docs.kan.bn/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/

---

## Deployment Information

- **Deployed**: November 11, 2025
- **Domain**: projex.selfmaxing.io
- **Server IP**: 178.128.128.110
- **SSL Expires**: February 9, 2026
- **Status**: ✅ **LIVE AND OPERATIONAL**

---

🎉 **Congratulations! Your Kan application is now live and accessible at:**

## 🌐 https://projex.selfmaxing.io

---

**Note**: The application will automatically restart on server reboot thanks to PM2's startup configuration. SSL certificates will auto-renew 30 days before expiration.
