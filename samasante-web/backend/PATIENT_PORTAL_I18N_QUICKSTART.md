# 🚀 Guide Rapide - Portail Patient & i18n

## Démarrage (5 minutes)

### Étape 1: Migration de la base de données

```bash
cd backend

# Générer le client Prisma
npx prisma generate

# Appliquer la migration
npx prisma migrate dev --name add-patient-portal-and-i18n

# Démarrer le serveur
npm run dev
```

---

## 🏥 PORTAIL PATIENT - Tests

### 1. Créer un compte famille

```bash
TOKEN="your_jwt_token_here"

# Créer le compte famille
curl -X POST http://localhost:3000/api/patient-portal/family \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Ajouter un membre à la famille

```bash
curl -X POST http://localhost:3000/api/patient-portal/family/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 2,
    "relationship": "child",
    "canBookFor": true,
    "canViewRecords": true
  }'
```

### 3. Ajouter une vaccination

```bash
curl -X POST http://localhost:3000/api/patient-portal/vaccinations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 2,
    "vaccineName": "BCG",
    "vaccineType": "BCG",
    "administeredAt": "2025-01-15T10:00:00Z",
    "administeredBy": "Dr. Diop",
    "location": "Hôpital Principal Dakar",
    "doseNumber": 1,
    "totalDoses": 1
  }'
```

### 4. Ajouter une mesure de croissance

```bash
curl -X POST http://localhost:3000/api/patient-portal/growth \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 2,
    "measuredAt": "2025-12-15T10:00:00Z",
    "ageInMonths": 6,
    "weight": 7.5,
    "height": 67.0,
    "headCircumference": 43.0,
    "measuredBy": "Dr. Ndiaye"
  }'
```

### 5. Ajouter une métrique de santé

```bash
curl -X POST http://localhost:3000/api/patient-portal/metrics \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "type": "blood_pressure",
    "value": 120,
    "unit": "mmHg",
    "systolic": 120,
    "diastolic": 80,
    "measuredAt": "2025-12-15T08:00:00Z",
    "source": "device",
    "deviceName": "Omron M7"
  }'
```

### 6. Voir le dashboard patient

```bash
curl -X GET http://localhost:3000/api/patient-portal/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🌍 i18n - Tests

### 1. Voir les langues supportées

```bash
curl -X GET http://localhost:3000/api/i18n/languages
```

### 2. Ajouter des traductions françaises

```bash
curl -X POST http://localhost:3000/api/i18n/translations/batch \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "fr",
    "namespace": "common",
    "translations": {
      "welcome": "Bienvenue",
      "hello": "Bonjour",
      "goodbye": "Au revoir",
      "yes": "Oui",
      "no": "Non",
      "save": "Sauvegarder",
      "cancel": "Annuler",
      "delete": "Supprimer"
    }
  }'
```

### 3. Ajouter des traductions wolof

```bash
curl -X POST http://localhost:3000/api/i18n/translations/batch \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "wo",
    "namespace": "common",
    "translations": {
      "welcome": "Dalal ak djam",
      "hello": "Nanga def",
      "goodbye": "Ba beneen yoon",
      "yes": "Waaw",
      "no": "Déedéet",
      "save": "Denc",
      "cancel": "Bàyyi",
      "delete": "Far"
    }
  }'
```

### 4. Ajouter traductions médicales en wolof

```bash
curl -X POST http://localhost:3000/api/i18n/translations/batch \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "wo",
    "namespace": "medical",
    "translations": {
      "appointment": "Randevou",
      "doctor": "Doktoor",
      "patient": "Malade",
      "prescription": "Ordonans",
      "hospital": "Opital",
      "medicine": "Garab",
      "pain": "Metit",
      "fever": "Tàng"
    }
  }'
```

### 5. Récupérer traductions

```bash
# Français
curl -X GET "http://localhost:3000/api/i18n/translations?language=fr&namespace=common"

# Wolof
curl -X GET "http://localhost:3000/api/i18n/translations?language=wo&namespace=common"

# Anglais
curl -X GET "http://localhost:3000/api/i18n/translations?language=en&namespace=common"
```

### 6. Modifier préférences utilisateur

```bash
curl -X PUT http://localhost:3000/api/i18n/preferences \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "preferredLanguage": "wo",
    "dateFormat": "DD/MM/YYYY",
    "timeFormat": "24h",
    "timezone": "Africa/Dakar",
    "showTransliteration": true
  }'
```

### 7. Voir statistiques

```bash
curl -X GET http://localhost:3000/api/i18n/stats \
  -H "Authorization: Bearer $TOKEN"
```

### 8. Trouver clés manquantes

```bash
curl -X GET "http://localhost:3000/api/i18n/translations/missing?language=wo&base=fr" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Scénario Complet

### Famille Diop avec 3 enfants

```bash
TOKEN="your_token"

# 1. Mme Diop crée son compte famille
curl -X POST http://localhost:3000/api/patient-portal/family \
  -H "Authorization: Bearer $TOKEN"

# 2. Ajoute son premier enfant (Amadou, 6 mois)
curl -X POST http://localhost:3000/api/patient-portal/family/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 10,
    "relationship": "child",
    "canBookFor": true,
    "canViewRecords": true
  }'

# 3. Vaccination BCG pour Amadou
curl -X POST http://localhost:3000/api/patient-portal/vaccinations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 10,
    "vaccineName": "BCG",
    "vaccineType": "BCG",
    "administeredAt": "2025-06-15T10:00:00Z",
    "administeredBy": "Dr. Ndiaye",
    "location": "Centre de santé Médina",
    "doseNumber": 1,
    "totalDoses": 1,
    "reaction": "Aucune"
  }'

