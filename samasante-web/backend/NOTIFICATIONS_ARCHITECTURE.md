# Architecture du Système de Notifications - SamaSanté

## Vue d'ensemble du flux

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DÉCLENCHEURS                                 │
├─────────────────────────────────────────────────────────────────────┤
│  • Création de rendez-vous                                          │
│  • Inscription utilisateur                                          │
│  • Réinitialisation mot de passe                                    │
│  • Ordonnance créée                                                 │
│  • Résultats d'analyses prêts                                       │
│  • Nouveau message                                                  │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   NOTIFICATION MANAGER                               │
│                 (lib/notifications/manager.ts)                       │
├─────────────────────────────────────────────────────────────────────┤
│  • Reçoit la demande de notification                                │
│  • Détermine les canaux appropriés                                  │
│  • Route vers les services spécialisés                              │
│  • Gère les erreurs et retry                                        │
│  • Log toutes les actions                                           │
└────────────────────────┬────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬──────────────┐
         │               │               │              │
         ▼               ▼               ▼              ▼
┌────────────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────┐
│   SMS SERVICE  │ │  EMAIL   │ │   PUSH   │ │   IN-APP        │
│   (Twilio)     │ │ SERVICE  │ │ SERVICE  │ │   (Database)    │
├────────────────┤ ├──────────┤ ├──────────┤ ├─────────────────┤
│ • Normalise    │ │ • SMTP   │ │ • FCM    │ │ • Prisma        │
│   numéros +221 │ │ • HTML   │ │ • Web    │ │ • Notification  │
│ • Templates    │ │ • Attach │ │   Push   │ │   table         │
│ • Scheduling   │ │ • Multi  │ │ • Actions│ │ • Unread count  │
└────────┬───────┘ └────┬─────┘ └────┬─────┘ └────────┬────────┘
         │              │            │                 │
         ▼              ▼            ▼                 ▼
┌────────────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────┐
│   TWILIO API   │ │   SMTP   │ │   FCM    │ │   PostgreSQL    │
│                │ │  Server  │ │   API    │ │   / SQLite      │
└────────┬───────┘ └────┬─────┘ └────┬─────┘ └────────┬────────┘
         │              │            │                 │
         ▼              ▼            ▼                 ▼
┌────────────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────┐
│  📱 SMS        │ │ 📧 Email │ │ 🔔 Push  │ │ 💬 In-App       │
│  Patient       │ │ Patient  │ │ Patient  │ │ Notification    │
└────────────────┘ └──────────┘ └──────────┘ └─────────────────┘
```

## Flux détaillé: Création de rendez-vous

```
1. Patient/Médecin crée un RDV
   │
   ├─> POST /api/appointments
   │   └─> Validation des données
   │   └─> Vérification disponibilité
   │   └─> Création en base de données
   │
   ├─> ✅ RDV créé avec succès
   │
   └─> 🔔 Déclenchement des notifications
       │
       ├─> notificationManager.sendAppointmentConfirmation()
       │   │
       │   ├─> [IN-APP] Créer notification en DB
       │   │   └─> ✅ "Rendez-vous confirmé"
       │   │
       │   ├─> [EMAIL] Envoyer confirmation
       │   │   └─> Template HTML professionnel
       │   │   └─> Détails du RDV
       │   │   └─> Bouton "Voir mes RDV"
       │   │   └─> ✅ Email envoyé
       │   │
       │   └─> [SMS] Envoyer confirmation
       │       └─> Normaliser numéro (+221)
       │       └─> Template SMS court
       │       └─> ✅ SMS envoyé
       │
       └─> notificationManager.scheduleAppointmentReminder()
           │
           └─> Calculer date de rappel (RDV - 24h)
           └─> Si > 24h dans le futur:
               └─> Programmer job de rappel
               └─> ✅ Rappel programmé
```

## Flux détaillé: Rappel de rendez-vous (24h avant)

```
1. Job Scheduler (Cron/Bull)
   │
   ├─> Scan des RDV dans 24h
   │
   └─> Pour chaque RDV:
       │
       └─> notificationManager.send()
           │
           ├─> [IN-APP] Notification de rappel
           │   └─> ✅ "Rendez-vous demain"
           │
           ├─> [EMAIL] Email de rappel
           │   └─> Template "Rappel"
           │   └─> Conseils (documents à apporter)
           │   └─> ✅ Email envoyé
           │
           ├─> [SMS] SMS de rappel
           │   └─> "Rappel: RDV demain avec Dr. X"
           │   └─> ✅ SMS envoyé
           │
           └─> [PUSH] Push notification
               └─> Titre: "⏰ Rappel de rendez-vous"
               └─> Actions: [Voir détails] [Annuler]
               └─> ✅ Push envoyé
