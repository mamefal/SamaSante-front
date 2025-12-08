# 🏥 SamaSanté - Plateforme de Santé Numérique du Sénégal

> Plateforme moderne de gestion de santé connectant patients, médecins et hôpitaux au Sénégal.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Table des Matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Architecture](#-architecture)
- [API](#-api)
- [Tests](#-tests)
- [Déploiement](#-déploiement)
- [Contribution](#-contribution)

---

## 🎯 Aperçu

SamaSanté est une plateforme SaaS de santé numérique conçue pour faciliter l'accès aux soins médicaux au Sénégal. Elle permet aux patients de prendre rendez-vous en ligne, aux médecins de gérer leurs consultations, et aux hôpitaux d'administrer leurs services.

### Problème Résolu

- ❌ Difficulté à prendre rendez-vous médical
- ❌ Gestion papier des dossiers médicaux
- ❌ Manque de coordination entre hôpitaux
- ❌ Accès limité aux soins spécialisés

### Solution

- ✅ Prise de rendez-vous en ligne 24/7
- ✅ Dossiers médicaux numériques sécurisés
- ✅ Plateforme centralisée multi-hôpitaux
- ✅ Accès facilité aux spécialistes

---

## ✨ Fonctionnalités

### Pour les Patients

- 📅 Prise de rendez-vous en ligne
- 📋 Dossier médical personnel
- 💊 Suivi des prescriptions
- 📄 Téléchargement de documents médicaux
- 🔔 Notifications de rendez-vous

### Pour les Médecins

- 👥 Gestion des patients
- 📊 Tableau de bord avec statistiques
- 📝 Création de prescriptions
- 🗓️ Gestion d'agenda
- 📈 Analyses et rapports

### Pour les Hôpitaux

- 🏥 Gestion multi-services
- 👨‍⚕️ Administration des médecins
- 📊 Statistiques globales
- 🔐 Contrôle d'accès
- 📑 Rapports d'activité

### Pour les Super Admins

- 🖥️ Monitoring système en temps réel
- 📈 Métriques de performance
- 🔍 Logs et audits
- ⚙️ Configuration globale

---

## 🛠️ Stack Technique

### Frontend

- **Framework** : Next.js 15 (App Router)
- **Language** : TypeScript 5
- **Styling** : Tailwind CSS
- **UI Components** : Radix UI + shadcn/ui
- **State Management** : React Hooks
- **Forms** : React Hook Form + Zod
- **HTTP Client** : Axios
- **Notifications** : Sonner

### Backend

- **Runtime** : Node.js
- **Framework** : Hono
- **Language** : TypeScript
- **Database** : PostgreSQL
- **ORM** : Prisma 6
- **Authentication** : JWT (jose)
- **Validation** : Zod
- **Cache** : Redis (ioredis)
- **Rate Limiting** : hono-rate-limiter

### DevOps

- **Monitoring** : Sentry
- **Testing** : Vitest
- **Linting** : ESLint
- **Type Checking** : TypeScript
- **Package Manager** : npm

---

## 🚀 Installation

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- Redis (optionnel)
- npm ou yarn

### 1. Cloner le Projet

```bash
git clone https://github.com/votre-org/samasante-web.git
cd samasante-web
```

### 2. Installer les Dépendances

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 3. Configuration de la Base de Données

```bash
cd backend

# Créer le fichier .env
cp .env.example .env

# Éditer .env avec vos paramètres
nano .env

# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate dev

# (Optionnel) Seed la base de données
npx prisma db seed
```

### 4. Lancer l'Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

L'application sera accessible sur :

- **Frontend** : <http://localhost:3001>
- **Backend** : <http://localhost:3000>
- **Prisma Studio** : <http://localhost:5555> (après `npx prisma studio`)

---

## ⚙️ Configuration

### Variables d'Environnement

#### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/samasante"

# JWT
JWT_SECRET="votre-secret-jwt-super-securise-ici"

# Encryption
ENCRYPTION_KEY="votre-cle-de-chiffrement-32-caracteres"

# Redis (optionnel)
REDIS_URL="redis://localhost:6379"

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001

# Sentry (optionnel)
SENTRY_DSN=votre-sentry-dsn
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SENTRY_DSN=votre-sentry-dsn
```

---

## 📖 Utilisation

### Comptes de Test

Pour tester l'application, utilisez ces identifiants :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Patient | <patient@test.com> | test123 |
| Docteur | <docteur@test.com> | test123 |
| Admin Hôpital | <admin@test.com> | test123 |
| Super Admin | <superadmin@test.com> | test123 |

### Créer un Nouveau Patient

1. Aller sur <http://localhost:3001/auth/signup>
2. Remplir le formulaire d'inscription
3. Se connecter avec les identifiants créés

### Accéder au Monitoring

1. Se connecter avec le compte Super Admin
2. Naviguer vers <http://localhost:3001/monitoring>
3. Visualiser les métriques en temps réel

---

## 🏗️ Architecture

### Structure du Projet

```
samasante-web/
├── backend/                 # API Backend (Hono)
│   ├── src/
│   │   ├── routes/         # Routes API
│   │   ├── lib/            # Utilitaires
│   │   ├── tests/          # Tests
│   │   └── server.ts       # Point d'entrée
│   ├── prisma/
│   │   └── schema.prisma   # Schéma de base de données
│   └── package.json
│
├── src/                     # Frontend (Next.js)
│   ├── app/                # App Router
│   │   ├── auth/           # Pages d'authentification
│   │   ├── patient/        # Dashboard patient
│   │   ├── doctor/         # Dashboard docteur
│   │   ├── hospital/       # Dashboard hôpital
│   │   ├── monitoring/     # Monitoring système
│   │   └── page.tsx        # Page d'accueil
│   ├── components/         # Composants réutilisables
│   ├── lib/                # Utilitaires frontend
│   └── styles/
│
├── public/                  # Assets statiques
└── package.json
```

### Flux de Données

```
Client (Browser)
    ↓
Next.js Frontend (Port 3001)
    ↓
Axios HTTP Client
    ↓
Hono Backend API (Port 3000)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
```

---

## 🔌 API

### Endpoints Principaux

#### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion

#### Patients

- `GET /api/patients` - Liste des patients
- `GET /api/patients/:id` - Détails d'un patient
- `PUT /api/patients/:id` - Modifier un patient

#### Rendez-vous

- `GET /api/appointments` - Liste des rendez-vous
- `POST /api/appointments` - Créer un rendez-vous
- `PUT /api/appointments/:id` - Modifier un rendez-vous
- `DELETE /api/appointments/:id` - Annuler un rendez-vous

#### Monitoring (Super Admin)

- `GET /api/monitoring/stats` - Statistiques système
- `GET /api/monitoring/health` - Santé du système
- `GET /api/monitoring/metrics` - Métriques d'activité

### Documentation API

La documentation complète de l'API est disponible sur :
<http://localhost:3000/api/docs>

---

## 🧪 Tests

### Lancer les Tests

```bash
# Frontend
npm run test

# Backend
cd backend
npm run test

# Coverage
npm run test:coverage
```

### Type Checking

```bash
# Frontend
npm run typecheck

# Backend
cd backend
npm run typecheck
```

---

## 🚢 Déploiement

### Production Build

```bash
# Frontend
npm run build
npm run start

# Backend
cd backend
npm run build
npm run start
```

### Variables d'Environnement Production

Assurez-vous de définir :

- `NODE_ENV=production`
- `DATABASE_URL` avec votre base de données de production
- `JWT_SECRET` sécurisé
- `ENCRYPTION_KEY` sécurisé
- URLs de production pour CORS

---

## 👥 Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📞 Contact

- **Email** : <contact@samasante.sn>
- **Website** : <https://samasante.sn>
- **GitHub** : <https://github.com/votre-org/samasante-web>

---

## 🙏 Remerciements

- L'équipe de développement SamaSanté
- La communauté open source
- Tous les contributeurs

---

**Fait avec ❤️ pour améliorer l'accès aux soins au Sénégal**
