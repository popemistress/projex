#!/bin/bash

# Full Project Backup Script
# Creates a complete backup of the project including all files and databases

set -e  # Exit on error

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_ROOT="/home/yamz/site-backup"
BACKUP_DIR="${BACKUP_ROOT}/backup_${TIMESTAMP}"
PROJECT_DIR="/home/yamz/sites/kan"
DB_CONTAINER="kan-db"
DB_NAME="kan_db"
DB_USER="kan"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Full Project Backup Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}Timestamp: ${TIMESTAMP}${NC}"
echo -e "${YELLOW}Backup Location: ${BACKUP_DIR}${NC}"
echo ""

# Create backup directory structure
echo -e "${GREEN}[1/5] Creating backup directory structure...${NC}"
mkdir -p "${BACKUP_DIR}/project-files"
mkdir -p "${BACKUP_DIR}/databases"
mkdir -p "${BACKUP_DIR}/logs"

# Backup all project files
echo -e "${GREEN}[2/5] Backing up project files...${NC}"
echo "This may take a few minutes depending on project size..."

# Use rsync for efficient copying with progress
rsync -av --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.turbo' \
  --exclude 'dist' \
  --exclude 'build' \
  --exclude '.next' \
  --exclude 'coverage' \
  --exclude 'logs/*.log' \
  "${PROJECT_DIR}/" "${BACKUP_DIR}/project-files/" 2>&1 | tee "${BACKUP_DIR}/logs/rsync.log"

# Also backup the full project including node_modules and .git (in separate archive)
echo -e "${GREEN}[2.5/5] Creating complete project archive (including node_modules and .git)...${NC}"
cd "${PROJECT_DIR}"
tar -czf "${BACKUP_DIR}/complete-project-archive.tar.gz" \
  --exclude='.turbo' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.next' \
  --exclude='coverage' \
  . 2>&1 | tee -a "${BACKUP_DIR}/logs/tar.log"

# Backup PostgreSQL database
echo -e "${GREEN}[3/5] Backing up PostgreSQL database...${NC}"

# Check if Docker container is running
if docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  echo "Database container '${DB_CONTAINER}' is running. Proceeding with backup..."
  
  # Create SQL dump
  docker exec -t ${DB_CONTAINER} pg_dump -U ${DB_USER} -d ${DB_NAME} --clean --if-exists --create \
    > "${BACKUP_DIR}/databases/${DB_NAME}_${TIMESTAMP}.sql" 2>&1
  
  # Create compressed backup
  gzip -c "${BACKUP_DIR}/databases/${DB_NAME}_${TIMESTAMP}.sql" \
    > "${BACKUP_DIR}/databases/${DB_NAME}_${TIMESTAMP}.sql.gz"
  
  echo -e "${GREEN}✓ Database backup completed${NC}"
  echo "  - SQL dump: ${DB_NAME}_${TIMESTAMP}.sql"
  echo "  - Compressed: ${DB_NAME}_${TIMESTAMP}.sql.gz"
else
  echo -e "${YELLOW}⚠ Warning: Database container '${DB_CONTAINER}' is not running.${NC}"
  echo "Database backup skipped. If you need to backup the database, please start the container first."
  echo "Checking for database volume..."
  
  # Try to backup the database volume directly
  if docker volume ls | grep -q "kan_postgres_data"; then
    echo "Found database volume 'kan_postgres_data'. Creating volume backup..."
    docker run --rm -v kan_postgres_data:/data -v "${BACKUP_DIR}/databases":/backup \
      alpine tar czf /backup/postgres_volume_${TIMESTAMP}.tar.gz -C /data . 2>&1
    echo -e "${GREEN}✓ Database volume backup completed${NC}"
  else
    echo -e "${RED}✗ Database volume not found. Database backup skipped.${NC}"
  fi
fi

# Backup environment files
echo -e "${GREEN}[4/5] Backing up environment configuration...${NC}"
if [ -f "${PROJECT_DIR}/.env" ]; then
  cp "${PROJECT_DIR}/.env" "${BACKUP_DIR}/.env.backup"
  echo -e "${GREEN}✓ .env file backed up${NC}"
else
  echo -e "${YELLOW}⚠ .env file not found${NC}"
fi

# Create backup manifest
echo -e "${GREEN}[5/5] Creating backup manifest...${NC}"
cat > "${BACKUP_DIR}/BACKUP_INFO.txt" << EOF
========================================
BACKUP INFORMATION
========================================
Backup Date: $(date)
Timestamp: ${TIMESTAMP}
Project Directory: ${PROJECT_DIR}
Backup Location: ${BACKUP_DIR}

========================================
BACKUP CONTENTS
========================================
1. Project Files:
   - Location: ${BACKUP_DIR}/project-files/
   - Excludes: node_modules, .git, .turbo, dist, build, .next, coverage
   
2. Complete Archive:
   - Location: ${BACKUP_DIR}/complete-project-archive.tar.gz
   - Includes: Everything except build artifacts
   
3. Database Backups:
   - Location: ${BACKUP_DIR}/databases/
   - Database: ${DB_NAME}
   
4. Environment Configuration:
   - Location: ${BACKUP_DIR}/.env.backup

========================================
RESTORE INSTRUCTIONS
========================================
To restore project files:
  rsync -av ${BACKUP_DIR}/project-files/ /path/to/restore/location/

To restore from complete archive:
  tar -xzf ${BACKUP_DIR}/complete-project-archive.tar.gz -C /path/to/restore/location/

To restore database:
  # If using SQL dump:
  docker exec -i kan-db psql -U kan -d kan_db < ${BACKUP_DIR}/databases/${DB_NAME}_${TIMESTAMP}.sql
  
  # Or from compressed:
  gunzip -c ${BACKUP_DIR}/databases/${DB_NAME}_${TIMESTAMP}.sql.gz | docker exec -i kan-db psql -U kan -d kan_db

To restore environment:
  cp ${BACKUP_DIR}/.env.backup /path/to/project/.env

========================================
BACKUP SIZE
========================================
EOF

# Calculate sizes
du -sh "${BACKUP_DIR}/project-files" >> "${BACKUP_DIR}/BACKUP_INFO.txt" 2>&1 || echo "N/A" >> "${BACKUP_DIR}/BACKUP_INFO.txt"
du -sh "${BACKUP_DIR}/databases" >> "${BACKUP_DIR}/BACKUP_INFO.txt" 2>&1 || echo "N/A" >> "${BACKUP_DIR}/BACKUP_INFO.txt"
du -sh "${BACKUP_DIR}/complete-project-archive.tar.gz" >> "${BACKUP_DIR}/BACKUP_INFO.txt" 2>&1 || echo "N/A" >> "${BACKUP_DIR}/BACKUP_INFO.txt"
du -sh "${BACKUP_DIR}" >> "${BACKUP_DIR}/BACKUP_INFO.txt" 2>&1 || echo "N/A" >> "${BACKUP_DIR}/BACKUP_INFO.txt"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ BACKUP COMPLETED SUCCESSFULLY${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Backup Summary:${NC}"
echo "  Location: ${BACKUP_DIR}"
echo ""
echo "  Contents:"
echo "    • Project files (selective)"
echo "    • Complete project archive"
echo "    • Database backup"
echo "    • Environment configuration"
echo ""
echo -e "${YELLOW}Total backup size:${NC}"
du -sh "${BACKUP_DIR}"
echo ""
echo -e "${BLUE}View full backup info: cat ${BACKUP_DIR}/BACKUP_INFO.txt${NC}"
echo ""
