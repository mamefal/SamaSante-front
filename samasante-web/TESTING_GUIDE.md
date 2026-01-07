# 🧪 Guide de Test - Données Réelles SamaSante

## 📋 Prérequis

### Serveurs Démarrés

- ✅ Backend: `http://localhost:3000` (port 3000)
- ✅ Frontend: `http://localhost:3001` (port 3001)
- ✅ Redis: Connecté et opérationnel

### Données de Test

Exécutez le script de seed pour avoir des données initiales :

```bash
cd backend
npx tsx prisma/seed-dashboard.ts
```

---

## 🏥 Tests Dashboard Hôpital

### Accès

1. Connectez-vous avec un compte **Hospital Admin**
2. Naviguez vers `/hospital/dashboard`

### Tests à Effectuer

#### ✅ Test 1: Sources de Réservation

**Objectif**: Vérifier que le graphique affiche des données réelles

**Étapes**:

1. Observez le graphique "Sources de Réservation" (Pie Chart)
2. Vérifiez qu'il affiche deux catégories:
   - Mobile App
   - Direct/Web
3. Les valeurs doivent correspondre aux rendez-vous dans la base

**Résultat Attendu**:

- Graphique dynamique avec des valeurs > 0
- Légende affichant les nombres exacts
- Pas de données "mock" visibles

**Vérification Backend**:

```bash
# API à tester
curl http://localhost:3000/api/hospital-admins/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Recherchez dans la réponse:
{
  "bookingSources": [
    { "name": "Mobile App", "value": X },
    { "name": "Direct/Web", "value": Y }
  ]
}
```

---

#### ✅ Test 2: Statut des Lits

**Objectif**: Vérifier l'affichage en temps réel des chambres

**Étapes**:

1. Localisez le graphique "Statut des Lits (Détail)"
2. Vérifiez les 5 catégories possibles:
   - Available (Disponible)
   - Occupied (Occupé)
   - Cleaning (Nettoyage)
   - Maintenance
   - Out of Service (Hors service)
3. Naviguez vers `/hospital/admissions`
4. Vérifiez que les statistiques correspondent

**Résultat Attendu**:

- Graphique Pie Chart avec couleurs distinctes
- Nombres cohérents entre dashboard et page admissions
- Total des lits = somme de tous les statuts

**Vérification Backend**:

```bash
# Vérifier les chambres
curl http://localhost:3000/api/rooms \
  -H "Authorization: Bearer YOUR_TOKEN"

# Vérifier les admissions actives
curl http://localhost:3000/api/admissions/active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### ✅ Test 3: Satisfaction Médecins

**Objectif**: Vérifier que la note est calculée depuis la base

**Étapes**:

1. Sur le dashboard hôpital, localisez la carte "Patients Total (Unique)"
2. En bas de cette carte, vérifiez l'affichage "Satisfaction: X.X/5"
3. La valeur doit être différente de 4.8 (valeur par défaut)

**Résultat Attendu**:

- Affichage "Satisfaction: 4.X/5" ou "5.0/5"
- Valeur calculée depuis les DoctorRating en base
- Si aucune note n'existe, affiche 4.8 par défaut

**Vérification Base de Données**:

```sql
-- Vérifier les notes existantes
SELECT AVG(score) as avg_satisfaction 
FROM DoctorRating;

-- Vérifier le nombre de notes
SELECT COUNT(*) as total_ratings 
FROM DoctorRating;
```

---

#### ✅ Test 4: Admissions/Sorties Réelles

**Objectif**: Vérifier les compteurs d'hospitalisation

**Étapes**:

1. Sur le dashboard, observez les cartes:
   - "Admissions" (avec icône Login)
   - "Sorties" (avec icône LogOut)
2. Les valeurs doivent refléter les admissions du jour
3. Naviguez vers `/hospital/admissions`
4. Comptez manuellement les patients hospitalisés

**Résultat Attendu**:

- Nombre d'admissions = patients avec status "admitted" aujourd'hui
- Nombre de sorties = patients avec status "discharged" aujourd'hui
- Cohérence entre dashboard et page admissions

---

## 👨‍⚕️ Tests Dashboard Médecin

### Accès

1. Connectez-vous avec un compte **Doctor**
2. Naviguez vers `/doctor`

### Tests à Effectuer

#### ✅ Test 5: Satisfaction Médecin

**Objectif**: Vérifier la note personnelle du médecin

**Étapes**:

1. Localisez la carte "Satisfaction"
2. Vérifiez que la valeur affichée est au format "X.X/5"
3. Comparez avec les notes en base pour ce médecin

**Résultat Attendu**:

- Note moyenne calculée depuis DoctorRating
- Badge "Top 5%" affiché
- Valeur réaliste (entre 1.0 et 5.0)

**Vérification Backend**:

```bash
curl http://localhost:3000/api/doctors/stats \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"

