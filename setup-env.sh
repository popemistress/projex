#!/bin/bash

# Setup minimum required environment variables for Kan project

set -e

ENV_FILE="/home/yamz/sites/kan/.env"

echo "🔧 Setting up environment variables..."

# Check if .env exists
if [ -f "$ENV_FILE" ]; then
    echo "⚠️  .env file already exists. Creating backup..."
    cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Generate a secure random secret
GENERATED_SECRET=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)

# Create or update .env file with minimum required variables
cat > "$ENV_FILE" << EOF
# Required environment variables
NEXT_PUBLIC_BASE_URL=https://projex.selfmaxing.io
BETTER_AUTH_SECRET=${GENERATED_SECRET}

# Database (using local SQLite by default)
# For production, consider using PostgreSQL:
# POSTGRES_URL=postgresql://user:password@localhost:5432/kan

# Optional: Disable email features if not configured
NEXT_PUBLIC_DISABLE_EMAIL=true

# Optional: Allow password-based authentication
NEXT_PUBLIC_ALLOW_CREDENTIALS=true

# Optional: Disable sign up (set to true to disable)
# NEXT_PUBLIC_DISABLE_SIGN_UP=false

# Optional: S3 storage (leave empty to use local storage)
# S3_REGION=
# S3_ENDPOINT=
# S3_ACCESS_KEY_ID=
# S3_SECRET_ACCESS_KEY=
# S3_FORCE_PATH_STYLE=
# NEXT_PUBLIC_STORAGE_URL=
# NEXT_PUBLIC_AVATAR_BUCKET_NAME=
# NEXT_PUBLIC_STORAGE_DOMAIN=

# Optional: SMTP configuration
# SMTP_HOST=
# SMTP_PORT=465
# SMTP_USER=
# SMTP_PASSWORD=
# EMAIL_FROM=
# SMTP_SECURE=true

# Optional: OAuth providers
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
# Add other OAuth providers as needed...

EOF

echo "✅ Environment file created at: $ENV_FILE"
echo ""
echo "📝 Generated BETTER_AUTH_SECRET: ${GENERATED_SECRET}"
echo ""
echo "⚠️  IMPORTANT: Review and update the .env file with your specific configuration!"
echo ""
echo "Minimum configuration is set. You can now build the application."
