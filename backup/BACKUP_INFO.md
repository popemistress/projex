# Backup Information

**Backup Date:** November 14, 2025 at 20:24 UTC
**Backup Size:** 38MB

## What's Included

This backup contains all source code and configuration files from the Kan project:

- ✅ Source code (`apps/`, `packages/`, `tooling/`)
- ✅ Configuration files (`.env.example`, `turbo.json`, `package.json`, etc.)
- ✅ Documentation files (`README.md`, `LICENSE`, etc.)
- ✅ Database migrations (`packages/db/migrations/`)
- ✅ GitHub workflows (`.github/`)
- ✅ Docker configuration (`docker-compose.yml`, `.dockerignore`)
- ✅ Nginx configuration files
- ✅ PM2 configuration (`ecosystem.config.js`)
- ✅ Setup scripts (`setup-env.sh`, `setup-pm2-nginx.sh`)

## What's Excluded

The following items were intentionally excluded from the backup:

- ❌ `node_modules/` - Dependencies (can be reinstalled with `pnpm install`)
- ❌ `.next/` - Next.js build output (regenerated on build)
- ❌ `dist/` - TypeScript build output (regenerated on build)
- ❌ `.turbo/` - Turborepo cache
- ❌ `.cache/` - Build caches
- ❌ `.git/` - Git repository (use git for version control)
- ❌ `.env` and `.env.local` - Environment variables with secrets
- ❌ `*.log` - Log files
- ❌ `pnpm-lock.yaml` and `package-lock.json` - Lock files (regenerated)
- ❌ Database files (`*.db`, `*.sqlite`, `postgres_data/`)

## Restoration

To restore from this backup:

1. Copy the contents of this backup folder to your desired location
2. Run `pnpm install` to install dependencies
3. Copy your `.env` file with the appropriate environment variables
4. Run `pnpm build` to build the project
5. Restore your database separately from database backups

## Notes

- This is a source code backup only
- Database backups should be managed separately (see `kan_backup_20251114_193246.sql` in parent directory)
- Ensure you have your environment variables backed up separately
