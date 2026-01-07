# 🚀 Guide de Démarrage Rapide - SamaSante

## 📦 Installation & Configuration

### 1. Cloner et Installer les Dépendances

```bash
# Installer les dépendances backend
cd backend
npm install

# Installer les dépendances frontend
cd ..
npm install
```

### 2. Configuration de l'Environnement

#### Backend `.env`

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="votre_secret_jwt_super_securise"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# SMTP (Optionnel - pour les notifications fournisseurs)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_app
SMTP_FROM=noreply@samasante.sn

# Twilio (Optionnel - pour SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Sentry (Optionnel - pour monitoring)
SENTRY_DSN=
```

#### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Initialiser la Base de Données

```bash
cd backend

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma db push

# Peupler avec des données de test
npx tsx prisma/seed.ts

# Ajouter les données pour les dashboards
npx tsx prisma/seed-dashboard.ts
```

---

## 🏃 Démarrage des Serveurs

### Démarrage Complet (2 terminaux)

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

✅ Backend disponible sur `http://localhost:3000`

#### Terminal 2 - Frontend

```bash
npm run dev
```

✅ Frontend disponible sur `http://localhost:3001`

### Vérification Rapide

```bash
# Tester le backend
curl http://localhost:3000/api/health

# Devrait retourner: {"status":"ok"}
```

---

## 👥 Comptes de Test

Après avoir exécuté les seeds, vous aurez accès à ces comptes :

### Super Admin

- **Email**: `admin@samasante.sn`
- **Mot de passe**: `Admin123!`
- **Accès**: Tous les modules

### Hospital Admin

- **Email**: `admin@hospital.sn`
- **Mot de passe**: `Hospital123!`
- **Accès**: Dashboard Hôpital, Pharmacie, Admissions

### Médecin

- **Email**: `doctor@hospital.sn`
- **Mot de passe**: `Doctor123!`
- **Accès**: Dashboard Médecin, Patients, Rendez-vous

### Patient

- **Email**: `patient@test.sn`
- **Mot de passe**: `Patient123!`
- **Accès**: Portail Patient, Rendez-vous, Dossier Médical

---

## 🔍 Commandes Utiles

### Base de Données

```bash
# Ouvrir Prisma Studio (interface graphique)
cd backend
npx prisma studio
# Accessible sur http://localhost:5555

# Réinitialiser la base de données
npx prisma db push --force-reset
npx tsx prisma/seed.ts
npx tsx prisma/seed-dashboard.ts

# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# Voir le schéma actuel
npx prisma db pull
```

### Développement

```bash
# Lancer les tests backend
cd backend
npm test

# Lancer les tests avec coverage
npm run test:coverage

# Vérifier les types TypeScript
npm run build

# Formater le code
npm run format
```

### Logs et Debugging

```bash
# Voir les logs Redis
redis-cli monitor

# Voir les jobs en queue
redis-cli
> KEYS bull:*
> LRANGE bull:notifications:waiting 0 -1

# Nettoyer le cache Redis
redis-cli FLUSHDB
```

---

## 📊 Accès Rapide aux Modules

### Dashboards

- **Super Admin**: <http://localhost:3001/admin>
- **Hospital Admin**: <http://localhost:3001/hospital/dashboard>
- **Médecin**: <http://localhost:3001/doctor>
- **Patient**: <http://localhost:3001/patient>

### Modules Hospitaliers

- **Admissions**: <http://localhost:3001/hospital/admissions>
- **Pharmacie**: <http://localhost:3001/hospital/pharmacy>
- **Rendez-vous**: <http://localhost:3001/hospital/appointments>
- **Patients**: <http://localhost:3001/hospital/patients>
- **Médecins**: <http://localhost:3001/hospital/doctors>
- **Urgences**: <http://localhost:3001/hospital/emergencies>
- **Départements**: <http://localhost:3001/hospital/departments>
- **Facturation**: <http://localhost:3001/hospital/billing>

### Modules Médecin

- **Patients**: <http://localhost:3001/doctor/patients>
- **Rendez-vous**: <http://localhost:3001/doctor/appointments>
- **Disponibilités**: <http://localhost:3001/doctor/availability>

### Modules Patient

- **Dossier Médical**: <http://localhost:3001/patient/medical-record>
- **Rendez-vous**: <http://localhost:3001/patient/appointments>
- **Documents**: <http://localhost:3001/patient/documents>

---

## 🧪 Tests des Nouvelles Fonctionnalités

### 1. Tester les Sources de Réservation

