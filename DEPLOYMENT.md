# Kan Project Deployment Guide

## Overview
- **Domain**: projex.selfmaxing.io
- **Server IP**: 178.128.128.110
- **Application Port**: 3000
- **Process Manager**: PM2
- **Web Server**: Nginx

## Quick Start

### 1. Run the Setup Script
```bash
cd /home/yamz/sites/kan
./setup-pm2-nginx.sh
```

This will:
- Build the Next.js application
- Start the PM2 service
- Display instructions for Nginx and SSL setup

### 2. Configure Nginx (requires sudo)
```bash
sudo cp /home/yamz/sites/kan/nginx-projex.conf /etc/nginx/sites-available/projex.selfmaxing.io
sudo ln -sf /etc/nginx/sites-available/projex.selfmaxing.io /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Set Up SSL Certificate
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d projex.selfmaxing.io
```

### 4. Configure DNS
Add an A record in your DNS provider:
- **Type**: A
- **Name**: projex
- **Value**: 178.128.128.110
- **TTL**: 3600

### 5. Update Environment Variables
Edit `/home/yamz/sites/kan/.env` and set:
```
NEXT_PUBLIC_BASE_URL=https://projex.selfmaxing.io
```

Then restart the service:
```bash
pm2 restart kan-projex
```

## PM2 Commands

### Service Management
```bash
pm2 start ecosystem.config.js    # Start the service
pm2 restart kan-projex            # Restart the service
pm2 stop kan-projex               # Stop the service
pm2 delete kan-projex             # Delete the service
pm2 reload kan-projex             # Reload with zero downtime
```

### Monitoring
```bash
pm2 status                        # Check service status
pm2 logs kan-projex               # View logs
pm2 logs kan-projex --lines 100   # View last 100 lines
pm2 monit                         # Real-time monitoring
pm2 describe kan-projex           # Detailed info
```

### Persistence
```bash
pm2 save                          # Save current process list
pm2 startup                       # Generate startup script
pm2 unstartup                     # Remove startup script
```

## Nginx Commands

```bash
sudo nginx -t                     # Test configuration
sudo systemctl status nginx       # Check Nginx status
sudo systemctl reload nginx       # Reload configuration
sudo systemctl restart nginx      # Restart Nginx
sudo tail -f /var/log/nginx/projex.selfmaxing.io-access.log  # View access logs
sudo tail -f /var/log/nginx/projex.selfmaxing.io-error.log   # View error logs
```

## Troubleshooting

### Check if the app is running
```bash
pm2 status
curl http://localhost:3000
```

### Check Nginx proxy
```bash
sudo nginx -t
curl -I http://projex.selfmaxing.io
```

### View application logs
```bash
pm2 logs kan-projex
# or
tail -f /home/yamz/sites/kan/logs/pm2-error.log
tail -f /home/yamz/sites/kan/logs/pm2-out.log
```

### Restart everything
```bash
pm2 restart kan-projex
sudo systemctl reload nginx
```

### Check port availability
```bash
sudo lsof -i :3000
sudo netstat -tulpn | grep :3000
```

## Updating the Application

```bash
cd /home/yamz/sites/kan
git pull
pnpm install
cd apps/web
pnpm build
pm2 restart kan-projex
```

## File Locations

- **PM2 Config**: `/home/yamz/sites/kan/ecosystem.config.js`
- **Nginx Config**: `/etc/nginx/sites-available/projex.selfmaxing.io`
- **Application Logs**: `/home/yamz/sites/kan/logs/`
- **Nginx Logs**: `/var/log/nginx/projex.selfmaxing.io-*.log`
- **SSL Certificates**: `/etc/letsencrypt/live/projex.selfmaxing.io/`

## Security Checklist

- [ ] DNS A record configured
- [ ] SSL certificate installed
- [ ] Firewall allows ports 80 and 443
- [ ] Environment variables properly set
- [ ] Database connection secured
- [ ] BETTER_AUTH_SECRET is strong and unique
- [ ] PM2 startup script configured
- [ ] Regular backups configured

## Performance Optimization

### Enable PM2 Cluster Mode (optional)
Edit `ecosystem.config.js` and change:
```javascript
instances: 'max',  // Use all CPU cores
exec_mode: 'cluster'
```

### Monitor Memory Usage
```bash
pm2 monit
```

If memory usage is high, adjust `max_memory_restart` in `ecosystem.config.js`.

## Support

For issues, check:
1. PM2 logs: `pm2 logs kan-projex`
2. Nginx logs: `sudo tail -f /var/log/nginx/projex.selfmaxing.io-error.log`
3. Application logs: `tail -f /home/yamz/sites/kan/logs/pm2-error.log`