# Recherchez:
{
  "satisfaction": 4.X
}
```

---

#### ✅ Test 6: Tendance Hebdomadaire

**Objectif**: Graphique des rendez-vous sur 7 jours

**Étapes**:

1. Observez le graphique "Rendez-vous de la Semaine"
2. Vérifiez qu'il affiche 7 barres (Lun-Dim)
3. Les hauteurs doivent correspondre aux vrais rendez-vous

**Résultat Attendu**:

- Graphique avec données variables (pas tous à 0)
- Jour actuel visible
- Cohérence avec le calendrier

---

## 💊 Tests Dashboard Pharmacie

### Accès

1. Connectez-vous avec un compte **Hospital Admin**
2. Naviguez vers `/hospital/pharmacy`

### Tests à Effectuer

#### ✅ Test 7: Statuts d'Inventaire

**Objectif**: Vérifier le calcul automatique des statuts

**Étapes**:

1. Dans l'onglet "Inventaire", observez la colonne "Statut"
2. Vérifiez les badges de couleur:
   - 🟢 Vert = Stock OK
   - 🟡 Jaune = Stock Bas
   - 🔴 Rouge = Critique/Rupture
   - ⚫ Gris = Périmé
3. Comparez avec les quantités affichées

**Résultat Attendu**:

- Badge "Stock Bas" si quantity ≤ minQuantity
- Badge "Critique" si quantity = 0
- Badge "Périmé" si expiryDate < aujourd'hui
- Badge "OK" sinon

**Vérification Backend**:

```bash
curl http://localhost:3000/api/pharmacy/inventory \
  -H "Authorization: Bearer YOUR_TOKEN"

# Chaque item doit avoir un champ "status"
```

---

#### ✅ Test 8: Historique des Mouvements

**Objectif**: Vérifier le nouveau tab "Mouvements"

**Étapes**:

1. Cliquez sur l'onglet "Mouvements"
2. Vérifiez l'affichage du tableau avec colonnes:
   - Date
   - Médicament
   - Type (Entrée/Sortie)
   - Quantité (+/-)
   - Raison
   - Effectué par
3. Les entrées doivent être en vert (+), les sorties en rouge (-)

**Résultat Attendu**:

- Tableau rempli avec l'historique complet
- Dates formatées en français (dd/MM/yyyy HH:mm)
- Badges colorés pour le type
- Quantités avec signe + ou -

**Vérification Backend**:

```bash
curl http://localhost:3000/api/pharmacy/movements \
  -H "Authorization: Bearer YOUR_TOKEN"

# Doit retourner un array de mouvements
```

---

#### ✅ Test 9: Notifications Fournisseurs

**Objectif**: Vérifier l'envoi d'emails lors de ruptures

**Prérequis**:

- Configurer SMTP dans `.env` du backend
- Avoir un fournisseur avec email valide

**Étapes**:

1. Créez un mouvement de stock qui met un item en rupture:

   ```bash
   curl -X POST http://localhost:3000/api/pharmacy/movements \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "inventoryItemId": 1,
       "type": "out",
       "quantity": -100,
       "reason": "Test rupture"
     }'
   ```

2. Vérifiez les logs du backend
3. Vérifiez la boîte email du fournisseur

**Résultat Attendu**:

- Log dans le terminal: `✉️ Notification envoyée au fournisseur...`
- Email reçu avec:
  - Sujet: `[SamaSante] Alerte de stock: [Nom Médicament]`
  - Corps HTML avec détails (produit, quantité, seuil)
- Alerte créée dans la table StockAlert

**Vérification Base de Données**:

```sql
-- Vérifier les alertes créées
SELECT * FROM StockAlert 
WHERE type IN ('low_stock', 'out_of_stock')
ORDER BY createdAt DESC 
LIMIT 10;
```

---

#### ✅ Test 10: Gestion Fournisseurs

**Objectif**: Vérifier le tab "Fournisseurs"

**Étapes**:

1. Cliquez sur l'onglet "Fournisseurs"
2. Vérifiez l'affichage de la liste
3. Observez les informations: Nom, Contact, Email, Téléphone

**Résultat Attendu**:

- Liste des fournisseurs de l'organisation
- Données complètes affichées
- Possibilité de voir les détails

**Vérification Backend**:

```bash
curl http://localhost:3000/api/suppliers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🏥 Tests Page Admissions

### Accès

1. Naviguez vers `/hospital/admissions`

### Tests à Effectuer

#### ✅ Test 11: Liste des Hospitalisations

**Objectif**: Affichage des patients hospitalisés

**Étapes**:

1. Observez la liste des patients
2. Vérifiez les informations affichées:
   - Nom du patient
   - Chambre et lit (ex: "Room 101 - Bed 101-A")
   - Date d'admission
   - ID de l'admission
3. Comparez avec la base de données

**Résultat Attendu**:

- Patients réels depuis la table Admission
- Informations complètes et à jour
- Avatars avec initiales

**Vérification Backend**:

