
# 🎯 Guide Pratique - Scénarios d'Utilisation Réels

## Vue d'ensemble

Ce guide présente des scénarios réels d'utilisation de la plateforme SamaSanté avec tous les systèmes intégrés.

---

## 📅 SCÉNARIO 1: Rendez-vous Complet

### Acteurs

- **Mme Diop** (Patient, parle Wolof)
- **Dr. Ndiaye** (Médecin, parle Français)
- **Hôpital Principal Dakar**

### Déroulement

#### Jour 1: Prise de rendez-vous

```
1. Mme Diop se connecte (interface en Wolof)
2. Prend RDV avec Dr. Ndiaye pour le 15/12 à 10h
3. 🔔 Notification automatique envoyée:
   - Email (FR): "Rendez-vous confirmé"
   - SMS (WO): "Randevou bi dafa am"
   - In-app (WO): Notification visible
```

#### Jour 14: Rappel automatique

```
4. 24h avant le RDV
5. 🔔 Rappel automatique envoyé:
   - Email (FR): "Rappel: RDV demain à 10h"
   - SMS (WO): "Xaalis: Randevou bi suba ci 10h"
   - Push (WO): Notification mobile
```

#### Jour 15: Consultation

```
6. Mme Diop arrive à l'hôpital
7. Dr. Ndiaye la consulte
8. Diagnostic: Hypertension
9. Dr. Ndiaye crée une ordonnance:
   - Amlodipine 5mg - 1x/jour - 30 jours
   - Hydrochlorothiazide 12.5mg - 1x/jour - 30 jours
10. 💊 Système vérifie disponibilité en stock:
    - Amlodipine: ✅ 500 unités disponibles
    - Hydrochlorothiazide: ⚠️ 45 unités (stock bas)
11. 💊 Stock déduit automatiquement
12. 💊 Alerte générée pour Hydrochlorothiazide
```

#### Après consultation

```
13. 💬 Conversation automatique créée
14. Dr. Ndiaye envoie message de suivi (FR):
    "Bonjour Mme Diop, prenez bien vos médicaments..."
15. Mme Diop reçoit notification (WO)
16. Elle répond en Wolof via le chat
17. Dr. Ndiaye voit le message traduit
```

---

## 👨‍👩‍👧‍👦 SCÉNARIO 2: Famille avec Enfants

### Acteurs

- **M. Fall** (Chef de famille)
- **Mme Fall** (Épouse)
- **Amadou** (6 mois)
- **Fatou** (3 ans)
- **Dr. Sow** (Pédiatre)

### Déroulement

#### Création du compte famille

```typescript
// M. Fall crée son compte famille
POST /api/patient-portal/family

// Ajoute Mme Fall
POST /api/patient-portal/family/members
{
  "patientId": 101,
  "relationship": "spouse",
  "canBookFor": true,
  "canViewRecords": true
}

// Ajoute Amadou (6 mois)
POST /api/patient-portal/family/members
{
  "patientId": 102,
  "relationship": "child",
  "canBookFor": true,
  "canViewRecords": true
}

// Ajoute Fatou (3 ans)
POST /api/patient-portal/family/members
{
  "patientId": 103,
  "relationship": "child",
  "canBookFor": true,
  "canViewRecords": true
}
```

#### Vaccination Amadou (6 mois)

```
1. M. Fall prend RDV pour Amadou avec Dr. Sow
2. Consultation de vaccination
3. Dr. Sow administre:
   - BCG
   - DTC 1ère dose
   - Polio 1ère dose
4. 🏥 Enregistrement dans le carnet:
```

```typescript
POST /api/patient-portal/vaccinations
{
  "patientId": 102,
  "vaccineName": "BCG",
  "administeredAt": "2025-12-15T10:00:00Z",
  "doseNumber": 1,
  "totalDoses": 1,
  "nextDoseDate": null
}

POST /api/patient-portal/vaccinations
{
  "patientId": 102,
  "vaccineName": "DTC",
  "administeredAt": "2025-12-15T10:15:00Z",
  "doseNumber": 1,
  "totalDoses": 3,
  "nextDoseDate": "2026-02-15T10:00:00Z"  // Dans 2 mois
}
```

