#!/bin/bash

# ============================================
# Script de Backup Automatique PostgreSQL
# ============================================

# Configuration
DB_NAME="samasante_prod"
DB_USER="samasante_user"
DB_PASSWORD="${PGPASSWORD:-VotreMotDePasseSecurise123!}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Dossiers
BACKUP_DIR="${BACKUP_DIR:-/var/backups/postgresql/samasante}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Couleurs pour logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Créer le dossier de backup si nécessaire
if [ ! -d "$BACKUP_DIR" ]; then
    log "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    if [ $? -ne 0 ]; then
        error "Failed to create backup directory"
        exit 1
    fi
fi

# Vérifier l'espace disque disponible
AVAILABLE_SPACE=$(df -BG "$BACKUP_DIR" | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$AVAILABLE_SPACE" -lt 5 ]; then
    warning "Low disk space: ${AVAILABLE_SPACE}GB available"
fi

# Démarrer le backup
log "Starting backup of database: $DB_NAME"
log "Backup file: ${BACKUP_FILE}.gz"

# Exécuter pg_dump
export PGPASSWORD="$DB_PASSWORD"
pg_dump -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME" > "$BACKUP_FILE" 2>&1

if [ $? -eq 0 ]; then
    log "Database dump completed successfully"
    
    # Compression
    log "Compressing backup..."
    gzip "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
        log "Backup completed successfully: ${BACKUP_FILE}.gz (${BACKUP_SIZE})"
    else
        error "Compression failed"
        exit 1
    fi
else
    error "Database dump failed"
    exit 1
fi

# Nettoyer les anciens backups
log "Cleaning old backups (older than $RETENTION_DAYS days)..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
log "Deleted $DELETED_COUNT old backup(s)"

# Lister les backups récents
log "Recent backups:"
ls -lh "$BACKUP_DIR"/backup_*.sql.gz | tail -5

# Upload vers cloud (optionnel - décommenter si configuré)
# if command -v aws &> /dev/null; then
#     log "Uploading to AWS S3..."
#     aws s3 cp "${BACKUP_FILE}.gz" "s3://samasante-backups/$(basename ${BACKUP_FILE}.gz)"
#     if [ $? -eq 0 ]; then
#         log "Upload to S3 successful"
#     else
#         warning "Upload to S3 failed"
#     fi
# fi

# Vérifier l'intégrité du backup
log "Verifying backup integrity..."
gunzip -t "${BACKUP_FILE}.gz"
if [ $? -eq 0 ]; then
    log "Backup integrity verified ✓"
else
    error "Backup integrity check failed!"
    exit 1
fi

log "Backup process completed successfully! 🎉"

# Envoyer notification (optionnel)
# curl -X POST "https://api.slack.com/webhooks/..." -d "{\"text\":\"Backup completed: ${BACKUP_FILE}.gz\"}"

exit 0
