# Charte Graphique AMINA

## Palette de Couleurs Officielle

### Couleurs Principales

#### 🔵 Bleu Marine (Navy Blue)

- **Hex**: `#1b385a`
- **Usage**: Couleur principale, boutons primaires, en-têtes
- **CSS Variable**: `--primary`
- **Signification**: Confiance, professionnalisme, santé

#### 🟢 Turquoise

- **Hex**: `#00ab85`
- **Usage**: Couleur secondaire, accents, éléments interactifs
- **CSS Variable**: `--secondary`
- **Signification**: Vitalité, guérison, innovation

#### ⚪ Gris

- **Hex**: `#808080`
- **Usage**: Textes secondaires, bordures, éléments désactivés
- **CSS Variable**: `--muted`
- **Signification**: Neutralité, équilibre

#### ⚪ Blanc

- **Hex**: `#ffffff`
- **Usage**: Arrière-plans, textes sur fonds foncés
- **CSS Variable**: `--background`
- **Signification**: Pureté, clarté, simplicité

## Utilisation dans le Code

### Tailwind CSS Classes

```tsx
// Bouton principal (Bleu Marine)
<Button className="bg-primary text-primary-foreground">
  Bouton Principal
</Button>

// Bouton secondaire (Turquoise)
<Button className="bg-secondary text-secondary-foreground">
  Bouton Secondaire
</Button>

// Texte gris
<p className="text-muted-foreground">Texte secondaire</p>

// Bordure
<div className="border border-border">Contenu</div>
```

### CSS Variables

```css
/* Utilisation directe des variables CSS */
.mon-element {
  background-color: var(--primary);
  color: var(--primary-foreground);
}

.mon-accent {
  background-color: var(--secondary);
  border-color: var(--border);
}
```

## Typographie

### Police Principale

- **Famille**: Inter
- **Poids disponibles**: 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold)
- **Import**: Google Fonts

### Hiérarchie des Titres

```tsx
// H1 - Titres principaux
<h1 className="text-4xl font-bold text-foreground">Titre Principal</h1>

// H2 - Sous-titres
<h2 className="text-3xl font-semibold text-foreground">Sous-titre</h2>

// H3 - Sections
<h3 className="text-2xl font-medium text-foreground">Section</h3>

// Body - Texte normal
<p className="text-base text-foreground">Texte normal</p>

// Small - Texte secondaire
<p className="text-sm text-muted-foreground">Texte secondaire</p>
```

## Composants UI

### Boutons

```tsx
// Primaire
<Button className="bg-primary hover:bg-primary/90">Action Principale</Button>

// Secondaire
<Button variant="outline" className="border-secondary text-secondary">
  Action Secondaire
</Button>

// Destructif
<Button variant="destructive">Supprimer</Button>
```

### Cards

```tsx
<Card className="border-border bg-card">
  <CardHeader>
    <CardTitle className="text-foreground">Titre</CardTitle>
  </CardHeader>
  <CardContent className="text-muted-foreground">
    Contenu
  </CardContent>
</Card>
```

### Inputs

```tsx
<Input 
  className="border-border focus:ring-primary"
  placeholder="Entrez votre texte"
/>
```

## Effets Glassmorphism

### Glass Card

```tsx
<div className="glass-card p-6 rounded-2xl">
  Contenu avec effet de verre
</div>
```

### Glass Input

```tsx
<Input className="glass-input" />
```

## Espacement et Bordures

### Border Radius

- **sm**: `calc(0.75rem - 2px)` → ~10px
- **md**: `0.75rem` → 12px
- **lg**: `calc(0.75rem + 2px)` → ~14px
- **xl**: `calc(0.75rem + 4px)` → ~16px
- **2xl**: `calc(0.75rem + 8px)` → ~20px

### Espacement Standard

- **xs**: `0.25rem` → 4px
- **sm**: `0.5rem` → 8px
- **md**: `1rem` → 16px
- **lg**: `1.5rem` → 24px
- **xl**: `2rem` → 32px

## Mode Sombre

Le mode sombre utilise des versions ajustées des couleurs principales :

- Bleu Marine plus clair pour meilleure lisibilité
- Turquoise plus vibrant pour les accents
- Effets de verre avec transparence

```tsx
// Activation du mode sombre
<html className="dark">
  {/* Votre contenu */}
</html>
```

## Accessibilité

### Contraste

- Tous les textes respectent WCAG 2.1 niveau AA
- Ratio de contraste minimum : 4.5:1 pour le texte normal
- Ratio de contraste minimum : 3:1 pour le texte large

### Focus States

```tsx
// Tous les éléments interactifs doivent avoir un état focus visible
<button className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Bouton Accessible
</button>
```

## Animations

### Transitions Standard

```css
.btn-scale {
  transition: transform 150ms ease-out;
}

.btn-scale:active {
  transform: scale(0.95);
}
```

### Fade In

```tsx
<div className="fade-in">
  Contenu avec animation d'apparition
</div>
```

## Logo

### Fichier

- **Emplacement**: `/public/assets/logos/amina-logo.png`
- **Format**: PNG avec transparence
- **Tailles recommandées**:
  - Small: 48x48px
  - Medium: 64x64px
  - Large: 80x80px
  - XL: 112x112px

### Utilisation

```tsx
import { Logo } from "@/components/logo"

<Logo size="md" />
```

---

**Dernière mise à jour**: Décembre 2025  
**Version**: 1.0  
**Marque**: AMINA by Ayra
