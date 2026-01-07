# Assets Directory

Ce dossier contient tous les assets statiques de l'application AMINA.

## Structure

```
public/assets/
├── logos/          # Logos de l'application
│   └── amina-logo.png
├── icons/          # Icônes et favicons
│   └── (à ajouter)
└── images/         # Images diverses
    └── (à ajouter)
```

## Logos (`/logos`)

- **amina-logo.png** - Logo principal AMINA by Ayra
- Utilisé dans : composant Logo, pages d'authentification

## Icônes (`/icons`)

Placez ici :

- Favicons (favicon.ico, favicon-16x16.png, favicon-32x32.png)
- Apple touch icons
- Icônes de réseaux sociaux
- Icônes d'interface utilisateur

## Images (`/images`)

Placez ici :

- Images de fond
- Illustrations
- Photos de profil par défaut
- Bannières
- Images de contenu

## Conventions de nommage

- Utilisez des noms descriptifs en minuscules
- Séparez les mots par des tirets : `mon-image.png`
- Incluez la taille si pertinent : `logo-small.png`, `logo-large.png`
- Utilisez des formats optimisés pour le web (WebP, PNG, SVG)

## Utilisation dans le code

```tsx
// Logos
import Image from 'next/image'
<Image src="/assets/logos/amina-logo.png" alt="AMINA" width={100} height={100} />

// Icônes
<Image src="/assets/icons/mon-icone.svg" alt="Icône" width={24} height={24} />

// Images
<Image src="/assets/images/ma-photo.jpg" alt="Photo" width={800} height={600} />
```

## Optimisation

- Compressez les images avant de les ajouter
- Utilisez SVG pour les icônes quand possible
- Considérez WebP pour les photos
- Next.js optimise automatiquement les images via le composant `Image`
