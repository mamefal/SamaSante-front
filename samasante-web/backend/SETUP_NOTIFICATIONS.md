# Guide de Configuration Rapide - Notifications SamaSanté

## 🚀 Démarrage Rapide (5 minutes)

### Étape 1: Copier le fichier d'environnement

```bash
cd backend
cp .env.example .env
```

### Étape 2: Configurer les SMS (Twilio) - IMPORTANT pour le Sénégal

#### A. Créer un compte Twilio

1. Allez sur [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Créez un compte gratuit (crédit de 15 USD offert)
3. Vérifiez votre email et numéro de téléphone

#### B. Obtenir un numéro sénégalais

1. Dans le dashboard Twilio, allez dans **Phone Numbers** → **Buy a Number**
2. Sélectionnez le pays: **Senegal (+221)**
3. Choisissez un numéro disponible
4. Achetez le numéro (~1 USD/mois)

#### C. Récupérer vos credentials

1. Dans le dashboard, allez dans **Account** → **API Keys & Tokens**
2. Copiez:
   - **Account SID** (commence par AC...)
   - **Auth Token** (cliquez sur "show" pour le voir)

#### D. Ajouter dans `.env`

```bash
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="votre_auth_token"
TWILIO_PHONE_NUMBER="+221XXXXXXXXX"  # Votre numéro Twilio
```

### Étape 3: Configurer les Emails (Gmail)

#### A. Activer l'authentification à 2 facteurs

1. Allez sur [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Activez la **Validation en deux étapes**

#### B. Générer un mot de passe d'application

1. Allez dans **Mots de passe d'application**
2. Sélectionnez **Autre (nom personnalisé)**
3. Entrez "SamaSanté"
4. Cliquez sur **Générer**
5. Copiez le mot de passe généré (16 caractères)

#### C. Ajouter dans `.env`

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="xxxx xxxx xxxx xxxx"  # Mot de passe d'application
SMTP_FROM_EMAIL="noreply@samasante.sn"
SMTP_FROM_NAME="SamaSanté"
```

### Étape 4: Tester le système

#### A. Démarrer le backend

```bash
npm run dev
```

#### B. Tester avec curl

```bash
# Obtenir un token d'authentification (utilisez vos credentials)
TOKEN="votre_jwt_token"

# Tester une notification
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "info",
    "channels": ["in_app", "email"]
  }'
```

#### C. Vérifier les logs

Vous devriez voir dans la console:

```
✅ Email service initialized successfully
✅ SMS service initialized successfully
📧 Email sent successfully to ...
📱 SMS sent successfully to ...
```

## 🎯 Configuration Avancée (Optionnel)

### Option 1: SendGrid (Meilleure délivrabilité)

1. Créez un compte sur [https://sendgrid.com](https://sendgrid.com)
2. Gratuit jusqu'à 100 emails/jour
3. Générez une API Key
4. Modifiez `.env`:

```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="SG.xxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Option 2: Mailgun (5000 emails/mois gratuits)

1. Créez un compte sur [https://www.mailgun.com](https://www.mailgun.com)
2. Vérifiez votre domaine
3. Récupérez vos credentials SMTP
4. Modifiez `.env`:

```bash
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@votre-domaine.com"
SMTP_PASS="votre_password_mailgun"
```

### Option 3: Amazon SES (Le moins cher)

1. Créez un compte AWS
2. Activez Amazon SES
3. Vérifiez votre email/domaine
4. Générez des credentials SMTP
5. Modifiez `.env`:

```bash
SMTP_HOST="email-smtp.eu-west-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="votre_access_key"
SMTP_PASS="votre_secret_key"
```

## 📱 Notifications Push (Pour plus tard)

### Firebase Cloud Messaging (FCM)

Quand vous serez prêt pour l'application mobile:

1. Créez un projet Firebase
2. Activez Cloud Messaging
3. Téléchargez le fichier de configuration
4. Ajoutez dans `.env`:

```bash
FCM_SERVER_KEY="votre_server_key"
```

## ✅ Checklist de Vérification

Avant de passer en production, vérifiez:

- [ ] Twilio configuré et testé
- [ ] Email SMTP configuré et testé
- [ ] Variables d'environnement en production
- [ ] Numéros de test ajoutés dans Twilio (mode développement)
- [ ] Domaine email vérifié (pour éviter spam)
- [ ] Logs de monitoring activés
- [ ] Budget SMS défini (alertes Twilio)

## 🆘 Dépannage

### Problème: SMS ne s'envoient pas

**Solution:**

1. Vérifiez que le numéro est au format international (+221...)
2. Vérifiez votre crédit Twilio
3. Vérifiez les logs: `LOG_LEVEL=debug npm run dev`
4. Testez avec le numéro vérifié Twilio

### Problème: Emails vont dans spam

**Solutions:**

1. Utilisez SendGrid ou Mailgun (meilleure réputation)
2. Configurez SPF/DKIM pour votre domaine
3. Évitez les mots "spam" dans les sujets
4. Ajoutez un lien de désinscription

### Problème: "Email service not configured"

**Solution:**

1. Vérifiez que toutes les variables SMTP sont définies
2. Redémarrez le serveur après modification du `.env`
3. Vérifiez qu'il n'y a pas d'espaces dans les valeurs

### Problème: "SMS service not configured"

**Solution:**

1. Vérifiez les 3 variables Twilio (SID, Token, Phone)
2. Le numéro doit commencer par +221
3. Redémarrez le serveur

## 💰 Estimation des Coûts

### Développement (Gratuit)

- Twilio: 15 USD de crédit offert
- Gmail: Gratuit (limite 500 emails/jour)
- FCM: Gratuit

### Production (Petit volume - 1000 patients)

- SMS: ~50 USD/mois (1 rappel/patient/mois)
- Email: Gratuit avec SendGrid (100/jour)
- Total: **~50 USD/mois**

### Production (Moyen volume - 10000 patients)

- SMS: ~500 USD/mois
- Email: ~10 USD/mois (SendGrid Pro)
- Total: **~510 USD/mois**

**💡 Astuce:** Limitez les SMS aux rappels critiques uniquement!

## 📞 Support

### Documentation

- Guide complet: `backend/NOTIFICATIONS.md`
- Implémentation: `backend/NOTIFICATIONS_IMPLEMENTATION.md`

### Ressources

- Twilio Docs: [https://www.twilio.com/docs](https://www.twilio.com/docs)
- Nodemailer: [https://nodemailer.com](https://nodemailer.com)
- SendGrid: [https://docs.sendgrid.com](https://docs.sendgrid.com)

### Aide

Si vous rencontrez des problèmes:

1. Vérifiez les logs: `LOG_LEVEL=debug npm run dev`
2. Testez les services individuellement
3. Consultez la documentation Twilio/SMTP

---

**Bon courage! 🚀**

Une fois configuré, le système enverra automatiquement:

- ✅ Confirmations de rendez-vous (Email + SMS)
- ✅ Rappels 24h avant (Email + SMS + Push)
- ✅ Emails de bienvenue
- ✅ Réinitialisations de mot de passe
- ✅ Et bien plus!
