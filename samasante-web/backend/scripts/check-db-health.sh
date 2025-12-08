#!/bin/bash

# ============================================
# Script de Vérification Santé PostgreSQL
# ============================================

DB_NAME="samasante_prod"
DB_USER="samasante_user"
DB_PASSWORD="${PGPASSWORD:-VotreMotDePasseSecurise123!}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

export PGPASSWORD="$DB_PASSWORD"

echo "========================================="
echo "  Database Health Check"
echo "  Date: $(date)"
echo "========================================="

# Connexions actives
echo -e "\n📊 Active Connections:"
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "
SELECT 
    count(*) as total_connections,
    count(*) FILTER (WHERE state = 'active') as active,
    count(*) FILTER (WHERE state = 'idle') as idle
FROM pg_stat_activity 
WHERE datname = '$DB_NAME';
"

# Taille de la base
echo -e "\n💾 Database Size:"
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "
SELECT 
    pg_size_pretty(pg_database_size('$DB_NAME')) as database_size;
"

# Tables les plus volumineuses
echo -e "\n📦 Largest Tables:"
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) as bytes
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY bytes DESC 
LIMIT 10;
"

# Statistiques des tables
echo -e "\n📈 Table Statistics:"
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "
SELECT 
    schemaname,
    tablename,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    CASE 
        WHEN n_live_tup > 0 
        THEN round(100.0 * n_dead_tup / n_live_tup, 2)
        ELSE 0 
    END as dead_ratio
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC
LIMIT 10;
"

# Indexes non utilisés
echo -e "\n🔍 Unused Indexes:"
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
WHERE idx_scan = 0 
AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
"

# Queries lentes (si pg_stat_statements activé)
echo -e "\n⏱️  Slowest Queries (if available):"
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "
SELECT 
    substring(query, 1, 50) as query_preview,
    calls,
    round(total_exec_time::numeric, 2) as total_time_ms,
    round(mean_exec_time::numeric, 2) as avg_time_ms
FROM pg_stat_statements 
WHERE query NOT LIKE '%pg_stat%'
ORDER BY mean_exec_time DESC 
LIMIT 10;
" 2>/dev/null || echo "pg_stat_statements not enabled"

# Cache hit ratio
echo -e "\n🎯 Cache Hit Ratio:"
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "
SELECT 
    sum(heap_blks_read) as heap_read,
    sum(heap_blks_hit) as heap_hit,
    round(100.0 * sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0), 2) as cache_hit_ratio
FROM pg_statio_user_tables;
"

# Dernier VACUUM et ANALYZE
echo -e "\n🧹 Last VACUUM/ANALYZE:"
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "
SELECT 
    schemaname,
    tablename,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY last_autovacuum DESC NULLS LAST
LIMIT 10;
"

# Version PostgreSQL
echo -e "\n📌 PostgreSQL Version:"
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "SELECT version();"

echo -e "\n========================================="
echo "  Health Check Completed"
echo "========================================="
