# 🚀 Guide de Démarrage Rapide - Chat & Pharmacie

## Étape 1: Mise à jour de la base de données (2 min)

```bash
cd backend

# Générer le client Prisma avec les nouveaux modèles
npx prisma generate

# Créer et appliquer la migration
npx prisma migrate dev --name add-chat-and-pharmacy-systems

# Démarrer le serveur
npm run dev
```

## Étape 2: Tester le Chat (5 min)

### 1. Créer une conversation

```bash
# Remplacez YOUR_TOKEN par votre JWT
TOKEN="your_jwt_token_here"

# Créer une conversation directe
curl -X POST http://localhost:3000/api/chat/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "direct",
    "participantIds": [2]
  }'
```

### 2. Envoyer un message

```bash
# Remplacez :id par l'ID de la conversation créée
curl -X POST http://localhost:3000/api/chat/conversations/1/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Bonjour, comment allez-vous?",
    "type": "text"
  }'
```

### 3. Récupérer les messages

```bash
curl -X GET http://localhost:3000/api/chat/conversations/1/messages \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Lister les conversations

```bash
curl -X GET http://localhost:3000/api/chat/conversations \
  -H "Authorization: Bearer $TOKEN"
```

## Étape 3: Tester la Pharmacie (10 min)

### 1. Créer un médicament

```bash
curl -X POST http://localhost:3000/api/pharmacy/medications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Paracétamol 500mg",
    "genericName": "Paracétamol",
    "category": "antalgique",
    "form": "comprimé",
    "dosage": "500mg",
    "barcode": "3400936459076",
    "dci": "Paracétamol",
    "manufacturer": "Sanofi",
    "requiresPrescription": false,
    "unitPrice": 50,
    "description": "Antalgique et antipyrétique",
    "sideEffects": "Rares: réactions allergiques",
    "contraindications": "Insuffisance hépatique sévère"
  }'
```

### 2. Ajouter au stock

```bash
# Remplacez medicationId par l'ID du médicament créé
curl -X POST http://localhost:3000/api/pharmacy/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicationId": 1,
    "quantity": 1000,
    "minQuantity": 100,
    "maxQuantity": 2000,
    "batchNumber": "LOT2025-001",
    "expiryDate": "2026-12-31",
    "location": "Étagère A1"
  }'
```

### 3. Enregistrer une sortie

```bash
# Remplacez :id par l'ID de l'item d'inventaire
curl -X POST http://localhost:3000/api/pharmacy/inventory/1/movements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "out",
    "quantity": 20,
    "reason": "Prescription patient",
    "notes": "Ordonnance Dr. Diop"
  }'
```

### 4. Voir l'inventaire

```bash
curl -X GET http://localhost:3000/api/pharmacy/inventory \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Voir les alertes

```bash
curl -X GET http://localhost:3000/api/pharmacy/alerts \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Statistiques

```bash
curl -X GET http://localhost:3000/api/pharmacy/stats \
  -H "Authorization: Bearer $TOKEN"
```

## Étape 4: Scénarios d'utilisation

### Scénario 1: Chat post-consultation

```bash
# 1. Créer une conversation liée à un rendez-vous
curl -X POST http://localhost:3000/api/chat/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "consultation",
    "participantIds": [2],
    "appointmentId": 123
  }'

# 2. Le médecin envoie un message de suivi
curl -X POST http://localhost:3000/api/chat/conversations/1/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Bonjour, comment vous sentez-vous après le traitement?",
    "type": "text"
  }'

# 3. Partager un document
curl -X POST http://localhost:3000/api/chat/conversations/1/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Voici votre ordonnance",
    "type": "file",
    "attachments": [{
      "fileName": "ordonnance.pdf",
      "fileUrl": "/uploads/ordonnance.pdf",
      "fileType": "application/pdf",
      "fileSize": 245678
    }]
  }'
```

### Scénario 2: Gestion de stock complète

```bash
# 1. Créer plusieurs médicaments
# (Répéter pour Amoxicilline, Ibuprofène, etc.)

# 2. Ajouter au stock avec différents lots
curl -X POST http://localhost:3000/api/pharmacy/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicationId": 1,
    "quantity": 500,
    "minQuantity": 50,
    "batchNumber": "LOT2025-001",
    "expiryDate": "2026-06-30",
    "location": "Étagère A1"
  }'

# 3. Simuler des ventes
curl -X POST http://localhost:3000/api/pharmacy/inventory/1/movements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "out",
    "quantity": 30,
    "reason": "Vente comptoir"
  }'

