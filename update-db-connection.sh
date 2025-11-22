#!/bin/bash

# Update the database connection to use Filez database
cd /home/yamz/sites/projex

# Backup current .env
cp .env .env.backup

# Update POSTGRES_URL to use Filez database
sed -i 's|POSTGRES_URL=.*|POSTGRES_URL=postgresql://yamz:filez123@localhost:5432/fileupload?schema=public|' .env

echo "Database connection updated to use Filez database"
echo "New connection: postgresql://yamz:filez123@localhost:5432/fileupload?schema=public"
