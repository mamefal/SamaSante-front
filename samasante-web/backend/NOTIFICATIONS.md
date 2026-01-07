# Système de Notifications Avancées - SamaSanté

## Vue d'ensemble

Le système de notifications de SamaSanté est un système complet et multi-canal qui prend en charge:

- ✉️ **Emails transactionnels** (via SMTP/Nodemailer)
- 📱 **SMS** (via Twilio - crucial pour le Sénégal)
- 🔔 **Notifications Push** (fondation pour application mobile future)
- 💬 **Notifications in-app** (stockées en base de données)

## Architecture

```
lib/notifications/
├── sms.ts          # Service SMS (Twilio)
├── email.ts        # Service Email (Nodemailer)
├── push.ts         # Service Push (Web Push/FCM)
├── manager.ts      # Gestionnaire unifié
└── index.ts        # Exports
```

## Configuration

### 1. Variables d'environnement

Ajoutez ces variables à votre fichier `.env`:

```bash
# SMS Notifications (Twilio)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+221XXXXXXXXX"

# Email Notifications (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM_EMAIL="noreply@samasante.sn"
SMTP_FROM_NAME="SamaSanté"

# Push Notifications (Optionnel)
VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
FCM_SERVER_KEY=""
```

### 2. Configuration Twilio (SMS)