# 4. Vérifier les alertes générées
curl -X GET http://localhost:3000/api/pharmacy/alerts \
  -H "Authorization: Bearer $TOKEN"

# 5. Réapprovisionner
curl -X POST http://localhost:3000/api/pharmacy/inventory/1/movements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "in",
    "quantity": 200,
    "reason": "Réapprovisionnement",
    "notes": "Commande fournisseur #2025-042"
  }'
```

## Étape 5: Vérification

### Vérifier que tout fonctionne

```bash
# 1. Conversations créées
curl -X GET http://localhost:3000/api/chat/conversations \
  -H "Authorization: Bearer $TOKEN" | jq

# 2. Messages envoyés
curl -X GET http://localhost:3000/api/chat/conversations/1/messages \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Médicaments dans le catalogue
curl -X GET http://localhost:3000/api/pharmacy/medications \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Inventaire à jour
curl -X GET http://localhost:3000/api/pharmacy/inventory \
  -H "Authorization: Bearer $TOKEN" | jq

# 5. Historique des mouvements
curl -X GET http://localhost:3000/api/pharmacy/inventory/1/movements \
  -H "Authorization: Bearer $TOKEN" | jq

# 6. Statistiques
curl -X GET http://localhost:3000/api/pharmacy/stats \
  -H "Authorization: Bearer $TOKEN" | jq
```

## Étape 6: Données de test (Optionnel)

### Script de seed pour données de test

Créez `backend/prisma/seed-chat-pharmacy.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Créer des médicaments de test
  const medications = await Promise.all([
    prisma.medication.create({
      data: {
        name: 'Paracétamol 500mg',
        genericName: 'Paracétamol',
        category: 'antalgique',
        form: 'comprimé',
        dosage: '500mg',
        requiresPrescription: false,
        unitPrice: 50
      }
    }),
    prisma.medication.create({
      data: {
        name: 'Amoxicilline 1g',
        genericName: 'Amoxicilline',
        category: 'antibiotique',
        form: 'comprimé',
        dosage: '1g',
        requiresPrescription: true,
        unitPrice: 150
      }
    }),
    prisma.medication.create({
      data: {
        name: 'Ibuprofène 400mg',
        genericName: 'Ibuprofène',
        category: 'anti-inflammatoire',
        form: 'comprimé',
        dosage: '400mg',
        requiresPrescription: false,
        unitPrice: 75
      }
    })
  ])

  console.log('✅ Médicaments créés:', medications.length)

  // Créer des conversations de test
  // (À adapter selon vos utilisateurs existants)
  
  console.log('✅ Seed terminé!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Exécuter:

```bash
npx tsx prisma/seed-chat-pharmacy.ts
```

## 🎯 Checklist de Validation

- [ ] Migration Prisma appliquée
- [ ] Serveur démarré sans erreur
- [ ] Conversation créée
- [ ] Message envoyé
- [ ] Médicament créé
- [ ] Stock ajouté
- [ ] Mouvement enregistré
- [ ] Alertes visibles
- [ ] Statistiques affichées

## 🆘 Dépannage

### Erreur: "Property 'conversation' does not exist"

**Solution:** Régénérer le client Prisma

```bash
npx prisma generate
```

### Erreur: "Migration failed"

**Solution:** Vérifier la base de données

```bash
npx prisma studio
# Vérifier que les tables existent
```

### Erreur: "Organization non définie"

**Solution:** L'utilisateur doit avoir un `organizationId`

```bash
# Mettre à jour l'utilisateur
npx prisma studio
# Ou via SQL
```

### Erreur: "Accès refusé"

**Solution:** Vérifier le rôle de l'utilisateur

- Chat: DOCTOR, PATIENT, HOSPITAL_ADMIN
- Pharmacie: HOSPITAL_ADMIN, DOCTOR

## 📚 Documentation Complète

Pour plus de détails, consultez:

- `CHAT_PHARMACY_IMPLEMENTATION.md` - Documentation complète
- `prisma/schema.prisma` - Modèles de données
- `src/routes/chat.ts` - API Chat
- `src/routes/pharmacy.ts` - API Pharmacie

---

**Bon test! 🚀**

Si tout fonctionne, vous avez maintenant:

- ✅ Un système de chat complet
- ✅ Une gestion de pharmacie professionnelle
- ✅ 19 nouveaux endpoints API
- ✅ 8 nouveaux modèles de données
