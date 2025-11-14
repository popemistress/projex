#!/bin/bash

# Manual Database Backup Script
# This script backs up PostgreSQL databases from the local server

set -e

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/yamz/site-backup/backup_20251113_200305/databases"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  PostgreSQL Database Backup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# List all databases
echo -e "${GREEN}Available databases:${NC}"
sudo -u postgres psql -l

echo ""
echo -e "${YELLOW}Backing up all databases...${NC}"
echo ""

# Backup all databases
echo -e "${GREEN}[1/3] Backing up all databases (global dump)...${NC}"
sudo -u postgres pg_dumpall > "${BACKUP_DIR}/all_databases_${TIMESTAMP}.sql"
echo -e "${GREEN}✓ Global dump completed${NC}"

# Backup individual databases
echo -e "${GREEN}[2/3] Backing up individual databases...${NC}"

# Get list of databases (excluding templates and postgres)
DATABASES=$(sudo -u postgres psql -t -c "SELECT datname FROM pg_database WHERE datistemplate = false AND datname != 'postgres';")

for DB in $DATABASES; do
  DB=$(echo $DB | xargs)  # Trim whitespace
  if [ ! -z "$DB" ]; then
    echo "  Backing up database: $DB"
    sudo -u postgres pg_dump "$DB" --clean --if-exists --create \
      > "${BACKUP_DIR}/${DB}_${TIMESTAMP}.sql"
    
    # Compress the backup
    gzip "${BACKUP_DIR}/${DB}_${TIMESTAMP}.sql"
    echo -e "  ${GREEN}✓ $DB backed up and compressed${NC}"
  fi
done

# Compress the global dump
echo -e "${GREEN}[3/3] Compressing global dump...${NC}"
gzip "${BACKUP_DIR}/all_databases_${TIMESTAMP}.sql"
echo -e "${GREEN}✓ Compression completed${NC}"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ DATABASE BACKUP COMPLETED${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Backup location: ${BACKUP_DIR}${NC}"
echo ""
echo "Backed up files:"
ls -lh "${BACKUP_DIR}"/*.sql.gz 2>/dev/null || echo "No compressed backups found"
echo ""
echo -e "${YELLOW}Total database backup size:${NC}"
du -sh "${BACKUP_DIR}"
echo ""
echo -e "${BLUE}Restore instructions:${NC}"
echo "  To restore all databases:"
echo "    gunzip -c ${BACKUP_DIR}/all_databases_${TIMESTAMP}.sql.gz | sudo -u postgres psql"
echo ""
echo "  To restore a specific database:"
echo "    gunzip -c ${BACKUP_DIR}/[database_name]_${TIMESTAMP}.sql.gz | sudo -u postgres psql"
echo ""
