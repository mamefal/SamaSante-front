#!/bin/bash

echo "🔍 Vérification de la configuration SQLite..."

# 1. Vérifier le fichier .env
if grep -q "DATABASE_URL=\"file:./dev.db\"" backend/.env; then
    echo "✅ DATABASE_URL est correctement configuré pour SQLite"
else
    echo "❌ DATABASE_URL n'est pas configuré pour SQLite dans backend/.env"
    grep "DATABASE_URL" backend/.env
fi

# 2. Vérifier le fichier schema.prisma
if grep -q "provider = \"sqlite\"" backend/prisma/schema.prisma; then
    echo "✅ Provider Prisma est correctement configuré sur SQLite"
else
    echo "❌ Provider Prisma n'est pas configuré sur SQLite"
    grep "provider" backend/prisma/schema.prisma
fi

# 3. Vérifier le fichier de base de données
if [ -f "backend/dev.db" ]; then
    echo "✅ Fichier de base de données dev.db existe"
else
    echo "❌ Fichier de base de données dev.db manquant"
fi

# 4. Vérifier la connexion Prisma
echo "🔄 Test de connexion Prisma..."
cd backend && npx prisma db pull --print > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Connexion Prisma réussie"
else
    echo "❌ Échec de la connexion Prisma"
fi

echo "🏁 Vérification terminée."
