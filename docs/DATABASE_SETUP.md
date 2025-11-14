# ✅ Database Setup Complete

## Database Configuration

### PostgreSQL Database Created

- **Database Name**: kan
- **Database User**: kan_user
- **Database Password**: kan_secure_password_2024
- **Connection String**: `postgresql://kan_user:kan_secure_password_2024@localhost:5432/kan`

### Tables Created (24 total)

✅ All database tables successfully migrated:
- user, session, account, verification
- workspace, workspace_members, workspace_slugs, workspace_invite_links, workspace_slug_checks
- board, list, card
- card_activity, card_comments, card_checklist, card_checklist_item
- label, _card_labels, _card_workspace_members
- integration, import
- apiKey, feedback, subscription

---

## Environment Configuration

The `.env` file has been updated with:

```bash
POSTGRES_URL=postgresql://kan_user:kan_secure_password_2024@localhost:5432/kan
NEXT_PUBLIC_BASE_URL=https://projex.selfmaxing.io
BETTER_AUTH_SECRET=HXEtKaQ9hDCYkVRbrong5QdeCGBAv0oZ
NEXT_PUBLIC_DISABLE_EMAIL=true
NEXT_PUBLIC_ALLOW_CREDENTIALS=true
```

---

## Application Status

✅ **PM2 Service**: Restarted with new database configuration
✅ **Database**: Connected and operational
✅ **Auth Endpoints**: Responding correctly
✅ **Registration/Login**: Should now be functional

---

## Testing Registration & Login

### Test Registration
1. Go to: https://projex.selfmaxing.io/signup
2. Enter your details
3. Create an account

### Test Login
1. Go to: https://projex.selfmaxing.io/login
2. Enter your credentials
3. Log in

---

## Database Management

### Connect to Database
```bash
# As postgres user
sudo -u postgres psql -d kan

# As kan_user
psql -U kan_user -d kan -h localhost
# Password: kan_secure_password_2024
```

### View Tables
```bash
sudo -u postgres psql -d kan -c "\dt"
```

### View Users
```bash
sudo -u postgres psql -d kan -c "SELECT id, name, email, created_at FROM \"user\";"
```

### Backup Database
```bash
# Backup
sudo -u postgres pg_dump kan > kan_backup_$(date +%Y%m%d).sql

# Restore
sudo -u postgres psql kan < kan_backup_20251111.sql
```

---

## Database Migrations

### Run Migrations
```bash
cd /home/yamz/sites/kan/packages/db
pnpm migrate
```

### Push Schema Changes (Development)
```bash
cd /home/yamz/sites/kan/packages/db
pnpm push
```

### Open Drizzle Studio (Database GUI)
```bash
cd /home/yamz/sites/kan/packages/db
pnpm studio
```

---

## Troubleshooting

### Check Database Connection
```bash
sudo -u postgres psql -d kan -c "SELECT 1;"
```

### Check Application Logs
```bash
pm2 logs kan-projex
```

### Restart Application
```bash
pm2 restart kan-projex
```

### Check PostgreSQL Status
```bash
sudo systemctl status postgresql
```

### Reset Database (CAUTION: Deletes all data)
```bash
sudo -u postgres psql << 'EOF'
DROP DATABASE kan;
CREATE DATABASE kan;
GRANT ALL PRIVILEGES ON DATABASE kan TO kan_user;
\c kan
GRANT ALL ON SCHEMA public TO kan_user;
ALTER DATABASE kan OWNER TO kan_user;
EOF

# Then run migrations
cd /home/yamz/sites/kan/packages/db
pnpm migrate

# Restart application
pm2 restart kan-projex
```

---

## Security Notes

⚠️ **Important**: The database password is stored in plain text in the `.env` file. For production:

1. Use a strong, unique password
2. Ensure `.env` file permissions are restricted:
   ```bash
   chmod 600 /home/yamz/sites/kan/.env
   ```
3. Never commit `.env` to version control
4. Consider using environment variable management tools
5. Regularly backup your database

---

## Database Performance

### Check Database Size
```bash
sudo -u postgres psql -d kan -c "SELECT pg_size_pretty(pg_database_size('kan'));"
```

### Check Table Sizes
```bash
sudo -u postgres psql -d kan -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

### Vacuum Database (Maintenance)
```bash
sudo -u postgres psql -d kan -c "VACUUM ANALYZE;"
```

---

## Next Steps

1. ✅ Database is configured and running
2. ✅ Application is connected to database
3. ✅ Registration and login should now work
4. 🔄 Test registration at: https://projex.selfmaxing.io/signup
5. 🔄 Test login at: https://projex.selfmaxing.io/login

---

**Database Setup Completed**: November 11, 2025
**Status**: ✅ Operational
