#!/bin/bash

# Backup automatique quotidien avec upload off-site
# À exécuter via cron: 0 2 * * * /path/to/automated-backup.sh

set -e

# Configuration
BACKUP_DIR="/var/backups/samasante"
S3_BUCKET="s3://samasante-backups"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/samasante-backup.log"

# Fonction de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🚀 Starting automated backup..."

# Créer répertoire de backup
mkdir -p "$BACKUP_DIR"

# 1. Backup PostgreSQL
log "📦 Backing up PostgreSQL database..."
PGPASSWORD=$DB_PASSWORD pg_dump \
    -h localhost \
    -U $DB_USER \
    -d $DB_NAME \
    -F c \
    -f "$BACKUP_DIR/db_$DATE.dump"

# Vérifier la taille du backup
DB_SIZE=$(du -h "$BACKUP_DIR/db_$DATE.dump" | cut -f1)
log "✅ Database backup completed: $DB_SIZE"

# 2. Backup fichiers uploads
log "📦 Backing up uploaded files..."
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" \
    -C /var/www/samasante/backend uploads/

UPLOADS_SIZE=$(du -h "$BACKUP_DIR/uploads_$DATE.tar.gz" | cut -f1)
log "✅ Uploads backup completed: $UPLOADS_SIZE"

# 3. Backup configuration
log "📦 Backing up configuration files..."
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
    -C /var/www/samasante \
    .env \
    backend/.env \
    nginx/nginx.conf \
    docker-compose.yml

log "✅ Configuration backup completed"

# 4. Créer manifest
log "📝 Creating backup manifest..."
cat > "$BACKUP_DIR/manifest_$DATE.json" <<EOF
{
  "date": "$DATE",
  "timestamp": $(date +%s),
  "database": {
    "file": "db_$DATE.dump",
    "size": "$DB_SIZE"
  },
  "uploads": {
    "file": "uploads_$DATE.tar.gz",
    "size": "$UPLOADS_SIZE"
  },
  "config": {
    "file": "config_$DATE.tar.gz"
  },
  "hostname": "$(hostname)",
  "version": "$(git -C /var/www/samasante rev-parse HEAD 2>/dev/null || echo 'unknown')"
}
EOF

# 5. Upload vers S3 (off-site)
if command -v aws &> /dev/null; then
    log "☁️  Uploading to S3..."
    
    aws s3 cp "$BACKUP_DIR/db_$DATE.dump" "$S3_BUCKET/daily/" --storage-class STANDARD_IA
    aws s3 cp "$BACKUP_DIR/uploads_$DATE.tar.gz" "$S3_BUCKET/daily/"
    aws s3 cp "$BACKUP_DIR/config_$DATE.tar.gz" "$S3_BUCKET/daily/"
    aws s3 cp "$BACKUP_DIR/manifest_$DATE.json" "$S3_BUCKET/daily/"
    
    log "✅ Upload to S3 completed"
else
    log "⚠️  AWS CLI not found, skipping S3 upload"
fi

# 6. Cleanup anciens backups locaux
log "🧹 Cleaning up old local backups..."
find "$BACKUP_DIR" -name "db_*.dump" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "config_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "manifest_*.json" -mtime +$RETENTION_DAYS -delete

# 7. Cleanup anciens backups S3
if command -v aws &> /dev/null; then
    log "🧹 Cleaning up old S3 backups..."
    CUTOFF_DATE=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d)
    
    aws s3 ls "$S3_BUCKET/daily/" | while read -r line; do
        FILE_DATE=$(echo $line | awk '{print $4}' | grep -oP '\d{8}' | head -1)
        if [[ "$FILE_DATE" < "$CUTOFF_DATE" ]]; then
            FILE_NAME=$(echo $line | awk '{print $4}')
            aws s3 rm "$S3_BUCKET/daily/$FILE_NAME"
            log "🗑️  Deleted old backup: $FILE_NAME"
        fi
    done
fi

# 8. Vérifier l'intégrité du backup
log "🔍 Verifying backup integrity..."
if pg_restore -l "$BACKUP_DIR/db_$DATE.dump" > /dev/null 2>&1; then
    log "✅ Database backup integrity verified"
else
    log "❌ Database backup integrity check FAILED!"
    # Envoyer alerte
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"⚠️ Backup integrity check FAILED on $(hostname)\"}"
    exit 1
fi

# 9. Test de restauration (optionnel, une fois par semaine)
if [ $(date +%u) -eq 7 ]; then
    log "🧪 Running weekly restore test..."
    
    # Créer base de données de test
    PGPASSWORD=$DB_PASSWORD createdb -h localhost -U $DB_USER test_restore_$DATE || true
    
    # Restaurer
    PGPASSWORD=$DB_PASSWORD pg_restore \
        -h localhost \
        -U $DB_USER \
        -d test_restore_$DATE \
        "$BACKUP_DIR/db_$DATE.dump" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        log "✅ Weekly restore test PASSED"
    else
        log "❌ Weekly restore test FAILED!"
    fi
    
    # Cleanup
    PGPASSWORD=$DB_PASSWORD dropdb -h localhost -U $DB_USER test_restore_$DATE
fi

# 10. Envoyer notification de succès
log "✅ Automated backup completed successfully"

if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"✅ Daily backup completed successfully on $(hostname)\\nDatabase: $DB_SIZE\\nUploads: $UPLOADS_SIZE\"}"
fi

log "📊 Backup summary:"
log "  - Database: $DB_SIZE"
log "  - Uploads: $UPLOADS_SIZE"
log "  - Location: $BACKUP_DIR"
log "  - S3: $S3_BUCKET/daily/"
log "  - Retention: $RETENTION_DAYS days"

exit 0
