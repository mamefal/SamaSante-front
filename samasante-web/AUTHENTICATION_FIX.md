# Corrections de l'Authentification - AMINA

## 🔧 Problèmes Corrigés

### 1. **Authentification Mock → Authentification Réelle**

- ✅ Remplacé les tokens factices par de vrais JWT signés
- ✅ Vérification des mots de passe avec bcrypt
- ✅ Requêtes à la base de données pour valider les utilisateurs

### 2. **Sécurité des Cookies**

- ✅ Ajout de l'option `HttpOnly` pour empêcher l'accès JavaScript
- ✅ Ajout de l'option `Secure` en production (HTTPS uniquement)
- ✅ Durée de validité : 7 jours (au lieu de 1 jour)

### 3. **Route de Déconnexion**

- ✅ Nouvelle route `/api/auth/logout` pour déconnecter proprement
- ✅ Suppression du cookie côté serveur
- ✅ Nettoyage des données locales côté client

### 4. **Middleware d'Authentification**

- ✅ Vérification JWT réelle au lieu de tokens mock
- ✅ Récupération des données utilisateur depuis la base de données
- ✅ Gestion d'erreurs améliorée avec logs détaillés

### 5. **Gestion des Sessions Expirées**

- ✅ Intercepteur 401 réactivé dans l'API client
- ✅ Redirection automatique vers la page de login
- ✅ Nettoyage des données localStorage
- ✅ Message d'erreur personnalisé

### 6. **Correction du Frontend**

- ✅ Fonction `logout()` asynchrone qui appelle l'API backend
- ✅ Correction de la clé localStorage (`amina:user` au lieu de `token`)
- ✅ Nettoyage des tokens legacy

## 📋 Comptes de Test

Tous les comptes utilisent le même mot de passe : **`Test123456!`**

| Email | Rôle | Accès |
| :--- | :--- | :--- |
| `awa.thiam@test.sn` | SUPER_ADMIN | Accès complet à toutes les fonctionnalités |
| `moussa.ndiaye@test.sn` | HOSPITAL_ADMIN | Gestion de l'hôpital |
| `fatou.sall@test.sn` | DOCTOR | Espace médecin |
| `amadou.ba@test.sn` | PATIENT | Espace patient |

## 🚀 Comment Tester

### 1. Créer/Mettre à jour les utilisateurs de test

```bash
cd backend
npx tsx scripts/create-test-users.ts
```

### 2. Tester la connexion

1. Ouvrir <http://localhost:3001/auth/login>
2. Utiliser un des comptes de test ci-dessus
3. Vérifier la redirection vers le bon dashboard

### 3. Tester la déconnexion

1. Cliquer sur le bouton de déconnexion
2. Vérifier la redirection vers `/auth/login`
3. Vérifier que le cookie a été supprimé

### 4. Tester l'expiration de session

1. Se connecter
2. Supprimer manuellement le cookie `token` dans les DevTools
3. Rafraîchir la page ou faire une requête API
4. Vérifier la redirection automatique vers `/auth/login`

## 🔍 Vérifications Techniques

### Cookies

Ouvrir les DevTools → Application → Cookies → <http://localhost:3001>

Le cookie `token` devrait avoir :

- ✅ `HttpOnly` : Oui
- ✅ `SameSite` : Lax
- ✅ `Secure` : Non (en dev), Oui (en prod)
- ✅ `Max-Age` : 604800 (7 jours)

### LocalStorage

Ouvrir les DevTools → Application → Local Storage

Devrait contenir :

- ✅ `amina:user` : Objet JSON avec les données utilisateur

### Logs Backend

Le backend affiche maintenant des logs détaillés :

- ✅ `[LOGIN]` : Tentatives de connexion
- ✅ `[AUTH]` : Vérifications d'authentification
- ✅ `[LOGOUT]` : Déconnexions

## 📁 Fichiers Modifiés

### Backend

- `backend/src/routes/auth.ts` - Route de login et logout réelles
- `backend/src/middlewares/auth.ts` - Vérification JWT réelle
- `backend/scripts/create-test-users.ts` - Script de création d'utilisateurs

### Frontend

- `src/lib/auth.ts` - Fonction logout asynchrone
- `src/lib/api.ts` - Intercepteur 401 réactivé
- `src/components/auth-provider.tsx` - Nettoyage localStorage corrigé

## ⚠️ Notes Importantes

1. **Mots de passe** : En production, utilisez des mots de passe forts et uniques
2. **JWT_SECRET** : Assurez-vous que `JWT_SECRET` est défini dans `.env`
3. **HTTPS** : En production, activez HTTPS pour que le cookie `Secure` fonctionne
4. **Expiration** : Les tokens JWT expirent après 7 jours

## 🐛 Dépannage

### Erreur "Non authentifié"

- Vérifier que le cookie `token` existe
- Vérifier que `JWT_SECRET` est défini dans `.env`
- Vérifier les logs backend pour voir les erreurs

### Redirection en boucle

- Vider le cache du navigateur
- Supprimer tous les cookies et localStorage
- Se reconnecter

### Erreur "Identifiants invalides"

- Vérifier l'email (sensible à la casse)
- Vérifier le mot de passe : `Test123456!`
- Réexécuter le script de création d'utilisateurs

## 📚 Ressources

- [Documentation JWT](https://jwt.io/)
- [Documentation Hono](https://hono.dev/)
- [Documentation Prisma](https://www.prisma.io/)