```bash
# Se connecter en tant que Hospital Admin
# Aller sur http://localhost:3001/hospital/dashboard
# Observer le graphique "Sources de Réservation"
# Devrait afficher Mobile App vs Direct/Web avec des valeurs réelles
```

### 2. Tester le Statut des Lits

```bash
# Sur le dashboard hôpital
# Observer le graphique "Statut des Lits (Détail)"
# Aller sur http://localhost:3001/hospital/admissions
# Vérifier la cohérence des statistiques
```

### 3. Tester la Satisfaction Médecin

```bash
# Se connecter en tant que Médecin
# Aller sur http://localhost:3001/doctor
# Observer la carte "Satisfaction"
# Devrait afficher une note calculée (pas 4.8 fixe)
```

### 4. Tester les Mouvements de Stock

```bash
# Se connecter en tant que Hospital Admin
# Aller sur http://localhost:3001/hospital/pharmacy
# Cliquer sur l'onglet "Mouvements"
# Observer l'historique complet des flux de stock
```

### 5. Tester les Notifications Fournisseurs

```bash
# Configurer SMTP dans backend/.env
# Créer un mouvement de sortie qui met un item en rupture
# Vérifier les logs backend pour "✉️ Notification envoyée"
# Vérifier l'email reçu par le fournisseur
```

---

## 🔧 Dépannage Rapide

### Problème: Backend ne démarre pas

```bash
# Vérifier Redis
redis-cli ping
# Devrait retourner: PONG

# Si Redis n'est pas installé:
# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Télécharger depuis https://redis.io/download
```

### Problème: Erreurs Prisma

```bash
cd backend

# Régénérer le client
npx prisma generate

# Réappliquer le schéma
npx prisma db push

# Si tout échoue, reset complet
rm -f prisma/dev.db
npx prisma db push
npx tsx prisma/seed.ts
npx tsx prisma/seed-dashboard.ts
```

### Problème: Frontend ne se connecte pas au Backend

```bash
# Vérifier que le backend tourne
curl http://localhost:3000/api/health

# Vérifier les variables d'environnement
cat .env.local
# Doit contenir: NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Redémarrer le frontend
# Ctrl+C puis npm run dev
```

### Problème: Données vides sur les dashboards

```bash
cd backend

# Réexécuter les seeds
npx tsx prisma/seed-dashboard.ts

# Vérifier les données dans Prisma Studio
npx prisma studio
# Vérifier les tables: DoctorRating, Room, Bed, Admission, Appointment
```

---

## 📚 Documentation Complète

### Fichiers de Documentation

1. **IMPLEMENTATION_REPORT.md** - Rapport détaillé de toutes les implémentations
2. **TESTING_GUIDE.md** - Guide complet de test de toutes les fonctionnalités
3. **README.md** - Documentation générale du projet

### APIs Documentées

Une fois le backend démarré, accédez à la documentation Swagger :

- **Swagger UI**: <http://localhost:3000/doc>

### Schéma de Base de Données

Visualisez le schéma complet dans Prisma Studio :

```bash
cd backend
npx prisma studio
```

---

## 🎯 Checklist de Démarrage

- [ ] Redis installé et démarré
- [ ] Backend `.env` configuré
- [ ] Frontend `.env.local` configuré
- [ ] Base de données initialisée (`npx prisma db push`)
- [ ] Seeds exécutés (seed.ts + seed-dashboard.ts)
- [ ] Backend démarré sur port 3000
- [ ] Frontend démarré sur port 3001
- [ ] Connexion réussie avec un compte de test
- [ ] Dashboards affichent des données réelles
- [ ] Graphiques dynamiques fonctionnels

---

## 🚀 Prêt pour la Production

### Avant de déployer

1. **Sécurité**
   - [ ] Changer tous les secrets (JWT_SECRET, etc.)
   - [ ] Configurer HTTPS
   - [ ] Activer CORS correctement
   - [ ] Configurer rate limiting

2. **Base de Données**
   - [ ] Migrer vers PostgreSQL (recommandé)
   - [ ] Configurer les backups automatiques
   - [ ] Optimiser les index

3. **Performance**
   - [ ] Activer le cache Redis en production
   - [ ] Configurer CDN pour les assets
   - [ ] Optimiser les images

4. **Monitoring**
   - [ ] Configurer Sentry pour les erreurs
   - [ ] Mettre en place des logs centralisés
   - [ ] Configurer des alertes

---

## 📞 Support

Pour toute question ou problème :

1. Consultez d'abord `TESTING_GUIDE.md`
2. Vérifiez `IMPLEMENTATION_REPORT.md` pour les détails techniques
3. Ouvrez une issue sur le repository GitHub

---

**Bon développement ! 🎉**
