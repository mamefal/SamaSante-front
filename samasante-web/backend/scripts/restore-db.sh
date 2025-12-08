#!/bin/bash

# ============================================
# Script de Restauration PostgreSQL
# ============================================

# Configuration
DB_NAME="samasante_prod"
DB_USER="samasante_user"
DB_PASSWORD="${PGPASSWORD:-VotreMotDePasseSecurise123!}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Vérifier les arguments
if [ $# -eq 0 ]; then
    error "Usage: $0 <backup_file.sql.gz>"
    error "Example: $0 /var/backups/postgresql/samasante/backup_20251203_020000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Vérifier que le fichier existe
if [ ! -f "$BACKUP_FILE" ]; then
    error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

log "Backup file: $BACKUP_FILE"

# Confirmation
warning "⚠️  WARNING: This will REPLACE all data in database '$DB_NAME'"
warning "⚠️  Current data will be LOST!"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log "Restore cancelled by user"
    exit 0
fi

# Créer un backup de sécurité avant restauration
SAFETY_BACKUP="/tmp/safety_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
log "Creating safety backup first: $SAFETY_BACKUP"
export PGPASSWORD="$DB_PASSWORD"
pg_dump -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME" | gzip > "$SAFETY_BACKUP"

if [ $? -eq 0 ]; then
    log "Safety backup created ✓"
else
    error "Failed to create safety backup. Aborting restore."
    exit 1
fi

# Décompresser le backup
log "Decompressing backup..."
TEMP_SQL="/tmp/restore_$(date +%Y%m%d_%H%M%S).sql"
gunzip -c "$BACKUP_FILE" > "$TEMP_SQL"

if [ $? -ne 0 ]; then
    error "Failed to decompress backup"
    exit 1
fi

# Terminer les connexions actives
log "Terminating active connections..."
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();"

# Supprimer et recréer la base
log "Dropping and recreating database..."
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# Restaurer
log "Restoring database from backup..."
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" < "$TEMP_SQL"

if [ $? -eq 0 ]; then
    log "Database restored successfully! ✓"
    log "Safety backup kept at: $SAFETY_BACKUP"
    
    # Nettoyer le fichier temporaire
    rm "$TEMP_SQL"
    
    # Vérifier les données
    log "Verifying restored data..."
    RECORD_COUNT=$(psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"User\";")
    log "User records: $RECORD_COUNT"
    
    log "Restore completed successfully! 🎉"
else
    error "Restore failed!"
    warning "You can restore from safety backup: $SAFETY_BACKUP"
    rm "$TEMP_SQL"
    exit 1
fi

exit 0
