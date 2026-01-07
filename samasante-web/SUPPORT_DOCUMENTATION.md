# Documentation de Support Technique SamaTante

Ce document fournit une vue d'ensemble complète de l'application SaaS **SamaTante**. Il est conçu pour servir de référence pour la rédaction de User Stories, les plans de déploiement, et la compréhension de l'architecture technique.

---

## 1. Rôles et Responsabilités

L'application gère 4 rôles principaux, définis dans le système de permission (`Role` enum).

### 👑 Super Admin (Administrateur Plateforme)

**Objectif :** Gérer l'infrastructure SaaS globale, les organisations (hôpitaux/cliniques) et surveiller la santé du système.

* **Capacités Clés :**
  * **Gestion des Organisations :** Créer, modifier, activer/désactiver des hôpitaux et cliniques.
  * **Vue Globale :** Accès aux statistiques transversales (nombre total de patients, médecins, revenus SaaS).
  * **Maintenance :** Accès aux logs d'audit, backups, et monitoring du système.
  * **Sécurité :** Gestion des administrateurs d'hôpitaux (création des comptes initiaux).

### 🏥 Hospital Admin (Administrateur Hôpital/Clinique)

**Objectif :** Gérer les opérations quotidiennes d'un établissement de santé spécifique.

* **Capacités Clés :**
  * **Gestion du Personnel :** Créer et gérer les comptes médecins et secrétaires.
  * **Structure Hospitalière :** Configurer les départements (Cardiologie, Pédiatrie...), les salles et les équipements.
  * **Gestion des Stocks (Pharmacie) :** Suivre l'inventaire des médicaments, gérer les commandes fournisseurs et les alertes de stock.
  * **Facturation :** Gérer les tarifs, les factures et les paiements pour son établissement.
  * **Admissions :** Gérer les lits et les hospitalisations.

### 👨‍⚕️ Médecin (Doctor)

**Objectif :** Fournir des soins aux patients et gérer le dossier médical.

* **Capacités Clés :**
  * **Consultations :** Voir son planning, gérer les rendez-vous, démarrer des téléconsultations.
  * **Dossier Médical :** Accès complet au dossier patient (antécédents, allergies).
  * **Actes Médicaux :** Rédiger des notes de consultation, prescrire des ordonnances, demander des examens de laboratoire (Lab Orders).
  * **Documents :** Générer des certificats médicaux et des lettres de référence.
  * **Urgences :** Voir et traiter les patients arrivant aux urgences.

### 👤 Patient

**Objectif :** Gérer sa santé et interagir avec les prestataires de soins.

* **Capacités Clés :**
  * **Prise de Rendez-vous :** Rechercher des médecins et réserver des créneaux (présentiel ou vidéo).
  * **Accès Dossier :** Voir ses propres documents médicaux (ordonnances, résultats d'analyse).
  * **Suivi :** Carnet de vaccination, courbes de croissance (pour enfants), constantes vitales.
  * **Interaction :** Recevoir des notifications et des rappels.

---

## 2. Architecture Technique

### Stack Technologique

* **Frontend :** Next.js 15 (App Router), React 19, Tailwind CSS 4, Radix UI.
* **Backend :** Node.js avec Hono (Framework léger et rapide).
* **Base de Données :**
  * *Dev :* SQLite.
  * *Prod :* PostgreSQL (supporté via `pg`).
  * *ORM :* Prisma.
* **Cache & Files d'attente :** Redis (avec `ioredis` et `BullMQ`).
* **Temps Réel :** Socket.io pour les notifications et le chat.

### Diagramme d'Architecture (Simplifié)

```mermaid
graph TD
    Client[Navigateur Client (Next.js)] -->|API REST / HTTPS| LB[Load Balancer / Nginx]
    LB --> Server[Serveur Node.js (Hono)]
    
    Server -->|ORM| DB[(Base de Données PostgreSQL)]
    Server -->|Cache/Queues| Redis[(Redis)]
    
    Server -->|WebSockets| Client
    
    subgraph Services Externes
        Email[Service Email (SMTP)]
        SMS[Service SMS (Twilio)]
    end
    
    Server --> Email
    Server --> SMS
```

### Modèle de Données (Entités Principales)

* **User :** Entité centrale d'authentification.
* **Organization :** Tenant (Hôpital/Clinique). Relation `1-n` avec Doctors et Patients (parfois).
* **MedicalFile :** Dossier unique par patient.
* **Appointment :** Pivot entre Patient, Doctor et Organization.

---

## 3. Guide pour User Stories

Voici des templates pour rédiger vos User Stories, basés sur les capacités actuelles.

### Épopée : Gestion Médicale (Médecin)

* **US-01 :** En tant que **Médecin**, je veux **voir mon calendrier de rendez-vous** pour organiser ma journée.
* **US-02 :** En tant que **Médecin**, je veux **créer une ordonnance numérique** afin que le patient puisse l'imprimer ou l'envoyer à sa pharmacie.
* **US-03 :** En tant que **Médecin**, je veux **consulter l'historique médical** d'un patient avant la consultation pour mieux le diagnostiquer.

### Épopée : Gestion Administrative (Admin Hôpital)

* **US-04 :** En tant que **Admin Hôpital**, je veux **ajouter un nouveau médecin** au système et lui assigner un département.
* **US-05 :** En tant que **Admin Hôpital**, je veux **suivre le stock de médicaments** et recevoir une alerte quand un seuil critique est atteint.

### Épopée : Portail Patient

* **US-06 :** En tant que **Patient**, je veux **réserver un rendez-vous en ligne** en filtrant par spécialité et disponibilité.
* **US-07 :** En tant que **Patient**, je veux **télécharger mes résultats d'analyse** depuis mon espace personnel sans me déplacer.

---

## 4. Plan de Déploiement

### Pré-requis

* Serveur Linux (Ubuntu 22.04 recommandé) ou Service Cloud (AWS/GCP/DigitalOcean).
* Node.js 20+.
* Docker & Docker Compose (Recommandé pour la production).
* Domaine configuré avec SSL (HTTPS).

### Étapes de Déploiement (Docker)

1. **Préparation de l'environnement :**
    * Cloner le dépôt.
    * Configurer le fichier `.env` avec les secrets de production (DB password, JWT secret, clés API externes).

2. **Base de Données :**
    * Lancer le conteneur PostgreSQL via Docker Compose.
    * Exécuter les migrations Prisma : `npx prisma migrate deploy`.

3. **Backend (API) :**
    * Builder l'image Docker du backend.
    * Lancer le conteneur API exposé sur le port interne (ex: 3000).

4. **Frontend (Next.js) :**
    * Builder l'application Next.js : `npm run build`.
    * Lancer le serveur Next.js (souvent via un process manager comme PM2 ou Docker).

5. **Reverse Proxy (Nginx) :**
    * Configurer Nginx pour rediriger le trafic :
        * `/api/*` -> Vers le conteneur Backend.
        * `/*` -> Vers le conteneur Frontend.
    * Configurer SSL avec Let's Encrypt / Certbot.

### Checklist de Mise en Production

* [ ] Changer tous les mots de passe par défaut.
* [ ] Désactiver les logs de debug (`pino` level à 'info' ou 'error').
* [ ] Vérifier la connexion SMTP pour les emails.
* [ ] Configurer les backups automatiques de la base de données (Postgres dump).