```
5. 🔔 Rappel programmé pour DTC 2ème dose
6. 🏥 Mesure de croissance enregistrée:
```

```typescript
POST /api/patient-portal/growth
{
  "patientId": 102,
  "measuredAt": "2025-12-15T10:30:00Z",
  "ageInMonths": 6,
  "weight": 7.5,      // kg
  "height": 67.0,     // cm
  "headCircumference": 43.0,  // cm
  "measuredBy": "Dr. Sow"
}
// BMI calculé automatiquement: 16.7
// Percentiles selon OMS calculés
```

#### Suivi Fatou (3 ans)

```
7. Même jour, consultation Fatou
8. Vaccination DTC 3ème dose (rappel)
9. Mesure de croissance:
   - Poids: 14.2 kg
   - Taille: 95 cm
   - BMI: 15.7
10. 🏥 Courbes de croissance générées
11. Comparaison avec normes OMS
12. Tout est normal ✅
```

#### Dashboard Famille

```
13. M. Fall consulte le dashboard:
    - 4 membres de la famille
    - 5 vaccinations enregistrées
    - 2 courbes de croissance
    - Prochains RDV
    - Rappels vaccinations
```

---

## 💊 SCÉNARIO 3: Gestion de Pharmacie

### Acteurs

- **Mme Sarr** (Pharmacienne, Hospital Admin)
- **Hôpital Principal Dakar**

### Déroulement

#### Lundi matin: Vérification des alertes

```
1. Mme Sarr se connecte
2. 💊 Dashboard pharmacie affiche:
   - 245 médicaments en stock
   - 12 alertes stock bas
   - 8 péremptions proches
   - 2 ruptures de stock
   - Valeur totale: 12,500,000 FCFA
```

```typescript
GET /api/pharmacy/alerts

// Réponse:
[
  {
    "type": "low_stock",
    "severity": "warning",
    "message": "Stock bas: Hydrochlorothiazide - 45 unités",
    "inventoryItem": {
      "medication": {
        "name": "Hydrochlorothiazide 12.5mg"
      }
    }
  },
  {
    "type": "expiring_soon",
    "severity": "warning",
    "message": "Expire dans 25 jours: Amoxicilline",
    "inventoryItem": {
      "medication": {
        "name": "Amoxicilline 1g"
      }
    }
  },
  {
    "type": "out_of_stock",
    "severity": "critical",
    "message": "Rupture de stock: Paracétamol 1g",
    "inventoryItem": {
      "medication": {
        "name": "Paracétamol 1g"
      }
    }
  }
]
```

#### Réapprovisionnement

```
3. Mme Sarr passe commande fournisseur
4. Réception de la livraison
5. Enregistrement des entrées:
```

```typescript
// Paracétamol 1g
POST /api/pharmacy/inventory/15/movements
{
  "type": "in",
  "quantity": 1000,
  "reason": "Réapprovisionnement",
  "notes": "Commande #2025-042, Fournisseur Sanofi"
}

// Hydrochlorothiazide
POST /api/pharmacy/inventory/23/movements
{
  "type": "in",
  "quantity": 500,
  "reason": "Réapprovisionnement",
  "notes": "Commande #2025-042"
}
```

```
6. 💊 Alertes résolues automatiquement
7. 💊 Stock mis à jour:
   - Paracétamol: 0 → 1000 ✅
   - Hydrochlorothiazide: 45 → 545 ✅
```

#### Gestion des péremptions

```
8. Mme Sarr vérifie les médicaments expirant bientôt
9. Amoxicilline expire dans 25 jours
10. Décision: Promotion pour écouler le stock
11. Si non vendu: Retrait et destruction
```

```typescript
// Dans 30 jours si non vendu
POST /api/pharmacy/inventory/34/movements
{
  "type": "expired",
  "quantity": 120,
  "reason": "Médicament périmé",
  "notes": "Lot 2024-156, destruction selon protocole"
}
```

---

## 🌍 SCÉNARIO 4: Utilisateur Multilingue

### Acteurs

- **M. Mbaye** (Patient, parle uniquement Wolof)
- **Dr. Diallo** (Médecin, parle Français et Wolof)

### Déroulement

#### Première connexion

```
1. M. Mbaye se connecte
2. Système détecte langue navigateur: Wolof
3. Interface affichée en Wolof
4. M. Mbaye configure ses préférences:
```

