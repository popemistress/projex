#!/bin/bash

# Setup script for Kan project with PM2 and Nginx
# Domain: projex.selfmaxing.io
# IP: 178.128.128.110

set -e

echo "🚀 Setting up Kan project with PM2 and Nginx..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root for nginx setup
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  Note: You'll need sudo access for Nginx configuration${NC}"
fi

# Step 1: Build the application
echo -e "\n${GREEN}Step 1: Building the Next.js application...${NC}"
cd /home/yamz/sites/kan
pnpm install
cd apps/web
pnpm build

# Step 2: Stop existing PM2 process if running
echo -e "\n${GREEN}Step 2: Stopping existing PM2 process (if any)...${NC}"
pm2 stop kan-projex 2>/dev/null || echo "No existing process to stop"
pm2 delete kan-projex 2>/dev/null || echo "No existing process to delete"

# Step 3: Start PM2 service
echo -e "\n${GREEN}Step 3: Starting PM2 service...${NC}"
cd /home/yamz/sites/kan
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Step 4: Setup Nginx configuration
echo -e "\n${GREEN}Step 4: Setting up Nginx configuration...${NC}"
echo -e "${YELLOW}You need to run the following commands with sudo:${NC}"
echo ""
echo "sudo cp /home/yamz/sites/kan/nginx-projex.conf /etc/nginx/sites-available/projex.selfmaxing.io"
echo "sudo ln -sf /etc/nginx/sites-available/projex.selfmaxing.io /etc/nginx/sites-enabled/"
echo "sudo nginx -t"
echo "sudo systemctl reload nginx"
echo ""

# Step 5: SSL Certificate setup
echo -e "\n${GREEN}Step 5: SSL Certificate Setup${NC}"
echo -e "${YELLOW}To set up SSL with Let's Encrypt, run:${NC}"
echo ""
echo "sudo apt install certbot python3-certbot-nginx -y"
echo "sudo certbot --nginx -d projex.selfmaxing.io"
echo ""

# Step 6: DNS Configuration reminder
echo -e "\n${GREEN}Step 6: DNS Configuration${NC}"
echo -e "${YELLOW}Make sure your DNS is configured:${NC}"
echo ""
echo "Add an A record for projex.selfmaxing.io pointing to 178.128.128.110"
echo ""
echo "Example DNS record:"
echo "  Type: A"
echo "  Name: projex"
echo "  Value: 178.128.128.110"
echo "  TTL: 3600"
echo ""

# Summary
echo -e "\n${GREEN}✅ PM2 setup complete!${NC}"
echo ""
echo "PM2 Status:"
pm2 status
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure your DNS to point projex.selfmaxing.io to 178.128.128.110"
echo "2. Run the Nginx commands shown above (with sudo)"
echo "3. Set up SSL certificate with certbot"
echo "4. Update your .env file with NEXT_PUBLIC_BASE_URL=https://projex.selfmaxing.io"
echo ""
echo -e "${GREEN}Useful PM2 commands:${NC}"
echo "  pm2 status          - Check service status"
echo "  pm2 logs kan-projex - View logs"
echo "  pm2 restart kan-projex - Restart service"
echo "  pm2 stop kan-projex - Stop service"
echo "  pm2 monit           - Monitor resources"