```bash
curl http://localhost:3000/api/admissions/active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### ✅ Test 12: Statistiques d'Occupation

**Objectif**: Cartes de statistiques en haut de page

**Étapes**:

1. Observez les 3 cartes:
   - Total Hospitalisés
   - Lits Disponibles
   - Taux d'Occupation
2. Vérifiez la cohérence des chiffres

**Résultat Attendu**:

- Total Hospitalisés = nombre de patients dans la liste
- Lits Disponibles = lits avec status "available"
- Taux d'Occupation = (Total Lits - Disponibles) / Total Lits * 100

**Calcul Manuel**:

```
Exemple:
- Total Lits: 50
- Lits Disponibles: 12
- Taux d'Occupation: (50 - 12) / 50 * 100 = 76%
```

---

## 🔍 Tests API Directs

### Test des Nouvelles Routes

#### Rooms API

```bash
# Lister toutes les chambres
curl http://localhost:3000/api/rooms \
  -H "Authorization: Bearer YOUR_TOKEN"

# Créer une chambre
curl -X POST http://localhost:3000/api/rooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "301",
    "type": "standard",
    "departmentId": 1,
    "beds": [
      { "number": "301-A" },
      { "number": "301-B" }
    ]
  }'

# Mettre à jour un lit
curl -X PATCH http://localhost:3000/api/rooms/1/beds/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "status": "occupied" }'
```

#### Admissions API

```bash
# Lister les admissions actives
curl http://localhost:3000/api/admissions/active \
  -H "Authorization: Bearer YOUR_TOKEN"

# Admettre un patient
curl -X POST http://localhost:3000/api/admissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "bedId": 2,
    "reason": "Chirurgie programmée"
  }'

# Sortir un patient
curl -X POST http://localhost:3000/api/admissions/1/discharge \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Rétablissement complet"
  }'
```

#### Suppliers API

```bash
# Lister les fournisseurs
curl http://localhost:3000/api/suppliers \
  -H "Authorization: Bearer YOUR_TOKEN"

# Créer un fournisseur
curl -X POST http://localhost:3000/api/suppliers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pharma Plus",
    "contactName": "Jean Dupont",
    "email": "contact@pharmaplus.sn",
    "phone": "+221 33 123 45 67",
    "address": "Dakar, Sénégal"
  }'
```

#### Purchase Orders API

```bash
# Lister les commandes
curl http://localhost:3000/api/purchase-orders \
  -H "Authorization: Bearer YOUR_TOKEN"

# Créer une commande
curl -X POST http://localhost:3000/api/purchase-orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": 1,
    "items": [
      {
        "medicationName": "Paracétamol 500mg",
        "quantity": 1000,
        "unitPrice": 50
      }
    ]
  }'
```

---

## 📊 Checklist Finale

### Dashboards

- [ ] Dashboard Hôpital affiche des données réelles
- [ ] Sources de Réservation dynamiques
- [ ] Statut des Lits en temps réel
- [ ] Satisfaction calculée (pas 4.8 fixe)
- [ ] Dashboard Médecin avec vraie note
- [ ] Tendance hebdomadaire fonctionnelle

### Pharmacie

- [ ] Statuts d'inventaire calculés automatiquement
- [ ] Tab "Mouvements" opérationnel
- [ ] Historique complet visible
- [ ] Tab "Fournisseurs" fonctionnel
- [ ] Emails envoyés lors de ruptures (si SMTP configuré)

### Admissions

- [ ] Liste des patients hospitalisés réelle
- [ ] Statistiques d'occupation correctes
- [ ] Informations complètes (chambre, lit, date)

### APIs

- [ ] Toutes les nouvelles routes répondent
- [ ] Authentification requise fonctionnelle
- [ ] Données cohérentes entre APIs

---

## 🐛 Dépannage

### Problème: Données vides

**Solution**: Exécutez le seed script

```bash
cd backend
npx tsx prisma/seed-dashboard.ts
```

### Problème: Erreur 401 Unauthorized

**Solution**: Vérifiez votre token JWT

```bash
# Récupérez un nouveau token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "votre_mot_de_passe"
  }'
```

### Problème: Graphiques ne s'affichent pas

**Solution**:

1. Vérifiez la console du navigateur (F12)
2. Vérifiez que l'API retourne des données
3. Rechargez la page (Ctrl+R)

### Problème: Emails non envoyés

**Solution**: Configurez SMTP dans `.env`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_app
SMTP_FROM=noreply@samasante.sn
```

---

## ✅ Validation Complète

Une fois tous les tests passés, vous pouvez confirmer que :

✅ **Toutes les données statiques ont été remplacées**  
✅ **Les graphiques sont dynamiques et réactifs**  
✅ **Les notifications fournisseurs fonctionnent**  
✅ **Le système de lits et admissions est opérationnel**  
✅ **La satisfaction médecin est calculée en temps réel**  

**Le système est production-ready pour ces modules ! 🚀**
