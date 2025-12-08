#!/bin/bash

# Script d'installation robuste pour macOS
# Gère l'absence de Docker et les erreurs Homebrew

echo "🚀 Démarrage de l'installation de SamaSanté..."

# 1. Vérifier/Installer Node.js
if ! command -v node &> /dev/null; then
    echo "📦 Installation de Node.js..."
    brew install node
fi

# 2. Installation des dépendances
echo "📦 Installation des dépendances NPM..."
cd backend && npm install
cd .. && npm install

# 3. Base de Données (PostgreSQL)
echo "🐘 Configuration de la base de données..."

if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL est déjà installé."
else
    echo "⚠️ PostgreSQL n'est pas trouvé via CLI."
    echo "🔄 Tentative d'installation via Homebrew..."
    
    # Nettoyer les locks
    rm -f /usr/local/var/homebrew/locks/*
    
    if brew install postgresql@14; then
        echo "✅ PostgreSQL installé via Homebrew."
        brew services start postgresql@14
        
        # Ajouter au PATH
        echo 'export PATH="/usr/local/opt/postgresql@14/bin:$PATH"' >> ~/.zshrc
        export PATH="/usr/local/opt/postgresql@14/bin:$PATH"
    else
        echo "❌ Échec de l'installation Homebrew."
        echo "💡 RECOMMANDATION: Téléchargez et installez Postgres.app :"
        echo "   https://postgresapp.com/downloads.html"
        echo "   Une fois installé, ouvrez l'application et cliquez sur 'Initialize'."
    fi
fi

# 4. Redis
echo "🔴 Configuration de Redis..."
if command -v redis-cli &> /dev/null; then
    echo "✅ Redis est déjà installé."
else
    if brew install redis; then
        echo "✅ Redis installé."
        brew services start redis
    else
        echo "❌ Échec de l'installation Redis."
    fi
fi

# 5. Configuration .env
echo "📝 Configuration des variables d'environnement..."

# Générer clés
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")

# Backend .env
cat > backend/.env << EOF
DATABASE_URL="postgresql://samasante_user:samasante_password@localhost:5432/samasante_dev"
JWT_SECRET="${JWT_SECRET}"
ENCRYPTION_KEY="${ENCRYPTION_KEY}"
REDIS_HOST="localhost"
REDIS_PORT="6379"
NODE_ENV="development"
EOF

# Frontend .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL="http://localhost:3000"
EOF

echo "✅ Fichiers .env générés."

# 6. Initialisation Base de Données
echo "🗄️ Initialisation de la base de données..."

# Essayer de créer l'utilisateur et la DB
psql postgres -c "CREATE USER samasante_user WITH PASSWORD 'samasante_password';" 2>/dev/null || echo "User exists"
psql postgres -c "CREATE DATABASE samasante_dev OWNER samasante_user;" 2>/dev/null || echo "DB exists"

# Migrations Prisma
echo "🔄 Exécution des migrations Prisma..."
cd backend
npx prisma migrate dev --name init
npx prisma generate

echo "🎉 Installation terminée !"
echo "👉 Pour démarrer :"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: npm run dev"