```typescript
PUT /api/i18n/preferences
{
  "preferredLanguage": "wo",
  "dateFormat": "DD/MM/YYYY",
  "timeFormat": "24h",
  "timezone": "Africa/Dakar",
  "showTransliteration": true
}
```

#### Navigation dans l'application

```
5. Tous les textes affichés en Wolof:
   - Menu: "Randevou" (Rendez-vous)
   - Boutons: "Denc" (Sauvegarder), "Bàyyi" (Annuler)
   - Messages: "Dalal ak djam" (Bienvenue)
```

#### Prise de rendez-vous

```
6. M. Mbaye prend RDV
7. 🔔 Notification en Wolof:
   - SMS: "Randevou bi dafa am ci 15/12 ci 10h"
   - Email: Sujet et contenu en Wolof
   - In-app: "Randevou bu bees bi dafa am"
```

#### Consultation

```
8. Dr. Diallo voit l'interface en Français
9. Peut consulter le dossier de M. Mbaye
10. Termes médicaux en Français
11. Communication facilitée
```

#### Chat post-consultation

```
12. M. Mbaye envoie message en Wolof
13. Dr. Diallo reçoit notification
14. Peut répondre en Français ou Wolof
15. Système gère les deux langues
```

---

## 📊 SCÉNARIO 5: Dashboard Hospital Admin

### Acteur

- **M. Dieng** (Hospital Admin)

### Vue d'ensemble quotidienne

```
┌─────────────────────────────────────────────────────────────────┐
│                  DASHBOARD HOSPITAL ADMIN                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 STATISTIQUES GÉNÉRALES                                      │
│  ├─ Patients actifs: 1,245                                      │
│  ├─ Médecins: 45                                                │
│  ├─ Rendez-vous aujourd'hui: 87                                 │
│  └─ Taux d'occupation: 78%                                      │
│                                                                  │
│  🔔 NOTIFICATIONS (Dernières 24h)                               │
│  ├─ Envoyées: 1,234                                             │
│  │  ├─ SMS: 456                                                 │
│  │  ├─ Email: 678                                               │
│  │  └─ Push: 100                                                │
│  └─ Taux de lecture: 89%                                        │
│                                                                  │
│  💬 CHAT                                                         │
│  ├─ Conversations actives: 156                                  │
│  ├─ Messages échangés: 2,345                                    │
│  └─ Temps de réponse moyen: 12 min                              │
│                                                                  │
│  💊 PHARMACIE                                                    │
│  ├─ Total items: 245                                            │
│  ├─ Valeur stock: 12,500,000 FCFA                               │
│  ├─ ⚠️ Alertes actives: 15                                      │
│  │  ├─ Stock bas: 12                                            │
│  │  ├─ Péremption proche: 8                                     │
│  │  ├─ Rupture: 2                                               │
│  │  └─ Périmés: 2                                               │
│  └─ Mouvements du jour: 45                                      │
│                                                                  │
│  🏥 PORTAIL PATIENT                                              │
│  ├─ Comptes familiaux: 234                                      │
│  ├─ Vaccinations enregistrées: 567                              │
│  ├─ Courbes de croissance: 345                                  │
│  └─ Documents uploadés: 1,234                                   │
│                                                                  │
│  🌍 i18n                                                         │
│  ├─ Français: 67%                                                │
│  ├─ Wolof: 28%                                                   │
│  └─ Anglais: 5%                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Points Clés

### Intégration Complète

Tous les systèmes fonctionnent ensemble de manière transparente:

- Notifications → Rendez-vous
- Chat → Consultations
- Pharmacie → Prescriptions
- Portail Patient → Famille
- i18n → Toute l'interface

### Expérience Utilisateur

- Interface dans la langue préférée
- Notifications pertinentes
- Communication facilitée
- Suivi médical complet

### Efficacité Opérationnelle

- Gestion automatisée
- Alertes proactives
- Traçabilité complète
- Statistiques en temps réel

---

**Ces scénarios montrent la puissance de SamaSanté v2.0!** 🎉

Pour plus de détails, consultez:

- [FINAL_COMPLETE_SUMMARY.md](./FINAL_COMPLETE_SUMMARY.md)
- [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)