# 4. Mesure de croissance Amadou (6 mois)
curl -X POST http://localhost:3000/api/patient-portal/growth \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 10,
    "measuredAt": "2025-12-15T10:00:00Z",
    "ageInMonths": 6,
    "weight": 7.5,
    "height": 67.0,
    "headCircumference": 43.0,
    "measuredBy": "Dr. Ndiaye",
    "location": "Cabinet pédiatrique"
  }'

# 5. Ajoute deuxième enfant (Fatou, 3 ans)
curl -X POST http://localhost:3000/api/patient-portal/family/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 11,
    "relationship": "child",
    "canBookFor": true,
    "canViewRecords": true
  }'

# 6. Vaccination DTC pour Fatou
curl -X POST http://localhost:3000/api/patient-portal/vaccinations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 11,
    "vaccineName": "DTC",
    "vaccineType": "DTC",
    "administeredAt": "2025-12-10T14:00:00Z",
    "administeredBy": "Infirmière Sow",
    "location": "Hôpital Principal Dakar",
    "doseNumber": 3,
    "totalDoses": 3,
    "reaction": "Légère"
  }'

# 7. Voir le dashboard complet
curl -X GET http://localhost:3000/api/patient-portal/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 🌍 Configuration Multilingue

### Seed Initial des Traductions

Créez `backend/prisma/seed-i18n.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const translations = {
  common: {
    fr: {
      welcome: 'Bienvenue',
      hello: 'Bonjour',
      goodbye: 'Au revoir',
      yes: 'Oui',
      no: 'Non',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      view: 'Voir'
    },
    wo: {
      welcome: 'Dalal ak djam',
      hello: 'Nanga def',
      goodbye: 'Ba beneen yoon',
      yes: 'Waaw',
      no: 'Déedéet',
      save: 'Denc',
      cancel: 'Bàyyi',
      delete: 'Far',
      edit: 'Soppi',
      view: 'Xool'
    },
    en: {
      welcome: 'Welcome',
      hello: 'Hello',
      goodbye: 'Goodbye',
      yes: 'Yes',
      no: 'No',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View'
    }
  },
  medical: {
    fr: {
      appointment: 'Rendez-vous',
      doctor: 'Médecin',
      patient: 'Patient',
      prescription: 'Ordonnance',
      hospital: 'Hôpital',
      medicine: 'Médicament',
      pain: 'Douleur',
      fever: 'Fièvre'
    },
    wo: {
      appointment: 'Randevou',
      doctor: 'Doktoor',
      patient: 'Malade',
      prescription: 'Ordonans',
      hospital: 'Opital',
      medicine: 'Garab',
      pain: 'Metit',
      fever: 'Tàng'
    },
    en: {
      appointment: 'Appointment',
      doctor: 'Doctor',
      patient: 'Patient',
      prescription: 'Prescription',
      hospital: 'Hospital',
      medicine: 'Medicine',
      pain: 'Pain',
      fever: 'Fever'
    }
  }
}

async function main() {
  for (const [namespace, languages] of Object.entries(translations)) {
    for (const [language, keys] of Object.entries(languages)) {
      for (const [key, value] of Object.entries(keys)) {
        await prisma.translation.upsert({
          where: {
            key_language_namespace: {
              key,
              language,
              namespace
            }
          },
          update: { value },
          create: {
            key,
            language,
            namespace,
            value
          }
        })
      }
    }
  }

  console.log('✅ Traductions seed terminé!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Exécuter:

```bash
npx tsx prisma/seed-i18n.ts
```

---

## ✅ Checklist de Validation

### Portail Patient

- [ ] Compte famille créé
- [ ] Membre ajouté
- [ ] Vaccination enregistrée
- [ ] Mesure de croissance ajoutée
- [ ] Document de santé uploadé
- [ ] Métrique de santé enregistrée
- [ ] Dashboard affiché

### i18n

- [ ] Traductions FR ajoutées
- [ ] Traductions WO ajoutées
- [ ] Traductions EN ajoutées
- [ ] Préférences utilisateur modifiées
- [ ] Langues listées
- [ ] Statistiques affichées
- [ ] Clés manquantes détectées

---

## 🆘 Dépannage

### Erreur: "Property 'familyAccount' does not exist"

**Solution:** Régénérer le client Prisma

```bash
npx prisma generate
```

### Erreur: "Patient ID non trouvé"

**Solution:** L'utilisateur doit avoir un `patientId`

```bash
# Vérifier dans Prisma Studio
npx prisma studio
```

### Erreur: "Compte famille déjà existant"

**Solution:** Normal si déjà créé. Utiliser GET pour récupérer

```bash
curl -X GET http://localhost:3000/api/patient-portal/family \
  -H "Authorization: Bearer $TOKEN"
```

### Traductions ne s'affichent pas

**Solution:** Vérifier qu'elles existent

```bash
curl -X GET "http://localhost:3000/api/i18n/translations?language=fr"
```

---

## 📚 Documentation Complète

Pour plus de détails:

- [PATIENT_PORTAL_I18N_IMPLEMENTATION.md](./PATIENT_PORTAL_I18N_IMPLEMENTATION.md) - Documentation complète

---

**Bon test! 🚀**

Si tout fonctionne, vous avez maintenant:

- ✅ Portail patient complet avec gestion familiale
- ✅ Carnet de vaccination numérique
- ✅ Courbes de croissance pour enfants
- ✅ Support multilingue (FR/WO/EN)
- ✅ 23 nouveaux endpoints API
- ✅ 8 nouveaux modèles de données
