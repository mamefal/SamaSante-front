# 🚀 Guide Rapide - Facturation & Paiements

## Démarrage (5 minutes)

### Étape 1: Migration de la base de données

```bash
cd backend

# Générer le client Prisma
npx prisma generate

# Appliquer la migration
npx prisma migrate dev --name add-billing-system

# Démarrer le serveur
npm run dev
```

---

## 💰 Tests du Système de Facturation

### 1. Créer les Plans Tarifaires (Super Admin)

```bash
TOKEN="super_admin_token"

# Plan Starter
curl -X POST http://localhost:3000/api/billing/plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Starter",
    "slug": "starter",
    "description": "Pour petites cliniques",
    "monthlyPrice": 50000,
    "yearlyPrice": 540000,
    "maxDoctors": 5,
    "maxPatients": 100,
    "features": ["Gestion RDV", "Dossiers"],
    "includesChat": false
  }'

# Plan Professional
curl -X POST http://localhost:3000/api/billing/plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Professional",
    "slug": "professional",
    "description": "Pour cliniques moyennes",
    "monthlyPrice": 150000,
    "maxDoctors": 20,
    "features": ["Tout Starter", "Chat", "Pharmacie"],
    "includesChat": true,
    "includesPharmacy": true
  }'
```

### 2. Voir les Plans (Public)

```bash
curl -X GET http://localhost:3000/api/billing/plans
```

### 3. Souscrire à un Abonnement (Hostpital Admin)

```bash
TOKEN="hospital_admin_token"

# Souscription au plan Professional (Essai 30 jours)
curl -X POST http://localhost:3000/api/billing/subscriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": 1,
    "planId": 2,
    "billingCycle": "monthly",
    "startDate": "2025-12-15T00:00:00Z",
    "isTrial": true,
    "trialDays": 30
  }'
```

### 4. Vérifier l'Abonnement

```bash
curl -X GET http://localhost:3000/api/billing/subscriptions \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Créer une Facture Manuelle (Consultation)

```bash
curl -X POST http://localhost:3000/api/billing/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": 1,
    "type": "consultation",
    "appointmentId": 123,
    "dueDate": "2025-12-30T00:00:00Z",
    "items": [
      {
        "description": "Consultation Générale",
        "quantity": 1,
        "unitPrice": 15000
      },
      {
        "description": "Analyses",
        "quantity": 1,
        "unitPrice": 10000
      }
    ]
  }'
```

### 6. Payer une Facture

```bash
# Récupérer l'ID de la facture d'abord
# Puis payer:
curl -X POST http://localhost:3000/api/billing/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": 1,
    "amount": 25000,
    "paymentMethod": "mobile_money",
    "provider": "orange_money",
    "transactionId": "OM123456789",
    "notes": "Paiement Orange Money"
  }'
```

### 7. Voir les Statistiques

```bash
curl -X GET http://localhost:3000/api/billing/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Scénario Complet de Monétisation

### 1. Configuration Initiale (Day 0)

L'administrateur système configure les plans tarifaires. C'est la base du modèle SaaS.

- **Action:** `POST /plans`
- **Résultat:** Plans disponibles sur la page de pricing.

### 2. Onboarding Client (Day 1)

Une clinique s'inscrit et choisit un plan.

- **Action:** `POST /subscriptions`
- **Résultat:** Accès immédiat aux fonctionnalités (Chat, Pharmacie) grâce à `includesChat: true`.

### 3. Fin d'Essai (Day 30)

Le système génère la première facture.

- **Action:** Automatique (via Cron job simulé ou trigger)
- **Résultat:** Une facture `pending` est créée.

### 4. Paiement (Day 30+)

La clinique paie sa facture.

- **Action:** `POST /payments`
- **Résultat:** La facture passe à `paid`, l'abonnement continue.

---

## 🆘 Dépannage

### Erreur: "Plan non trouvé"

L'ID du plan envoyé dans la souscription n'existe pas.

- **Solution:** Vérifiez les plans disponibles avec `GET /api/billing/plans` et utilisez le bon `id`.

### Erreur: "Organisation non définie"

Le token utilisé n'appartient pas à un Hospital Admin lié à une organisation.

- **Solution:** Connectez-vous avec un utilisateur ayant le rôle `HOSPITAL_ADMIN` et un `organizationId` valide.

### Erreur: "Montant incorrect"

Le paiement ne correspond pas au total de la facture.

- **Solution:** Vérifiez le montant total de la facture via `GET /billing/invoices/:id`.

---

**Le système d'argent est prêt à l'emploi! 💸**