```

## Flux détaillé: Inscription utilisateur

```
1. Nouvel utilisateur s'inscrit
   │
   ├─> POST /api/auth/register
   │   └─> Validation email/password
   │   └─> Hash du mot de passe
   │   └─> Création en base de données
   │
   ├─> ✅ Compte créé
   │
   └─> 🔔 Email de bienvenue
       │
       └─> notificationManager.send()
           │
           ├─> type: 'account_created'
           ├─> channels: ['email']
           │
           └─> [EMAIL] Email de bienvenue
               └─> Template "Bienvenue"
               └─> Présentation de SamaSanté
               └─> Fonctionnalités selon rôle
               └─> Bouton "Se connecter"
               └─> ✅ Email envoyé
```

## Flux détaillé: Réinitialisation mot de passe

```
1. Utilisateur demande réinitialisation
   │
   ├─> POST /api/auth/forgot-password
   │   └─> Vérification email existe
   │   └─> Génération token sécurisé
   │   └─> Stockage token (expire 1h)
   │
   └─> 🔔 Email de réinitialisation
       │
       └─> notificationManager.send()
           │
           ├─> type: 'password_reset'
           ├─> channels: ['email']
           ├─> data: { resetToken }
           │
           └─> [EMAIL] Email reset password
               └─> Template "Réinitialisation"
               └─> Lien sécurisé avec token
               └─> Avertissement sécurité
               └─> Expire dans 1h
               └─> ✅ Email envoyé
```

## Gestion des erreurs

```
┌─────────────────────────────────────────────────────────────┐
│                    GESTION DES ERREURS                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Si un canal échoue:                                        │
│  ├─> Log l'erreur (Pino)                                    │
│  ├─> Continue avec les autres canaux                        │
│  └─> Retourne succès si au moins 1 canal OK                 │
│                                                              │
│  Exemples d'erreurs gérées:                                 │
│  ├─> SMTP timeout → Retry automatique                       │
│  ├─> Twilio rate limit → Queue pour plus tard               │
│  ├─> Numéro invalide → Log et skip                          │
│  ├─> Email invalide → Log et skip                           │
│  └─> Service désactivé → Skip silencieusement               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Monitoring et Logs

```
┌─────────────────────────────────────────────────────────────┐
│                      MONITORING                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Logs Pino (JSON structuré):                                │
│  ├─> INFO: Notification envoyée                             │
│  │   └─> { userId, type, channels, success }                │
│  │                                                           │
│  ├─> ERROR: Échec d'envoi                                   │
│  │   └─> { error, userId, channel, retry }                  │
│  │                                                           │
│  └─> DEBUG: Détails techniques                              │
│      └─> { messageId, sid, duration }                       │
│                                                              │
│  Métriques à suivre:                                        │
│  ├─> Taux de délivrabilité par canal                        │
│  ├─> Temps de réponse moyen                                 │
│  ├─> Coût par notification (SMS)                            │
│  ├─> Taux d'ouverture (emails)                              │
│  └─> Taux de lecture (in-app)                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Sécurité

```
┌─────────────────────────────────────────────────────────────┐
│                       SÉCURITÉ                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Credentials:                                                │
│  ├─> Stockés dans .env (jamais en code)                     │
│  ├─> Exclus du Git (.gitignore)                             │
│  └─> Chiffrés en production                                 │
│                                                              │
│  Données sensibles:                                          │
│  ├─> Numéros de téléphone → Validation format               │
│  ├─> Emails → Validation RFC                                │
│  ├─> Tokens reset → Expiration 1h                           │
│  └─> Logs → Redaction automatique (Pino)                    │
│                                                              │
│  Rate limiting:                                              │
│  ├─> Max 5 SMS/minute par utilisateur                       │
│  ├─> Max 10 emails/minute par utilisateur                   │
│  └─> Protection contre spam                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Performance

```
┌─────────────────────────────────────────────────────────────┐
│                     PERFORMANCE                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Optimisations:                                              │
│  ├─> Envois parallèles (Promise.all)                        │
│  ├─> Pas de blocage si échec                                │
│  ├─> Cache des templates                                    │
│  └─> Connection pooling (SMTP)                              │
│                                                              │
│  Temps de réponse typiques:                                 │
│  ├─> In-app: ~10ms (DB write)                               │
│  ├─> Email: ~200ms (SMTP)                                   │
│  ├─> SMS: ~500ms (Twilio API)                               │
│  └─> Push: ~100ms (FCM)                                     │
│                                                             │
│  Scalabilité:                                               │
│  ├─> Job queue pour gros volumes                           │
│  ├─> Batch processing possible                             │
│  └─> Horizontal scaling ready                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Évolution future

```
Phase 1 (Actuel) ✅
├─> Services SMS, Email, Push (fondation)
├─> Templates professionnels
├─> API complète
└─> Documentation

Phase 2 (Court terme) 🔄
├─> Job scheduling (Bull/BullMQ)
├─> Rappels automatiques 24h
├─> Retry logic avancée
└─> Dashboard monitoring

Phase 3 (Moyen terme) 📅
├─> Préférences utilisateur
├─> Opt-in/opt-out par canal
├─> A/B testing templates
└─> Analytics détaillées

Phase 4 (Long terme) 🚀
├─> IA pour timing optimal
├─> Personnalisation avancée
├─> Multi-langue
└─> Notifications riches
```

---

**Architecture robuste, scalable et production-ready** ✅