1. Créez un compte sur [Twilio](https://www.twilio.com/)
2. Obtenez un numéro de téléphone sénégalais (+221)
3. Copiez votre Account SID et Auth Token
4. Ajoutez les credentials dans `.env`

**Important pour le Sénégal:**

- Le service normalise automatiquement les numéros sénégalais
- Formats acceptés: `+221XXXXXXXXX`, `0XXXXXXXXX`, `XXXXXXXXX`

### 3. Configuration Email (SMTP)

#### Option 1: Gmail

1. Activez la vérification en 2 étapes sur votre compte Gmail
2. Générez un mot de passe d'application:
   - Allez dans Paramètres Google → Sécurité
   - Mots de passe d'application
   - Créez un nouveau mot de passe pour "Mail"
3. Utilisez ce mot de passe dans `SMTP_PASS`

#### Option 2: Services professionnels

- **SendGrid**: Meilleure délivrabilité, 100 emails/jour gratuits
- **Mailgun**: 5000 emails/mois gratuits
- **Amazon SES**: Très économique pour gros volumes

### 4. Configuration Push Notifications (Futur)

Pour l'intégration mobile future, vous pouvez utiliser:

- **Firebase Cloud Messaging (FCM)**: Recommandé
- **OneSignal**: Alternative simple
- **Web Push API**: Pour notifications web

## Utilisation

### Envoi de notification simple

```typescript
import { notificationManager } from './lib/notifications'

await notificationManager.send({
  userId: 123,
  type: 'info',
  title: 'Nouveau message',
  message: 'Vous avez reçu un nouveau message',
  channels: ['in_app', 'email', 'sms', 'push']
})
```

### Notification de rendez-vous

```typescript
await notificationManager.sendAppointmentConfirmation({
  patientId: 456,
  doctorId: 789,
  appointmentId: 101,
  appointmentDate: new Date('2025-12-20T10:00:00'),
  location: 'Hôpital Principal de Dakar'
})
```

### Rappel de rendez-vous (24h avant)

```typescript
await notificationManager.scheduleAppointmentReminder({
  patientId: 456,
  doctorId: 789,
  appointmentId: 101,
  appointmentDate: new Date('2025-12-20T10:00:00'),
  location: 'Hôpital Principal de Dakar'
})
```

## Types de notifications

| Type | Description | Canaux recommandés |
|------|-------------|-------------------|
| `appointment_confirmation` | Confirmation de rendez-vous | in_app, email, sms |
| `appointment_reminder` | Rappel 24h avant | in_app, email, sms, push |
| `appointment_cancellation` | Annulation de rendez-vous | in_app, email, sms |
| `prescription_ready` | Ordonnance disponible | in_app, email, push |
| `lab_results_ready` | Résultats d'analyses prêts | in_app, email |
| `new_message` | Nouveau message | in_app, push |
| `account_created` | Compte créé | email |
| `password_reset` | Réinitialisation mot de passe | email |
| `system_alert` | Alerte système | in_app, email |
| `info` | Information générale | in_app |

## API Routes

### GET /api/notifications

Récupère les notifications de l'utilisateur

**Query params:**

- `limit`: Nombre de notifications (défaut: 20)
- `offset`: Pagination (défaut: 0)
- `unreadOnly`: Seulement non lues (défaut: false)

**Réponse:**

```json
{
  "notifications": [
    {
      "id": 1,
      "title": "Rendez-vous confirmé",
      "message": "Votre rendez-vous avec Dr. Diop est confirmé",
      "time": "2025-12-15T10:00:00Z",
      "read": false,
      "type": "appointment_confirmation"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

### GET /api/notifications/unread-count

Compte les notifications non lues

**Réponse:**

```json
{
  "count": 5
}
```

### PUT /api/notifications/:id/read

Marque une notification comme lue

### PUT /api/notifications/mark-all-read

Marque toutes les notifications comme lues

### DELETE /api/notifications/:id

Supprime une notification

### DELETE /api/notifications

Supprime toutes les notifications lues

### POST /api/notifications/test

Envoie une notification de test (développement)

**Body:**

```json
{
  "type": "info",
  "channels": ["in_app", "email", "sms"]
}
```

## Templates Email

Le système inclut des templates HTML professionnels pour:

1. **Email de bienvenue** - Après inscription
2. **Réinitialisation mot de passe** - Avec lien sécurisé
3. **Confirmation de rendez-vous** - Détails complets
4. **Rappel de rendez-vous** - 24h avant

Tous les templates sont:

- ✅ Responsive (mobile-friendly)
- ✅ Professionnels avec design moderne
- ✅ En français
- ✅ Branded SamaSanté

## Templates SMS

Les SMS sont optimisés pour:

- ✅ Concision (160 caractères max recommandé)
- ✅ Clarté du message
- ✅ Informations essentielles
- ✅ Format sénégalais

Exemple:

```
Bonjour Amadou,

Rappel de rendez-vous:
Dr. Diop
Mercredi 20 décembre 2025 à 10:00
Lieu: Hôpital Principal de Dakar

Merci de confirmer votre présence.

SamaSanté
```

## Gestion des numéros sénégalais

Le service SMS normalise automatiquement les formats:

```typescript
// Tous ces formats sont acceptés et convertis en +221XXXXXXXXX
"0771234567"      → "+221771234567"
"771234567"       → "+221771234567"
"+221771234567"   → "+221771234567"
"221771234567"    → "+221771234567"
```

## Bonnes pratiques

### 1. Choix des canaux

- **Urgent**: SMS + Push + In-app
- **Important**: Email + In-app
- **Informatif**: In-app seulement

### 2. Fréquence

- ⚠️ Limitez les SMS (coût)
- ✅ Emails illimités
- ✅ Push notifications pour engagement
- ✅ In-app pour historique

### 3. Personnalisation

Utilisez toujours le nom de l'utilisateur:

```typescript
message: `Bonjour ${user.name}, ...`
```

### 4. Timing

- Rappels: 24h avant (configurable)
- Confirmations: Immédiatement
- Résultats: Dès disponibilité

## Monitoring

### Logs

Tous les envois sont loggés avec:

- ✅ Succès/échec par canal
- ✅ Détails de l'erreur si échec
- ✅ Métadonnées (userId, type, etc.)

### Métriques

Suivez:

- Taux de délivrabilité par canal
- Taux d'ouverture (emails)
- Taux de lecture (in-app)
- Coûts SMS

## Maintenance

### Nettoyage automatique

Les notifications lues de plus de 30 jours sont automatiquement supprimées:

```typescript
await notificationManager.cleanupOldNotifications()
```

Recommandation: Exécutez cette fonction quotidiennement via un cron job.

### Vérification des services

```typescript
// Vérifier si les services sont actifs
console.log('SMS enabled:', smsService.isEnabled())
console.log('Email enabled:', emailService.isEnabled())
console.log('Push enabled:', pushNotificationService.isEnabled())

// Vérifier la connexion SMTP
const emailOk = await emailService.verifyConnection()
```

## Coûts estimés

### Twilio SMS (Sénégal)

- ~0.05 USD par SMS
- 1000 SMS ≈ 50 USD/mois
- Recommandation: Limiter aux rappels importants

### Email

- SendGrid: Gratuit jusqu'à 100/jour
- Mailgun: Gratuit jusqu'à 5000/mois
- SES: ~0.10 USD pour 1000 emails

### Push Notifications

- FCM: Gratuit
- OneSignal: Gratuit jusqu'à 10k abonnés

## Roadmap

### Phase 1 (Actuel)

- [x] Service SMS (Twilio)
- [x] Service Email (SMTP)
- [x] Notifications in-app
- [x] Templates professionnels
- [x] API complète

### Phase 2 (Futur proche)

- [ ] Job scheduling (Bull/BullMQ)
- [ ] Rappels automatiques 24h avant
- [ ] Statistiques de délivrabilité
- [ ] Préférences utilisateur (opt-in/opt-out)

### Phase 3 (Application mobile)

- [ ] Intégration FCM
- [ ] Push notifications réelles
- [ ] Deep linking
- [ ] Notifications riches (images, actions)

## Support

Pour toute question ou problème:

1. Vérifiez les logs: `LOG_LEVEL=debug npm run dev`
2. Testez les services individuellement
3. Vérifiez les variables d'environnement
4. Consultez la documentation Twilio/Nodemailer

## Exemples d'intégration

### Dans une route d'appointment

```typescript
import { notificationManager } from '../lib/notifications'

// Après création du rendez-vous
await notificationManager.sendAppointmentConfirmation({
  patientId: appointment.patientId,
  doctorId: appointment.doctorId,
  appointmentId: appointment.id,
  appointmentDate: appointment.start,
  location: site.name
})

// Programmer le rappel
await notificationManager.scheduleAppointmentReminder({
  patientId: appointment.patientId,
  doctorId: appointment.doctorId,
  appointmentId: appointment.id,
  appointmentDate: appointment.start,
  location: site.name
})
```

### Dans une route d'authentification

```typescript
// Après inscription
await notificationManager.send({
  userId: newUser.id,
  type: 'account_created',
  title: 'Bienvenue sur SamaSanté',
  message: 'Votre compte a été créé avec succès',
  channels: ['email']
})

// Réinitialisation mot de passe
await notificationManager.send({
  userId: user.id,
  type: 'password_reset',
  title: 'Réinitialisation de mot de passe',
  message: 'Cliquez sur le lien pour réinitialiser',
  channels: ['email'],
  data: { resetToken: token }
})
```

---

**Développé pour SamaSanté - Votre santé, notre priorité** 🏥
