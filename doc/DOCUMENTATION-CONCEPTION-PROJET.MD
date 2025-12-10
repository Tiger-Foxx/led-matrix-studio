# 🎯 LED Matrix Studio - Synthèse Exécutive

**Version :** 1.3.0 | **Date :** 10 décembre 2025 | **Auteur du projet :** Tiger-Foxx

---

## En 2 Minutes

**LED Matrix Studio** est une **application web et desktop** pour créer et exporter des **animations LED 16×16** sans programmer.

**Workflow :**
```
Créer → Dessiner → Animer → Configurer Export → Télécharger Binaire
```

**Versions :**
- **Web :** https://led-matrix-studio.vercel.app/
- **Desktop :** https://github.com/Tiger-Foxx/led-matrix-studio/releases

**Cas d'usage :** Étudiants, prototypage LED, enseignement électronique

---

## En 5 Points Clés

1. **Interface Graphique**
   - Grille 16×16 interactive
   - Dessin pixel-by-pixel
   - 8 formes prédéfinies (cercle, cœur, etc)

2. **Animation**
   - Timeline multi-frames
   - Playback en temps réel
   - Clignotement simulé 0-50 Hz

3. **Transformations**
   - Rotation 90° (CW/CCW)
   - Miroirs (horizontal/vertical)
   - Décalages cycliques (up/down/left/right)
   - Inversion de pixels

4. **Export Binaire**
   - 4 fichiers EEPROM (TL, TR, BL, BR)
   - Configuration flexible (6 options)
   - Compatible multi-hardware

5. **Gestion Projets**
   - Auto-save toutes les 60s
   - Export/Import JSON
   - Undo/Redo 20 états
   - Historique projets (10 max)

---

## Architecture Simple

```
┌─────────────────────────────────────────────┐
│           React 19 + TypeScript             │
│  UI Components (MatrixGrid, Timeline, etc) │
├─────────────────────────────────────────────┤
│          Zustand State Management           │
│   (currentProject, history, recentProjects) │
├─────────────────────────────────────────────┤
│            Tailwind CSS + Lucide            │
│   (Styling + Icons)                        │
├─────────────────────────────────────────────┤
│        Tauri (Desktop) / File-Saver (Web)  │
│   (I/O + Platform Integration)             │
├─────────────────────────────────────────────┤
│    binary-export.ts + matrix-utils.ts      │
│   (Transformation + Export Logic)           │
└─────────────────────────────────────────────┘
      ↓ (Données persistées)
   localStorage ou System FS
```

---

## Export Binaire : Le Cœur Technique

### Problème
Comment transformer une animation 16×16 en données binaires pour EEPROM ?

### Solution
```
Étape 1 : Découper grille 16×16 en 4 quadrants 8×8
  ┌─────────┬─────────┐
  │   TL    │   TR    │
  ├─────────┼─────────┤
  │   BL    │   BR    │
  └─────────┴─────────┘

Étape 2 : Pour chaque bloc 8×8
  - Appliquer flipX (inverser colonnes) ?
  - Appliquer flipY (inverser lignes) ?
  - Appliquer offset (décalage circulaire) ?
  - Appliquer invertOutput (polarité) ?

Étape 3 : Encoder en octets
  - 8 pixels → 1 byte (bit reversal optionnel)
  - 8 bytes × 8 lignes = 64 bytes/frame
  - 64 frames max par EEPROM

Résultat : 4 fichiers .bin prêts à charger
```

### Options Expliquées (Pourquoi elles existent)

| Option | Signification | Raison |
|---|---|---|
| **Bit Reversal** | D0↔D7 | Ordre bits inversé pour certains microcontroleurs |
| **Flip X** | Miroir horizontal | Câblage matrice inversé |
| **Flip Y** | Miroir vertical | Timing de lecture EEPROM différent |
| **Invert Output** | Active Low (0=ON, 1=OFF) | Microcontrôleur utilise logique inversée |
| **Offset Y** | Décalage lignes | Compensation alignement |
| **Loop Size** | Rép étitions frames | Max 64 frames pour EEPROM 8KB |

---

## Cas d'Usage Complet : Animation Blinking

**Objectif :** LED clignotante (ON 200ms, OFF 200ms)

**Étapes :**

1. **Créer Projet**
   ```
   Écran d'accueil → "Nouveau Projet" → "Blinking"
   ```

2. **Frame 1 : Grille Pleine**
   ```
   Outil "Fill" ou peindre toute la grille
   ```

3. **Frame 2 : Grille Vide**
   ```
   Dupliquer Frame 1 → Outil "Clear"
   ```

4. **Configurer Playback**
   ```
   Speed = 200ms
   Frame 1 → Frame 2 → Frame 1 → ... (boucle)
   ```

5. **Tester**
   ```
   Clic [▶] → voir clignotement
   ```

6. **Export**
   ```
   Clic "Export" → Config par défaut → "Générer .bin"
   ```

7. **Charger Hardware**
   ```
   blinking_TL.bin → EEPROM TL
   blinking_TR.bin → EEPROM TR
   blinking_BL.bin → EEPROM BL
   blinking_BR.bin → EEPROM BR
   ```

**Résultat :** LED clignotante sur matrice 16×16

---

## Dépannage Rapide

| Problème | Solution |
|---|---|
| Pixels inversés | ✓ Cocher "Inverser output (Active Low)" |
| Colonnes inversées | ✓ Cocher "Miroir horizontal (X)" |
| Lignes mal ordonnées | ✓ Ajuster "Offset Y" (-1, 0, +1, etc) |
| Bits aléatoires | ✓ Vérifier "Bit Reversal" + tester pattern simple |

---

## FAQ Rapide

**Q1 : C'est gratuit ?**
A : Oui, open source sur GitHub

**Q2 : Je dois installer quelque chose ?**
A : Non pour web (https://led-matrix-studio.vercel.app/), oui pour desktop (download release)

**Q3 : Mes données sont perdues si je ferme ?**
A : Non, auto-sauvegarde dans localStorage toutes les 60s

**Q4 : Je peux partager mon projet ?**
A : Oui, export JSON puis partager fichier

**Q5 : Combien de frames max ?**
A : 10+ pratiquement, mais EEPROM limite à 64 répétitions

**Q6 : C'est compatible mon microcontrôleur ?**
A : Probablement, avec configuration export (6 options flexibles)

**Q7 : Je peux l'utiliser hors ligne ?**
A : Oui (web stockage local, desktop complètement offline)

**Q8 : C'est bon pour enseigner ?**
A : Oui parfait TP (visual, pas de programmation, résultat immédiat)

---

## Statistiques

| Métrique | Valeur |
|---|---|
| **Lignes de code** | ~3600 (TypeScript/TSX) |
| **Taille bundle** | ~150 KB (gzipped) |
| **Dépendances** | 15 production + 20+ dev |
| **Compatibilité** | Windows, macOS, Linux, Web (Chrome, Firefox, Safari) |
| **Performance** | 60 fps stable |
| **Storage** | ~5 MB localStorage max |
| **Historique** | 20 états Undo/Redo |
| **Projets récents** | 10 max stockés |

---

## Extensibilité Futur

**Court terme (v1.4) :**
- Support 8×8 matrices
- Outil texte
- Patterns stock

**Moyen terme (v1.5-2.0) :**
- Matrices multiples (16×32, 8×8×4)
- Partage cloud
- Collaboration temps réel

**Long terme (v2.1+) :**
- App mobile native
- Marketplace de patterns
- Génération IA
- Hardware simulator 3D

---

## Points Forts & Différenciation

✅ **Visual** : Pas besoin de programmer
✅ **Rapide** : Prototypage en minutes
✅ **Flexible** : Configuration export adaptable
✅ **Pédagogique** : Parfait TP électronique
✅ **Multiplateforme** : Web + Desktop
✅ **Offline** : Fonctionne sans internet
✅ **Collaboratif** : Partage facile JSON
✅ **Extensible** : Code clean, TypeScript

---

## Pour Débuter

### Option 1 : Utilisateur Final
```
1. Ouvrir https://led-matrix-studio.vercel.app/
2. Créer nouveau projet
3. Dessiner animation
4. Clic Export
5. Télécharger fichiers
```

### Option 2 : Développeur
```
1. Clone : git clone https://github.com/Tiger-Foxx/led-matrix-studio
2. npm install
3. npm run dev (web) ou npm run tauri:dev (desktop)
4. Éditer code
5. npm run build (production)
```

### Option 3 : Enseignant
```
1. Accès web pour tous étudiants
2. 4 exercices progressifs (doc guide)
3. TPs de 2-4 heures
4. Évaluation : créativité + technique
```

---

## Ressources

| Type | Lien |
|---|---|
| Web App | https://led-matrix-studio.vercel.app/ |
| Desktop Releases | https://github.com/Tiger-Foxx/led-matrix-studio/releases |
| Code Source | https://github.com/Tiger-Foxx/led-matrix-studio |
| Docs Complètes | 4 documents markdown (DOCUMENTATION-*.md) |
| Auteur | Tiger-Foxx |

---

## En Conclusion

**LED Matrix Studio** résout un vrai besoin : **créer des animations LED visuellement sans programmer**.

**Parfait pour :**
- Étudiants en TP électronique
- Prototypage rapide LED
- Artistes/designers LED
- Enseignement hardware

**Prêt :** Production + Enseignement

**Extensible :** Architecture scalable pour matrices multiples

**Accessibilité :** Web gratuit, Desktop gratuit, open source

---

**Pour plus de détails, consulter les documents :**
- 📘 DOCUMENTATION-TECHNIQUE-COMPLETE.md (architecture)
- 🎨 DOCUMENTATION-FONCTIONNALITES.md (détails techniques)
- 🚀 DOCUMENTATION-GUIDE-UTILISATEUR.md (tutoriels + dépannage)
- 📚 DOCUMENTATION-INDEX.md (navigation)

# LED Matrix Studio - Documentation Technique Complète

**Version du Document:** 1.3.0  
**Date de mise à jour:** 10 décembre 2025  
**Auteur du projet:** Tiger-Foxx

---

## 📋 Table des Matières

1. [Contexte du Projet & Objectifs](#contexte-du-projet--objectifs)
2. [Architecture Technique Globale](#architecture-technique-globale)
3. [Fonctionnalités Détaillées](#fonctionnalités-détaillées)
4. [Système d'Export Binaire](#système-dexport-binaire)
5. [Options de Transformation (Flip/Inversion)](#options-de-transformation)
6. [Gestion des Projets](#gestion-des-projets)
7. [Édition et Transformations](#édition-et-transformations)
8. [Extensibilité Multi-Matrices](#extensibilité-multi-matrices)
9. [Guide Utilisateur Complet](#guide-utilisateur-complet)
10. [Installation et Déploiement](#installation-et-déploiement)

---

# 🎯 Contexte du Projet & Objectifs

## I. Qu'est-ce que LED Matrix Studio ?

**LED Matrix Studio** est une application web et desktop complète dédiée à la création, l'édition et l'export d'animations pour matrices LED 16×16. Elle résout une problématique majeure en électronique/informatique embarquée : **générer rapidement et visuellement des motifs lumineux complexes sans programmer en C/asm**.

### Problème résolu

Traditionnellement, programmer une matrice LED impliquait :
- **Codage manuel** : écrire des tableaux binaires directement en code
- **Pas de prévisualisation** : difficile de voir le résultat avant chargement
- **Gestion hardware complexe** : comprendre les connexions EEPROM, les quadrants, les polarités
- **Répétitivité** : redéfinir les mêmes patterns pour différents projets

### Solution apportée

LED Matrix Studio fournit :
- ✅ **Éditeur graphique pixel-by-pixel** sur une grille 16×16
- ✅ **Timeline d'animation** avec multiple frames
- ✅ **Formes prédéfinies** (cercle, carré, cœur, flèches, etc.)
- ✅ **Transformations** (rotation, miroir, décalage, inversion)
- ✅ **Export binaire multi-EEPROM** (TL, TR, BL, BR)
- ✅ **Gestion complète des projets** (création, sauvegarde, chargement, partage)
- ✅ **Playback en temps réel** avec contrôle de vitesse et clignotement
- ✅ **Compatibilité multi-hardware** via options de configuration

### Cas d'usage

1. **Projets étudiants/TP** : créer des animations LED pour prototype électronique
2. **Artistes LED** : designer des patterns complexes visuellement
3. **Prototypage rapide** : itération rapide sans cycle compile/upload
4. **Éducation** : enseigner l'électronique avec une interface visuelle
5. **Installation artistique** : générer des séquences pour displays LED publics

---

## II. Versions Disponibles

### Web : https://led-matrix-studio.vercel.app/

- **Sans installation** : accessible directement dans le navigateur
- **Synchronisation cloud** : données sauvegardées localement (IndexedDB)
- **Partage** : export JSON pour partager les projets
- **Limitations** : les exports binaires téléchargent les fichiers directement

### Desktop : https://github.com/Tiger-Foxx/led-matrix-studio/releases

- **Application native** : utilise Tauri pour intégration OS
- **Sauvegarde de fichiers** : dialogue natif pour sauvegarder/charger
- **Pas de limite de stockage** : utilise le système de fichiers
- **Offline-first** : fonctionnalité complète hors ligne
- **Disponibilité** : Windows (MSI/NSIS), macOS (DMG), Linux (AppImage/DEB)

---

## III. Contexte du TP (Travaux Pratiques)

Ce projet est typiquement déployé dans le contexte d'un **TP d'électronique/informatique embarquée**:

### Objectif pédagogique

Permettre aux étudiants de :
1. **Comprendre les matrices LED** : architecture 16×16, quadrants, adressage
2. **Interfacer du matériel** : charger des binaires dans une EEPROM
3. **Penser en animations** : séquencer des frames
4. **Optimiser l'espace** : compression dans une EEPROM 8KB
5. **Déboguer visuellement** : voir immédiatement le résultat

### Configuration matérielle typique

```
┌──────────────────┐
│  Microcontrôleur │
│  (STM32, AVR)    │
└────────┬─────────┘
         │ Bus I²C/SPI
    ┌────┴─────┬──────────┬──────────┐
    │           │          │          │
┌───▼──┐  ┌──────▼──┐┌──────▼──┐┌──────▼──┐
│EEPROM│  │ EEPROM  ││ EEPROM  ││ EEPROM  │
│ TL   │  │  TR     ││  BL     ││  BR     │
└───┬──┘  └────┬────┘└────┬────┘└────┬────┘
    │          │          │         │
    └──────────┴──────────┴─────────┘
            LED Matrix 16×16
            (4 quadrants 8×8)
```

**Chaque EEPROM** : 64 bytes × 64 frames = 4 KB (8 bytes/frame × 4 quadrants = 32 bytes/frame)

---

# 🏗️ Architecture Technique Globale

## I. Stack Technologique

### Frontend

| Technologie | Rôle | Justification |
|---|---|---|
| **React 19** | Framework UI | Gestion d'état efficace, re-renders rapides |
| **TypeScript** | Typage | Sécurité de type, prévention erreurs runtime |
| **Tailwind CSS 4** | Styling | Design réactif, thème dark intégré |
| **Zustand** | État global | Store léger, persistance localStorage |
| **Lucide React** | Icônes | Icônes vectorielles cohérentes |
| **Vite** | Build tool | Bundle ultra-rapide, HMR instantané |

### Desktop (Tauri)

| Technologie | Rôle |
|---|---|
| **Tauri 2** | Framework desktop multiplatforme |
| **Rust backend** | Sécurité mémoire, performances |
| **Plugin Dialog** | Dialogue native fichiers |
| **Plugin FS** | Accès système de fichiers |

### Autres libraires

| Package | Utilisation |
|---|---|
| **file-saver** | Téléchargement fichiers web |
| **jszip** | Compression ZIP côté navigateur |
| **uuid** | Génération IDs uniques |
| **clsx/tailwind-merge** | Utilitaires CSS |

---

## II. Architecture en Couches

```
┌─────────────────────────────────────┐
│        UI Components Layer           │
│  (MatrixGrid, Timeline, Toolbar)     │
├─────────────────────────────────────┤
│      State Management Layer          │
│  (Zustand Store - useStore.ts)       │
├─────────────────────────────────────┤
│      Business Logic Layer            │
│  (matrix-utils, generateShape)       │
├─────────────────────────────────────┤
│      Export/IO Layer                 │
│  (binary-export, tauri-export)       │
├─────────────────────────────────────┤
│      Data Types Layer                │
│  (types.ts - Frame, Project, etc)    │
└─────────────────────────────────────┘
```

### Flux de données

```
User Action (click pixel)
        ↓
MatrixGrid Component (handleDraw)
        ↓
useStore.updateGrid()
        ↓
Zustand State (currentProject.frames[index].grid)
        ↓
Component re-renders (React)
        ↓
Visual feedback (LED cell toggles)
```

---

## III. Structure des Fichiers

```
src/
├── App.tsx                          # Point d'entrée principal
├── main.tsx                         # Bootstrap React
├── index.css                        # Styles globaux
├── App.css                          # Styles App
│
├── components/
│   ├── MatrixGrid.tsx              # Grille 16×16 interactive
│   ├── Timeline.tsx                # Panneau frames + playback
│   ├── ControlPanel.tsx            # Brush/Eraser + Blink
│   ├── ExportPanel.tsx             # Configuration export binaire
│   ├── ShapesPanel.tsx             # Formes + transformations
│   ├── Toolbar.tsx                 # Outils supplémentaires
│
├── store/
│   └── useStore.ts                 # État global (Zustand)
│
├── core/
│   ├── types.ts                    # Types TypeScript (Frame, Project, ExportConfig)
│   ├── matrix-utils.ts             # Utilitaires grille (rotation, shift, etc)
│   ├── binary-export.ts            # Logique export binaire (8×8 blocks)
│
├── utils/
│   ├── tauri-export.ts             # Intégration Tauri + fallback web
│   ├── cn.ts                       # Utilitaire CSS (clsx + tailwind-merge)
│
└── assets/
    └── logo.png                    # Logo application

src-tauri/
├── Cargo.toml                      # Dépendances Rust
├── tauri.conf.json                 # Configuration Tauri
├── src/
│   └── main.rs                     # Point d'entrée Rust
└── icons/                          # Icônes application
```

---

## IV. Types de Données Clés

### Frame

```typescript
interface Frame {
    id: string;              // UUID unique
    grid: Matrix16x16;       // Grille 16×16 (0|1)
    duration: number;        // Durée en ms
}
```

### Project

```typescript
interface Project {
    id: string;              // UUID unique
    name: string;            // Nom du projet
    createdAt: number;       // Timestamp création
    updatedAt: number;       // Timestamp dernière modif
    frames: Frame[];         // Toutes les frames
    exportConfig: ExportConfig; // Configuration export
    playbackSpeed: number;   // Vitesse playback (ms)
}
```

### ExportConfig

```typescript
interface ExportConfig {
    bitReversal: boolean;    // Inversion bits D0↔D7
    flipX: boolean;          // Miroir horizontal
    flipY: boolean;          // Miroir vertical
    invertOutput: boolean;   // Polarité (Active High/Low)
    offsetY: number;         // Décalage circulaire vertical
    loopSize: number;        // Taille boucle EEPROM
}
```

### Matrix16x16

```typescript
type PixelState = 0 | 1;
type Matrix16x16 = PixelState[][];  // [16][16]
```

---

## V. État Global (Zustand Store)

Le store gère :

| Catégorie | Éléments |
|---|---|
| **Projet courant** | currentProject, currentFrameIndex |
| **Projets récents** | recentProjects (max 10) |
| **Playback** | isPlaying, playbackSpeed |
| **Sélection** | selectedTool, blinkFrequency |
| **Historique** | history, historyIndex (Undo/Redo) |
| **UI** | timelineHeight, toastMessage |

### Persistance

- **localStorage** : automatique via middleware Zustand `persist`
- **Clé** : `led-matrix-studio-storage`
- **Données persistées** : currentProject, recentProjects, timelineHeight
- **Durée de vie** : jusqu'à suppression manuelle du localStorage

---

# 🎨 Fonctionnalités Détaillées

# 🎨 Fonctionnalités Détaillées

## I. Édition de Grille (Core Feature)

### A. Dessin Pixel-by-Pixel

**Quoi :** Cliquer/Glisser sur la grille 16×16 pour allumer/éteindre des pixels

**Pourquoi :**
- Interface la plus intuitive pour créer des motifs
- Permet du prototypage rapide
- Base de toute animation

**Comment ça marche :**

```typescript
// src/components/MatrixGrid.tsx
const handleDraw = useCallback((row: number, col: number, isClick: boolean = false) => {
    if (!currentGrid) return;
    
    // Si c'est un outil de forme, n'appliquer qu'au clic
    if (selectedTool !== 'brush' && selectedTool !== 'eraser') {
        if (!isClick) return;
        // Appliquer la forme centrée...
    }
    
    // Logique brush/eraser
    const newGrid = currentGrid.map(r => [...r]);
    const newValue: PixelState = selectedTool === 'brush' ? 1 : 0;
    
    if (newGrid[row][col] !== newValue) {
        newGrid[row][col] = newValue;
        updateGrid(newGrid);  // Met à jour Zustand
    }
}, [currentGrid, selectedTool, updateGrid, pushToHistory]);

// Événements souris
const handleMouseDown = (row: number, col: number) => {
    isDrawing.current = true;
    pushToHistory();  // Sauvegarde avant modification
    handleDraw(row, col, true);
};

const handleMouseEnter = (row: number, col: number) => {
    if (isDrawing.current) {
        handleDraw(row, col, false);  // Glissement continu
    }
};
```

**Responsivité :**
- Grille adapte sa taille aux écrans (cellSize calculée dynamiquement)
- Minimum 8px, maximum 22px par cellule
- Calcul basé sur espace disponible et résolution

### B. Sélection d'Outils

```
┌──────────────────┐
│  DRAWING TOOLS   │
├──────────────────┤
│  🖌️ Brush        │ Allume pixels (value = 1)
│  🗑️ Eraser       │ Éteint pixels (value = 0)
└──────────────────┘
```

**Raison du design :** Binary (on/off) = parfait pour LED

---

## II. Gestionnaire de Formes (Shapes Panel)

### A. Formes Prédéfinies

**8 formes disponibles :**

| Forme | Générateur | Use Case |
|---|---|---|
| **Cercle** | Distance euclidienne depuis centre | Spotlights, patterns circulaires |
| **Carré** | Lignes horizontales/verticales | Cadres, bordures |
| **Losange** | Diagonales depuis centre | Designs géométriques |
| **Croix** | Axes horizontaux/verticaux | Croix, réseau |
| **Cœur** | Pattern ASCII hardcodé | Animations affectives |
| **Flèche ↑** | Combinaison lignes + triangles | Navigation, directions |
| **Flèche ↓** | Inverse flèche ↑ | Directions alternatives |
| **Damier** | Modulo (r+c) % 2 | Patterns alternés |

### B. Mécanisme d'Application des Formes

```typescript
// Quand on clique avec une forme sélectionnée :
const shapeGrid = generateShape(selectedTool);  // Grille 16×16 pattern

// Centrer sur le pixel cliqué
const offsetX = col - 7;
const offsetY = row - 7;

// Fusionner la forme dans la grille courante
for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 16; c++) {
        if (shapeGrid[r][c]) {
            const targetR = r + offsetY;
            const targetC = c + offsetX;
            if (targetR >= 0 && targetR < 16 && targetC >= 0 && targetC < 16) {
                newGrid[targetR][targetC] = 1;  // Allume pixel
            }
        }
    }
}
```

**Pourquoi centrer sur le clic :** L'utilisateur pense à placer la forme "à cet endroit", pas au coin top-left

### C. Générateur de Formes

```typescript
export const generateShape = (shape: string): Matrix16x16 => {
    const grid = createEmptyGrid();
    const cx = 7.5, cy = 7.5;  // Centre de la grille 16×16
    
    switch (shape) {
        case 'circle':
            for (let r = 0; r < 16; r++) {
                for (let c = 0; c < 16; c++) {
                    const dist = Math.sqrt((r - cy) ** 2 + (c - cx) ** 2);
                    if (dist >= 5 && dist <= 7) grid[r][c] = 1;  // Anneau
                }
            }
            break;
        // ... autres formes
    }
    return grid;
};
```

---

## III. Transformations de Frame

### A. Rotations 90°

**Rotation Horaire (CW) :**

```typescript
// [r][c] → [c][15-r]
newGrid[c][GRID_SIZE - 1 - r] = grid[r][c];
```

**Utilité :**
- Réutiliser un pattern sous différentes orientations
- Créer des animations tournantes

**Exemple :**
```
Avant:        Après CW:
█ . . .       . . . █
. . . .       . . . .
. . . .       . . . .
. . . .       . . . .
```

### B. Miroirs (Flip)

**Horizontal (flipX) :**
```typescript
// Inverse chaque ligne
grid.map(row => [...row].reverse())
```

**Vertical (flipY) :**
```typescript
// Inverse l'ordre des lignes
[...grid].reverse().map(row => [...row])
```

**Raison :**
- Symmétrie pour patterns élégants
- Adaptation à différents layouts hardware

### C. Décalages Cycliques (Shift)

**Direction :** up, down, left, right

**Implémentation :**
```typescript
const shiftGrid = (grid: Matrix16x16, dx: number, dy: number, wrap: boolean = true): Matrix16x16 => {
    const newGrid = createEmptyGrid();
    
    for (let r = 0; r < 16; r++) {
        for (let c = 0; c < 16; c++) {
            let newR = r - dy;
            let newC = c - dx;
            
            if (wrap) {
                // Boucle cyclique
                newR = (newR + 16) % 16;
                newC = (newC + 16) % 16;
                newGrid[r][c] = grid[newR][newC];
            }
        }
    }
    return newGrid;
};
```

**Pourquoi wrap :** Animation scrolling/wrapping visuelle

### D. Inversion (Invert)

**Logique :**
```typescript
grid.map(row => row.map(pixel => (pixel === 1 ? 0 : 1)))
```

**Cas d'usage :**
- Créer contraste optique
- Inverted = négatif photo
- Effet disco/strobe

---

## IV. Timeline & Gestion des Frames

### A. Concept de Frame

**Frame** = une image unique de la matrice à un instant T

- **Duration** : combien de temps afficher cette frame (ms)
- **Grid** : l'état 16×16 de la LED

### B. Opérations sur Frames

| Opération | Action | Historique |
|---|---|---|
| **Ajouter** | Crée frame vide après la courante | ✅ Oui |
| **Dupliquer** | Clone frame courante (copie profonde grid) | ✅ Oui |
| **Supprimer** | Retire frame (min 1 frame requis) | ✅ Oui |
| **Réorganiser** | Drag-drop dans timeline | ✅ Oui |

### C. Timeline UI

```
┌─ Playback Controls ────┬─ Frame Thumbnails ────────────┐
│ [▶/⏸] Speed [████ 200ms] │ [F1] [F2] [F3*] [F4] ...   │
├────────────────────────┴───────────────────────────────┤
│ * = Frame actuelle (sélection verte)                    │
│ Drag to reorder, right-click for menu (duplicate/del)  │
└────────────────────────────────────────────────────────┘
```

### D. Playback (Animation)

```typescript
// src/App.tsx
useEffect(() => {
    let interval: number;
    if (isPlaying && frames.length > 0) {
        interval = window.setInterval(() => {
            const nextIndex = (currentFrameIndex + 1) % frames.length;
            setCurrentFrameIndex(nextIndex);
        }, playbackSpeed);  // Boucle cyclique
    }
    return () => clearInterval(interval);
}, [isPlaying, currentFrameIndex, frames.length, playbackSpeed, setCurrentFrameIndex]);
```

**Boucle infinité :** Esssentiel pour pattern répétés

---

## V. Clignotement (Blink Frequency)

### A. Qu'est-ce que c'est ?

**Clignotement visuel** : simulation du clignotement LED en temps réel

**Contrôle :**
- Range 0-50 Hz
- 0 = OFF (pas de clignotement)
- 50 Hz = clignotement rapide

### B. Implémentation

```typescript
// Dans MatrixGrid.tsx
const blinkStyle = blinkFrequency > 0 ? {
    '--blink-duration': `${1 / blinkFrequency}s`  // Période
} as React.CSSProperties : {};

// CSS avec @keyframes
const isBlinking = pixel === 1 && blinkFrequency > 0;
className={`led-cell ${isBlinking ? 'led-blinking' : ''}`}
```

```css
/* index.css */
@keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

.led-blinking {
    animation: blink var(--blink-duration, 1s) infinite;
}
```

### C. Pourquoi c'est utile

- **Prévisualisation** : voir l'effet clignotement avant export
- **Démonstration** : montrer le comportement LED réel
- **Debug** : identifier pixels défectueux

---

## VI. Gestion des Outils et États

### A. ToolType

```typescript
type ToolType = 'brush' | 'eraser' | ShapeType;
type ShapeType = 'circle' | 'square' | 'diamond' | 'cross' | 'heart' | 'arrow_up' | 'arrow_down' | 'checker';
```

### B. État de l'outil

```typescript
// Zustand store
selectedTool: ToolType;      // Outil courant
blinkFrequency: number;      // 0-50 Hz

// Setters
setSelectedTool: (tool: ToolType) => void;
setBlinkFrequency: (freq: number) => void;
```

### C. Intégration UI

**ShapesPanel.tsx** : Grille 4 colonnes de formes (responsive)

```tsx
<button
    onClick={() => applyShape(type)}
    className={selectedTool === type ? 'active' : ''}
    disabled={!hasFrame}
>
    {icon}
</button>
```

---

## VII. Raccourcis Clavier

| Raccourci | Action | Contexte |
|---|---|---|
| **Ctrl+Z** | Undo (revenir un état arrière) | Partout |
| **Ctrl+Y** | Redo (revenir un état avant) | Partout |
| **Ctrl+S** | Sauvegarder projet courant | Partout |
| **Espace+Clic** | Appliquer forme | Sur MatrixGrid (futur) |

**Implémentation :**

```typescript
useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'z':
                    e.preventDefault();
                    undo();
                    break;
                case 'y':
                    e.preventDefault();
                    redo();
                    break;
                case 's':
                    e.preventDefault();
                    saveCurrentProject();
                    break;
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
}, [undo, redo, saveCurrentProject]);
```

---

## VIII. Historique (Undo/Redo)

### A. Concept

**History** = pile d'états Project

```typescript
interface AppState {
    history: Project[];           // Tous les états
    historyIndex: number;         // Position courante
}
```

### B. Logique

```
Undo: historyIndex--
Redo: historyIndex++

Example:
history = [State0, State1, State2, State3]
index = 2 (State2 courant)

Undo → index = 1 (State1)
Redo → index = 2 (State2)
```

### C. Limitations

- **Limite de 20 états** : prévenir débordement mémoire
- **Limité par action** : chaque stroke/transformation = 1 entrée
- **Auto-save** : pas de sauvegarde historique entre sessions

**Raison :** Équilibre UX/performance

---

# 🔧 Système d'Export Binaire

## I. Vue d'Ensemble

### A. Objectif de l'Export

Convertir les animations 16×16 en **fichiers binaires EEPROM** prêts à être chargés sur microcontrôleur

### B. Cible Hardware

**Configuration standard :**
- 4 EEPROMs (8KB chacun = 64 frames × 64 bytes/frame)
- Chacune stocke un quadrant 8×8 :
  - **TL (Top-Left)** : lignes 0-7, colonnes 0-7
  - **TR (Top-Right)** : lignes 0-7, colonnes 8-15
  - **BL (Bottom-Left)** : lignes 8-15, colonnes 0-7
  - **BR (Bottom-Right)** : lignes 8-15, colonnes 8-15

```
Grille 16×16 divisée en 4 quadrants 8×8 :

┌─────────┬─────────┐
│   TL    │   TR    │
│ (0-7,   │ (0-7,   │
│  0-7)   │ 8-15)   │
├─────────┼─────────┤
│   BL    │   BR    │
│ (8-15,  │ (8-15,  │
│  0-7)   │ 8-15)   │
└─────────┴─────────┘
```

### C. Résultat de l'Export

**4 fichiers binaires :**
- `project_TL.bin` (512 bytes pour 64 frames)
- `project_TR.bin`
- `project_BL.bin`
- `project_BR.bin`

Chaque fichier = 8 bytes/frame (8 lignes × 1 byte/ligne)

---

## II. Mécanisme Détaillé d'Export

### A. Pipeline de Transformation

```
Frame 16×16
    ↓
[Split into 4 × 8×8 blocks]
    ↓
[For each block: process_8x8_block()]
    ↓
[Apply configuration: flipX, flipY, bitReversal, invertOutput, offsetY]
    ↓
[Encode to bytes]
    ↓
Binary data
```

### B. Process 8×8 Block Détaillé

```typescript
const process8x8Block = (
    grid: Matrix16x16,
    startRow: number,
    startCol: number,
    config: ExportConfig
): number[] => {
    const { bitReversal, flipX, flipY, invertOutput, offsetY } = config;
    const blockBytes: number[] = [];

    // ÉTAPE 1: Lecture brute (avec gestion Flip Y)
    const rawRows: number[][] = [];
    
    if (flipY) {
        // Lire de bas en haut (inversé)
        for (let r = startRow + 7; r >= startRow; r--) {
            let rowPixels = grid[r].slice(startCol, startCol + 8);
            if (flipX) {
                rowPixels = [...rowPixels].reverse();  // Inverser colonnes
            }
            rawRows.push([...rowPixels]);
        }
    } else {
        // Lire de haut en bas (normal)
        for (let r = startRow; r < startRow + 8; r++) {
            let rowPixels = grid[r].slice(startCol, startCol + 8);
            if (flipX) {
                rowPixels = [...rowPixels].reverse();
            }
            rawRows.push([...rowPixels]);
        }
    }

    // ÉTAPE 2: Décalage circulaire vertical (offsetY)
    const shiftedRows = rotateArray(rawRows, offsetY);

    // ÉTAPE 3: Encodage en octets
    for (const rowPixels of shiftedRows) {
        // Inversion de polarité si configurée
        const finalPixels = invertOutput
            ? rowPixels.map(p => (p ? 0 : 1))
            : rowPixels;

        let byteVal = 0;
        for (let i = 0; i < 8; i++) {
            if (finalPixels[i]) {
                // Bit Reversal: si vrai, inverser l'ordre des bits
                const shift = bitReversal ? (7 - i) : i;
                byteVal |= (1 << shift);  // Mettre le bit à 1
            }
        }
        blockBytes.push(byteVal);
    }

    return blockBytes;  // 8 bytes pour 8 lignes
};
```

### C. Exemple Concret

**Frame originale (16×16) :**
```
█ . . . | . . . .
. . . . | . . . .
...
───────────────────
. . . . | . . . .
. . . . | . . . .
```

**Extraction TL (0-7, 0-7) :**
```
█ . . .
. . . .
. . . .
. . . .
. . . .
. . . .
. . . .
. . . .
```

**Sans option :** Chaque ligne = byte
- Ligne 0: `█ . . .` = `10000000` en binaire
- Mais dépend du `bitReversal` et `flipX`

---

## III. Configuration d'Export Expliquée

### A. Bit Reversal (D0 ↔ D7)

**Qu'est-ce que c'est :** Inverser l'ordre des bits d'un byte

| Option | Résultat | Cas d'usage |
|---|---|---|
| **OFF** | Bit 0 = première LED, Bit 7 = huitième | Microcontrôleur standard |
| **ON** | Bit 0 = huitième LED, Bit 7 = première | Câblage inversé, arrangement spécifique |

**Exemple :**
```
Pixel original : [1, 0, 0, 0, 0, 0, 0, 1]
                 [B7,B6,B5,B4,B3,B2,B1,B0]

Sans reversal : Byte = 0b10000001 = 0x81
Avec reversal : Byte = 0b10000001 = 0x81 (symétrique!)

Cas asymétrique:
Pixel original : [1, 0, 0, 0, 0, 0, 0, 0]
Sans reversal : 0b10000000 = 0x80
Avec reversal : 0b00000001 = 0x01  ← Différent!
```

**Configuration typique :** ON (compatibilité avec la plupart des hardwares)

### B. Flip X (Horizontal Mirror)

**Qu'est-ce que c'est :** Inverser l'ordre des colonnes dans chaque ligne

**Cas :**
```
Avant FlipX :     Après FlipX :
█ . . .           . . . █
. . . .           . . . .
. . . .           . . . .
. . . .           . . . .
```

**Raison d'utiliser :**
- Layout d'affichage : matrice physique câblée en miroir
- Correction d'orientation : si pixels apparaissent inversés
- Récupération : retrouver orientation après erreur

**Configuration typique :** ON (beaucoup de layouts hardware utilisent cette convention)

---

### C. Flip Y (Vertical Mirror)

**Qu'est-ce que c'est :** Inverser l'ordre des lignes

```
Avant FlipY :     Après FlipY :
█ . . .           . . . .
. . . .           . . . .
. . . .           . . . .
. . . .           █ . . .
```

**Raison :**
- Certains microcontrôleurs envoient les données de bas en haut
- Correction d'orientation vertical
- Configuration spécifique du board

**Configuration typique :** OFF (rarement utilisé)

---

### D. Invert Output (Active Low vs Active High)

**Concept fondamental d'électronique :**

| Mode | Logique | LED ON | LED OFF |
|---|---|---|---|
| **Active High** | Standard | Pin=1 (5V) | Pin=0 (GND) |
| **Active Low** | Inversé | Pin=0 (GND) | Pin=1 (5V) |

**Pourquoi ça existe :**
- Microcontrôleur différents ont des sorties inversées
- Transistor d'inversion (NPN vs PNP)
- Contrainte de circuit (pullup résistance)

**Implémentation :**
```typescript
const finalPixels = invertOutput
    ? rowPixels.map(p => (p ? 0 : 1))  // 1→0, 0→1
    : rowPixels;                        // Inchangé
```

**Configuration typique :** ON (beaucoup de boards utilisent active-low)

---

### E. Offset Y (Décalage Circulaire Vertical)

**Qu'est-ce que c'est :** Rotation circulaire des lignes

**Exemple avec offset = 2 :**
```
Avant :           Après offset +2 :
L0: █ . . .       L0: . . . .
L1: . █ . .       L1: . . . .
L2: . . █ .       L2: █ . . .
L3: . . . █       L3: . █ . .
L4: . . . .  →    L4: . . █ .
L5: . . . .       L5: . . . █
L6: . . . .       L6: . . . .
L7: . . . .       L7: . . . .
```

**Implémentation :**
```typescript
const rotateArray = <T>(arr: T[], offset: number): T[] => {
    if (arr.length === 0) return arr;
    const len = arr.length;
    const n = ((offset % len) + len) % len;  // Normaliser
    return [...arr.slice(len - n), ...arr.slice(0, len - n)];
};
```

**Raison d'utiliser :**
- **Correction d'alignement** : pixels décalés verticalement
- **Compensation matériel** : EEPROM lit dans un ordre spécifique
- **Synchronisation** : aligner frames avec timing hardware

**Configuration typique :** -1 (légère correction standard)

**Range :** -8 à +8 (pour 8 lignes)

---

### F. Loop Size (Taille de Boucle EEPROM)

**Qu'est-ce que c'est :** Nombre de frames répétées dans la boucle d'animation

**Exemple :**
```
User crée 3 frames : [F0, F1, F2]
LoopSize = 6 :

EEPROM final : [F0, F1, F2, F0, F1, F2]
```

**Raison :**
- **Limitation EEPROM** : généralement 64 ou 128 bytes
- **8 bytes/frame** → max 8 frames (pour 64 bytes)
- **User peut créer** 1 frame répétée
- **Loop size** ajuste automatiquement la répétition

**Calcul :**
```
Bytes per frame = 8 bytes/quadrant × 4 quadrants = 32 bytes
Max frames = EEPROM size / bytes per frame
            = 64 bytes / 32 bytes = 2 frames (minimum)
            = 4096 bytes / 32 bytes = 128 frames (gros EEPROM)
```

**Valeur typique :** 64 frames (configuration standard)

---

## IV. Stratégie de Sélection des Options

### Scénario 1 : Hardware Standard

```
Hardware: STM32F103 + 4 EEPROMs 8KB
Affichage fonctionne mal : pixels inversés

Solution :
✓ flipX = ON        (inverser colonnes)
✓ invertOutput = ON (active-low)
✓ bitReversal = ON  (standard)
✓ flipY = OFF       (rarement nécessaire)
✓ offsetY = -1      (correction mineure)
```

### Scénario 2 : Layout Personnalisé

```
Hardware: Matrice LED câblée manuellement
Certaines lignes mal ordonnées

Solution :
1. Commencer avec defaults
2. Tester offsetY : -2, -1, 0, +1, +2
3. Si colonnes inversées → flipX = ON
4. Si polarité inversée → invertOutput = ON
5. Itérer jusqu'à match parfait
```

### Scénario 3 : Débogage

```
Problème: Affichage complètement chaotique

Procédure:
1. Créer simple pattern (croix) → exporter
2. Charger sur hardware, observer
3. Noter les différences viselles
4. Ajuster une seule option à la fois
5. Rejouer jusqu'à succès
```

---

## V. Export Multiframe

### A. Répétition Automatique

```typescript
for (let i = 0; i < targetLoopSize; i++) {
    const frame = frames[i % frames.length];  // Modulo loop
    // Process frame i...
}
```

**Exemple :**
```
User a 2 frames, loopSize = 64
Frame 0: Animation blinking
Frame 1: Animation alternée

EEPROM: [F0, F1, F0, F1, F0, F1, ..., F0, F1]  (32 fois)
```

### B. Optimisation d'Espace

```
Bytes utilisés = loopSize × 32 bytes
                = 64 × 32 = 2048 bytes

EEPROM 8KB = 8192 bytes
Utilisation = 2048 / 8192 = 25%

Pour 100% : loopSize = 256 frames
```

---

# 💾 Gestion Complète des Projets

## I. Sauvegarde Locale

### A. Système de Persistance

**Technologie :** Zustand + localStorage

```typescript
// src/store/useStore.ts
export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // ... actions
        }),
        {
            name: 'led-matrix-studio-storage',
            partialize: (state) => ({
                currentProject: state.currentProject,
                recentProjects: state.recentProjects,
                timelineHeight: state.timelineHeight,
            }),
        }
    )
);
```

**localStorage clé :** `led-matrix-studio-storage`

**Stockage :**
- currentProject (jusqu'à ~100 KB)
- recentProjects (liste limitée à 10)
- timelineHeight (hauteur préférée)

### B. Auto-save

```typescript
// src/App.tsx - Auto-save toutes les 60 secondes
useEffect(() => {
    if (currentProject) {
        const timer = setInterval(() => {
            saveCurrentProject(false);  // Sans toast
        }, 60000);  // 60 secondes
        return () => clearInterval(timer);
    }
}, [currentProject, saveCurrentProject]);
```

**Raison :** Prévenir perte de travail

**Comportement :** 
- Silencieux (pas de notification)
- Met à jour updatedAt
- Sauvegarde dans localStorage uniquement

### C. Limite de Projets Récents

```typescript
// Max 10 projets dans recentProjects
recentProjects: [project, ...state.recentProjects.filter(p => p.id !== project.id)]
    .slice(0, 10)
```

**Raison :** Limiter taille localStorage (~5MB max)

---

## II. Export JSON (Sauvegarde Complète)

### A. Qu'est-ce que c'est

Export du projet complet en JSON = **format portable**

```json
{
  "id": "uuid",
  "name": "Mon Animation",
  "createdAt": 1702000000000,
  "updatedAt": 1702000000000,
  "frames": [
    {
      "id": "uuid",
      "grid": [
        [0, 1, 0, ...],
        [1, 0, 1, ...],
        ...
      ],
      "duration": 200
    }
  ],
  "exportConfig": {
    "bitReversal": true,
    "flipX": true,
    "flipY": false,
    "invertOutput": true,
    "offsetY": -1,
    "loopSize": 64
  },
  "playbackSpeed": 200
}
```

### B. Pourquoi JSON

| Format | Avantages | Inconvénients |
|---|---|---|
| **JSON** | Lisible, portable, versionnable | Plus lourd que binaire |
| **Binaire** | Compact | Difficile à versionner |
| **Base64** | Encapsulable | Moins lisible |

**Choix :** JSON pour **compatibilité et maintenabilité**

### C. Flux d'Export JSON

```
User: "Export JSON"
    ↓
App: exportProjectAsJson()
    ↓
Store: JSON.stringify(currentProject)
    ↓
UI: Ouvre dialogue sauvegarde fichier
    ↓
Tauri (desktop) : Utilise système de fichiers
    ou
Web : Télécharger le fichier
    ↓
Utilisateur: Obtient "project.json"
```

**Implémentation :**

```typescript
const handleExportJson = async () => {
    try {
        const json = exportProjectAsJson();
        const filename = `${currentProject?.name || 'project'}.json`;
        const success = await saveTextFile(json, filename, 
            [{ name: 'Fichiers JSON', extensions: ['json'] }]
        );
        if (success) {
            showToast('Projet JSON exporté !');
        }
    } catch (error) {
        showToast('Erreur lors de l\'export');
    }
};
```

---

## III. Import JSON (Chargement de Projet)

### A. Flux

```
User: Choisir fichier JSON
    ↓
App: Ouvre file picker
    ↓
User: Sélectionne "project.json"
    ↓
App: Lit le fichier
    ↓
Store: JSON.parse(json)
    ↓
Validation: Vérifier structure (frames, grid)
    ↓
Chargement: Créer Project object
    ↓
UI: Afficher le projet
```

### B. Validation & Sécurité

```typescript
importProjectFromJson: (json) => {
    try {
        const data = JSON.parse(json);
        if (data.frames && Array.isArray(data.frames)) {
            const project: Project = {
                id: data.id || uuidv4(),
                name: data.name || 'Imported Project',
                createdAt: data.createdAt || Date.now(),
                updatedAt: Date.now(),
                frames: data.frames,
                exportConfig: { ...DEFAULT_CONFIG, ...data.exportConfig },
                playbackSpeed: data.playbackSpeed || 200,
            };
            // Charger le projet
            set((state) => ({
                currentProject: project,
                currentFrameIndex: 0,
                isPlaying: false,
                recentProjects: [project, ...].slice(0, 10),
                history: [project],
                historyIndex: 0,
            }));
            return true;
        }
    } catch (e) {
        console.error('Failed to import project:', e);
    }
    return false;
};
```

**Points de sécurité :**
- Vérifier structure JSON
- Fusionner exportConfig avec defaults (prevent missing keys)
- Générer nouvel UUID si manquant
- Mettre updatedAt à Date.now()

---

## IV. Partage de Projets

### A. Via JSON Export

**Processus :**
1. Exporter projet → "animation.json"
2. Partager fichier (email, cloud, GitHub)
3. Autre utilisateur → importer JSON
4. Voir exactement le même projet

**Avantage :** Format texte, versionnable sur Git

### B. Futur : Partage Cloud

**Possibilité :**
```
POST /api/projects
    ↓
Obtenir shareable link: https://led-matrix-studio.vercel.app/share/abc123
    ↓
Partager URL
    ↓
Autre utilisateur clique → charge automatiquement
```

**État actuel :** Pas implémenté (localStorage uniquement)

---

## V. Gestion des Fichiers (Tauri vs Web)

### A. Abstraction tauri-export.ts

```typescript
// Détecte automatiquement l'environnement
export async function checkIsTauri(): Promise<boolean>

// Si Tauri : utiliser API native
if (inTauri) {
    const { save } = await import('@tauri-apps/plugin-dialog');
    const filePath = await save({ defaultPath: filename });
    await writeTextFile(filePath, content);
}

// Si Web : fallback téléchargement
else {
    const { saveAs } = await import('file-saver');
    const blob = new Blob([content], { type: 'application/json' });
    saveAs(blob, filename);
}
```

**Avantage :** Même code marche partout

### B. Export Binaire Spécial

```typescript
export async function saveBinaryFilesToFolder(
    files: { filename: string; data: Uint8Array }[],
    folderName: string
): Promise<boolean>

// Tauri : sauvegarder dans dossier natif
// Web : créer ZIP et télécharger
```

**Web limitation :** Pas d'accès système de fichiers → ZIP

---

# ✏️ Édition et Transformations Avancées

## I. Undo/Redo Complet

### A. Architecture

```typescript
interface AppState {
    history: Project[];       // Pile d'états
    historyIndex: number;     // Index courant
}

// Exemple:
history = [
    Project0 (création),
    Project1 (draw quelques pixels),
    Project2 (ajouter frame),
    Project3 (rotate frame),
    Project4 ← historyIndex = 4 (courant)
]
```

### B. Actions Enregistrées dans l'Historique

| Action | Enregistrement |
|---|---|
| Draw pixel stroke | ✅ Oui |
| Ajouter frame | ✅ Oui |
| Dupliquer frame | ✅ Oui |
| Supprimer frame | ✅ Oui |
| Rotation | ✅ Oui |
| Flip/Mirror | ✅ Oui |
| Shift/Décalage | ✅ Oui |
| Inversion | ✅ Oui |
| Clear frame | ✅ Oui |
| Fill frame | ✅ Oui |
| Réorganiser frames | ✅ Oui |

### C. Limites

```typescript
// Limite à 20 états
if (newHistory.length > 20) newHistory.shift();
```

**Raison :** Performance et mémoire

**Conséquence :** Ne peut revenir que 20 actions arrière

### D. Usage Usager

```
User: Undo (Ctrl+Z) → Action précédente annulée
User: Redo (Ctrl+Y) → Action rétablie
User: Undo, puis nouvelle action → ancien Redo perdu
```

---

## II. Opérations sur Grille

### A. Remplir Entièrement (Fill)

```typescript
const createFilledGrid = (): Matrix16x16 =>
    Array(16).fill(0).map(() => Array(16).fill(1));
```

**Cas :** Créer un fond blanc lumineux

### B. Vider Complètement (Clear)

```typescript
const createEmptyGrid = (): Matrix16x16 =>
    Array(16).fill(0).map(() => Array(16).fill(0));
```

**Cas :** Recommencer depuis zéro

### C. Inverser Tous les Pixels (Invert)

```typescript
const invertGrid = (grid: Matrix16x16): Matrix16x16 =>
    grid.map(row => row.map(pixel => (pixel === 1 ? 0 : 1)));
```

**Cas :** Créer un négatif optique

---

## III. Transformations Composables

**Idée :** Combiner plusieurs transformations

```typescript
// Rotation + Flip = effet spécial
let grid = currentGrid;
grid = rotateGrid(grid, true);      // Rotate CW
grid = flipFrameHorizontal(grid);   // Mirror
grid = shiftGrid(grid, 0, 1);       // Shift down
```

**Pas implémenté:** Composing UI
**Futur:** Macro de transformations

---

# 🔌 Extensibilité Multi-Matrices

## I. Vision Actuelle

**Limitée à :** 1 matrice 16×16

**Raison :** Scope du TP/projet initial

---

## II. Chemin d'Extension : Matrices Multiples

### A. Architecture Proposée

```typescript
// Étendre types.ts
interface Project {
    id: string;
    name: string;
    matrices: Matrix[];  // Plusieurs matrices
    // ...
}

interface Matrix {
    id: string;
    name: string;        // "Panel 1", "Panel 2"
    width: number;       // 16
    height: number;      // 16
    frames: Frame[];      // Animations propres
}

interface Frame {
    id: string;
    grid: Matrix16x16;
    duration: number;
    // Ajouter matrixId ou globalSync
}
```

### B. Synchronisation d'Animation

**Option 1 : Timeline Globale**
```
┌─────────────────────────────────────┐
│  Global Timeline (1 playhead)        │
├─────────┬─────────┬─────────┐
│ Matrix1 │ Matrix2 │ Matrix3 │ ...
│  [F0]   │  [F0]   │  [F0]   │
└─────────┴─────────┴─────────┘
```

**Tous les panneaux synchronisés → animations coordonnées**

**Option 2 : Timeline Indépendante**
```
Matrix1: [F0→F1→F2→F0...]
Matrix2: [F0→F2→F4→F0...]  (décalage)
Matrix3: [F0→F1→F0→F1...]  (fréq différente)
```

**Chacun sa propre animation**

### C. Export Multi-Matrices

**Résultat :**
```
project_matrix1_TL.bin
project_matrix1_TR.bin
project_matrix1_BL.bin
project_matrix1_BR.bin
project_matrix2_TL.bin
project_matrix2_TR.bin
...
```

**Configuration Hardware :**
```
MCU1 : chargé avec matrix1_*.bin
MCU2 : chargé avec matrix2_*.bin
```

### D. Étapes d'Implémentation

1. **Étape 1 :** Refactorer types (permettre multiple matrices)
2. **Étape 2 :** Adapter store pour gérer list de matrices
3. **Étape 3 :** UI pour switcher entre matrices
4. **Étape 4 :** Synchronisation timeline
5. **Étape 5 :** Export multi-fichiers

**Effort :** ~40-50 heures de développement

---

## III. Autres Tailles de Matrices Supportables

### 8×8 Matrix

**Simplement :** 1 EEPROM au lieu de 4

```typescript
// Pas besoin de quadrants
export const generateBinaryFiles = async (
    frames: Frame[],
    config: ExportConfig,
    size: '8x8' | '16x16' = '16x16'
) => {
    if (size === '8x8') {
        // Exporter directement sans découpage
    }
}
```

### 32×32 Matrix

**Configuration :** 4×4 = 16 EEPROMs

```
┌─────────────────┬─────────────────┐
│  Top-Left       │  Top-Right      │
│  (4×4 EEPROM)   │  (4×4 EEPROM)   │
├─────────────────┼─────────────────┤
│  Bottom-Left    │  Bottom-Right   │
│  (4×4 EEPROM)   │  (4×4 EEPROM)   │
└─────────────────┴─────────────────┘
```

**Implémentation :** Itération + subdivision récursive

---

# 📚 Installation et Déploiement Complet

## I. Environnement de Développement

### A. Prérequis

```
- Node.js ≥ 18 (pour npm/yarn)
- Rust (installer via rustup.rs)
- git
- VS Code (recommandé)
```

### B. Installation

```bash
# Clone le repo
git clone https://github.com/Tiger-Foxx/led-matrix-studio.git
cd led-matrix-studio

# Installer dépendances
npm install

# Installer Tauri CLI globalement (optionnel)
npm install -g @tauri-apps/cli
```

### C. Mode Développement

```bash
# Web uniquement
npm run dev
# → http://localhost:5173

# Desktop (Tauri)
npm run tauri:dev
# → Lance Tauri window + Vite server
```

---

## II. Build Web

```bash
npm run build
```

**Output :** Dossier `dist/` (fichiers statiques)

**Déploiement :**
- Vercel : `vercel deploy dist`
- GitHub Pages : Push `dist/` sur `gh-pages` branch
- Tout serveur static : `npm run build && serve dist`

---

## III. Build Desktop

```bash
npm run tauri:build
```

**Output par plateforme :**

| Plateforme | Chemin | Format |
|---|---|---|
| Windows | `src-tauri/target/release/bundle/msi/` | .msi (installer) |
| Windows | `src-tauri/target/release/bundle/nsis/` | .nsis (portable) |
| macOS | `src-tauri/target/release/bundle/dmg/` | .dmg |
| Linux | `src-tauri/target/release/bundle/deb/` | .deb |
| Linux | `src-tauri/target/release/bundle/appimage/` | .AppImage |

**Exécutable standalone :** `src-tauri/target/release/led-matrix-studio.exe` (Windows)

---

## IV. Releases sur GitHub

**Processus :**

```bash
# Tag version
git tag v1.3.0
git push origin v1.3.0

# Créer release (UI GitHub)
# → Uploader les binaires
```

**Résultat :** https://github.com/Tiger-Foxx/led-matrix-studio/releases

---



---

# 🚀 Guide Pratique Utilisateur Complet

## I. Workflow Typique d'Utilisation

### Étape 1: Créer un Nouveau Projet

```
1. Ouvrir LED Matrix Studio
2. Écran d'accueil → "Nouveau Projet"
3. Saisir nom : "Mon Animation"
4. Cliquer "Créer"
```

**Résultat :** Projet créé avec 1 frame vide 16×16

### Étape 2: Dessiner sur la Grille

```
Grille vide affichée au centre

┌────────────────────┐
│ LED Matrix Studio  │  ← Header
├────────────────────┤
│ ║ Shapes │ GRILLE  │
│ ║ Panel  │ 16×16   │
│ ║        │ (pixels)│
└────────────────────┘
    ↑         ↑
 Panel     MatrixGrid
 gauche    principal
```

**Actions :**
- **Clic gauche** (brush) : allumer pixel
- **Drag** : dessiner plusieurs pixels
- **Clic eraser** : éteindre pixel

### Étape 3: Ajouter plus de Frames

```
Timeline en bas montre Frame 1/1

Actions:
- Bouton [+] → ajouter Frame 2
- Copier icon → dupliquer Frame 1 vers Frame 2
- Modifier Frame 2 différemment
```

**Timeline :**
```
┌──────────────────────────────────────────┐
│ [▶] Speed [██████] | [F1*] [F2] [F3] ... │
│                        ↑
│                   Active frame
└──────────────────────────────────────────┘
```

### Étape 4: Configurer l'Export

```
1. Clic bouton "Export" en haut
2. Panel export s'ouvre :
   - Bit Reversal : ✓ ON
   - Flip X : ✓ ON
   - Flip Y : □ OFF
   - Invert Output : ✓ ON
   - Offset Y : -1
   - Loop Size : 64
3. Clic "Générer les fichiers .bin"
4. Sauvegarder les fichiers
```

### Étape 5: Charger sur Microcontrôleur

```
Fichiers générés:
- project_TL.bin
- project_TR.bin
- project_BL.bin
- project_BR.bin

Charger avec outil (STM32CubeProgrammer, etc):
- TL.bin → EEPROM1
- TR.bin → EEPROM2
- BL.bin → EEPROM3
- BR.bin → EEPROM4
```

---

## II. Cas d'Usage Complet : Animation LED Blinking

### Scénario

**Objectif :** Créer une animation simple : LED clignotante (2 frames)

### Exécution

```
[1] Créer projet "BlinkingLED"
[2] Frame 1 : Grille totalement allumée
    - Bouton "Fill" ou Drag paint sur toute la grille
    
[3] Ajouter Frame 2
    - Frame 2 : Grille totalement éteinte
    - Bouton "Clear"
    
[4] Tester playback
    - Clic [▶] → voir clignoter
    - Speed à 200ms → clignotement visible
    
[5] Export
    - Config par défaut
    - Générer .bin
```

**Résultat :** Animation LED clignotante 200ms ON + 200ms OFF

---

## III. Cas d'Usage : Motif Complexe (Cœur Animé)

### Étapes

```
Frame 1: Cœur plein rouge (16×16)
   - Utiliser outil Cœur → clic au centre
   
Frame 2: Cœur avec trou au centre
   - Copier Frame 1
   - Eraser pour faire trou au centre
   
Frame 3: Cœur pulsant (alternance)
   - Dupliquer Frame 1
   
Playback:
   - F1 → F2 → F3 → F1 → ... (boucle)
   - Speed : 500ms
   
Result: Cœur qui pulse doucement
```

---

## IV. Transformations Avancées

### Créer une Animation Rotative

```
Frame 1: Pixel unique en coin
┌─────────────┐
│█ . . . . .│
│. . . . . .│
│. . . . . .│
│. . . . . .│
│. . . . . .│
│. . . . . .│
└─────────────┘

Frame 2: Dupliquer F1
        Rotate CW
┌─────────────┐
│. . . . . █│
│. . . . . .│
│. . . . . .│
│. . . . . .│
│. . . . . .│
│. . . . . .│
└─────────────┘

Frame 3: F2 Rotate CW
Frame 4: F3 Rotate CW
...

Result: Pixel tournant autour (horloge)
```

### Créer un Scroll Horizontal

```
Frame 1: Motif à gauche
│█ █ . . . .│
│█ █ . . . .│
│. . . . . .│
└─────────────┘

Frame 2: Dupliquer + Shift Right
│. █ █ . . .│
│. █ █ . . .│
│. . . . . .│
└─────────────┘

Frame 3: Dupliquer F2 + Shift Right
... (continues)

Result: Motif scrolle horizontalement
```

---

## V. Dépannage Courant

### Problème 1: Export apparaît inversé

**Symptôme :** Pixels allumés apparaissent éteints et vice-versa

**Solution :**
```
Panel Export → Cocher "Inverser output (Active Low)"
```

**Raison :** Microcontrôleur utilise logique inversée

---

### Problème 2: Colonnes inversées

**Symptôme :**
```
Attendu:          Observé:
█ . . .    vs    . . . █
. . . .          . . . .
. . . .          . . . .
. . . .          . . . .
```

**Solution :**
```
Panel Export → Cocher "Miroir horizontal (X)"
```

**Raison :** Câblage du hardware inversé

---

### Problème 3: Lignes mal ordonnées

**Symptôme :** Certaines lignes apparaissent en bas au lieu du haut

**Solution :**
```
Panel Export → Ajuster "Offset Y" (-1, 0, +1, etc)
Tester chaque valeur jusqu'à match
```

**Raison :** Timing de lecture de l'EEPROM

---

### Problème 4: Bits aléatoires allumés

**Symptôme :** Pattern chaotique, pas de logique

**Solution :**
```
1. Vérifier "Bit Reversal" (ON par défaut)
2. Tester avec pattern simple (croix)
3. Ajuster une option à la fois
4. Si encore chaotique → vérifier câblage hardware
```

**Raison :** Ordre des bits ou mauvaise EEPROM

---

## VI. Optimisation d'Espace EEPROM

### Calcul de Stockage

```
Données par frame : 8 bytes × 4 EEPROM = 32 bytes/frame
EEPROM capacity : 8192 bytes
Max frames : 8192 / 32 = 256 frames
```

### Réduire Taille

```
Méthode 1: Réduire loopSize
  loopSize = 64 → 64 × 32 = 2048 bytes
  loopSize = 32 → 32 × 32 = 1024 bytes
  
Méthode 2: Créer moins de frames
  5 frames × 32 = 160 bytes (répétés)
  
Méthode 3: Réutiliser frames
  Animation A-B-C au lieu de A-B-C-A-B-C
  Economise 50%
```

---

## VII. Workflow Collaboratif

### Partager Projet

```
[1] Export JSON
    Bouton "Export JSON" → sauvegarder "animation.json"

[2] Partager fichier
    Envoyer par email / cloud / GitHub

[3] Collègue reçoit
    Import JSON
    Bouton "Importer" → sélectionner JSON
    Projet apparaît identique
```

### Version Control avec Git

```bash
# Stocker les JSON dans Git
git add animation.json
git commit -m "Add blinking LED animation"
git push

# Collègue peut récupérer et importer
git clone ...
# Importer animation.json
```

**Avantage :** History complète, diff possible (JSON lisible)

---

## VIII. FAQ

### Q: Est-ce que je peux redimensionner la grille?

**R:** Non, limitée à 16×16 (Standard TP). Futur : support 8×8 et 32×32.

---

### Q: L'historique Undo a une limite?

**R:** Oui, 20 états max. Raison : mémoire. Solution : sauvegarder JSON régulièrement.

---

### Q: Puis-je utiliser sur mobile?

**R:** Web version → oui (responsive). Desktop → non (Tauri pas sur mobile).

---

### Q: Comment je génère les icônes?

**R:** 
```bash
npm run icons:gen
```
Nécessite ImageMagick installé.

---

### Q: Les données persistent-elles?

**R:** Oui
- **localStorage** : automatic (10 projets récents max)
- **Entre sessions** : sauvegardé automatiquement
- **Supprimer** : dev tools → clear localStorage

---

### Q: Combien de temps pour créer une animation?

**R:** 
- Simple (2-3 frames) : 5-10 minutes
- Complexe (10+ frames) : 30-60 minutes
- Pro (animations synchronisées) : quelques heures

---

# 🔬 Analyse Technique Avancée

## I. Performance du Système

### Optimisations Implémentées

| Aspect | Optimisation | Résultat |
|---|---|---|
| **Rendu grille** | Memoization avec React.memo | ~60 fps stable |
| **State updates** | Zustand (atomic updates) | Pas de re-render inutile |
| **Bundle size** | Vite + Tree-shaking | ~150 KB gzipped |
| **Stockage** | localStorage (IndexedDB browser) | Accès rapide |
| **Export binaire** | Calcul côté client | Pas de latence réseau |

### Limites Actuelles

```
- Max ~100 KB projet JSON (limite localStorage)
- Max 10 projets récents (limite taille)
- Max 20 états historique (limite mémoire)
- Max 256 frames par EEPROM (limite hardware)
```

---

## II. Architecture Réactive (React + Zustand)

### Flow Mis à Jour Pixel

```
[User Click]
  ↓
MatrixGrid.handleMouseDown()
  ↓
pushToHistory() → history stack ++
  ↓
store.updateGrid(newGrid)
  ↓
Zustand set({ currentProject: {...updated...} })
  ↓
localStorage auto-persisted
  ↓
Component re-renders
  ↓
[LED pixel change visible]
```

**Latency :** <16ms (60 fps)

---

## III. Persistance Multi-Couche

```
Layer 1: Component State (React)
   ↓ (updates)
Layer 2: Zustand Store
   ↓ (middleware)
Layer 3: localStorage (Browser)
   ↓ (reload browser)
Layer 4: Recovered State
```

**Backup Stratégie :**
- Chaque action → localStorage (async)
- 60s auto-save → localStorage
- Export JSON → Cloud/Git (manuel)

---

## IV. Sécurité et Validation

### Validation d'Import JSON

```typescript
// 1. Parse JSON sécurisé
const data = JSON.parse(json);

// 2. Vérifier structure
if (!data.frames || !Array.isArray(data.frames)) throw Error;

// 3. Vérifier frames
data.frames.forEach(frame => {
    if (!frame.grid || frame.grid.length !== 16) throw Error;
});

// 4. Remplir values manquantes
exportConfig = { ...DEFAULT_CONFIG, ...data.exportConfig };

// 5. Générer UUIDs si absents
id = data.id || uuidv4();
```

**Pas de risque** : Données utilisateur seulement (pas d'exécution)

---

## V. Extensibilité du Système

### Ajouter Nouvelle Forme

```typescript
// 1. Ajouter type dans ShapeType
type ShapeType = 'circle' | ... | 'star';

// 2. Implémenter générateur
case 'star':
    for (let r = 0; r < 16; r++) {
        for (let c = 0; c < 16; c++) {
            // Logique star...
        }
    }
    break;

// 3. Ajouter bouton dans ShapesPanel
{ type: 'star', icon: <Star size={18} />, label: 'Étoile' }
```

**Effort :** 15 minutes

---

### Ajouter Nouvelle Transformation

```typescript
// 1. Implémenter dans matrix-utils.ts
export const diagonalShift = (grid: Matrix16x16): Matrix16x16 => {
    // ... logique
};

// 2. Ajouter fonction dans store
diagonalShift: () => {
    // Utiliser diagonalShift()
};

// 3. Ajouter bouton dans ShapesPanel
<button onClick={() => diagonalShift()}>Shift Diagonal</button>
```

**Effort :** 20 minutes

---

### Ajouter Export Format (e.g. Hex String)

```typescript
// 1. Créer nouveau exporteur
export const generateHexString = (frames: Frame[]): string => {
    let hex = '';
    // Convertir chaque byte en "0xFF"
    return hex;
};

// 2. Ajouter dans ExportPanel
const handleExportHex = () => {
    const hex = generateHexString(frames);
    await saveTextFile(hex, 'project.h');
};

// 3. Ajouter bouton
<button onClick={handleExportHex}>Export Hex</button>
```

**Effort :** 30 minutes

---

# 📊 Statistiques du Projet

## I. Taille du Code

```
src/components/:   ~1500 lignes (TSX)
src/store/:        ~600 lignes (TS)
src/core/:         ~400 lignes (TS)
src/utils/:        ~200 lignes (TS)
CSS/:              ~800 lignes

Total Frontend:    ~3500 lignes

src-tauri/src/:    ~100 lignes (Rust minimal)

Total:             ~3600 lignes
```

---

## II. Dépendances

```
Production: 15 packages
  - React, ReactDOM
  - Zustand
  - Tailwind CSS
  - Lucide React
  - Tauri plugins
  - etc

Dev: 20+ packages
  - TypeScript
  - ESLint
  - Vite
  - etc
```

---

## III. Compatibilité

| Plateforme | Support | Note |
|---|---|---|
| Windows 10/11 | ✅ Full | Testée |
| macOS 11+ | ✅ Full | Tauri support |
| Linux (Debian) | ✅ Full | .deb build |
| Chrome/Firefox | ✅ Full | Web version |
| Safari | ✅ Full | Web version |
| Mobile Safari | ⚠️ Partiel | UI non optimisée |
| Mobile Chrome | ⚠️ Partiel | UI non optimisée |

---

# 🎓 Utilisation Pédagogique

## I. Contexte de TP

**Durée typique du TP :** 4 heures

**Timeline :**
```
Heure 0-1 : Présentation hardw
are + LED Matrix Studio
Heure 1-2 : Créer animation simple (2-3 frames)
Heure 2-3 : Exportation et chargement EEPROM
Heure 3-4 : Débogage et perfectionnement
```

---

## II. Objectifs d'Apprentissage

### Électronique
- ✅ Comprendre matrices LED 16×16
- ✅ Adressage 4 quadrants
- ✅ EEPROM et persistent storage
- ✅ Animations en hardware

### Informatique
- ✅ Encodage binaire
- ✅ Transformations de données
- ✅ UI responsives
- ✅ Export de formats

### Soft Skills
- ✅ Prototypage rapide
- ✅ Itération design
- ✅ Documentation
- ✅ Collaboration (partage JSON)

---

## III. Exercices Proposés

### Exercice 1 : Animation Simple

**Créer :** Animation LED clignotante (blinking)

**Durée :** 15 minutes

**Compétences :** UI navigation, export basique

---

### Exercice 2 : Transformation

**Créer :** Animation rotative (pixel tourne autour)

**Durée :** 30 minutes

**Compétences :** Rotation, multiplication frames, playback

---

### Exercice 3 : Configuration Hardware

**Problème :** Export ne marche pas (pixels inversés)

**Tâche :** Trouver la bonne configuration

**Durée :** 20 minutes

**Compétences :** Configuration export, débogage

---

### Exercice 4 : Projet Libre

**Créer :** Animation thématique (cœur, étoile, etc)

**Durée :** 60 minutes

**Compétences :** Tous les aspects + créativité

---

# 🔮 Feuille de Route Future

## Court Terme (v1.4)

- [ ] Support 8×8 matrices
- [ ] Outil texte (afficher lettres)
- [ ] Patterns prédéfinis (animations stock)
- [ ] Tema clair/sombre toggle

## Moyen Terme (v1.5-v2.0)

- [ ] Support matrices multiples (16×32, 8×8×4)
- [ ] Partage cloud et galerie publique
- [ ] Animation Béziér curves
- [ ] Plugin système

## Long Terme (v2.1+)

- [ ] Support mobile app native
- [ ] Collaboration temps réel (WebSocket)
- [ ] Marketplace de patterns
- [ ] Génération IA de patterns
- [ ] Hardware simulator 3D

---

# 📞 Support & Ressources

## Documentation
- GitHub Wiki : [LED Matrix Studio Wiki](https://github.com/Tiger-Foxx/led-matrix-studio/wiki)
- Issues : [GitHub Issues](https://github.com/Tiger-Foxx/led-matrix-studio/issues)

## Versions
- **Web :** https://led-matrix-studio.vercel.app/
- **Desktop :** https://github.com/Tiger-Foxx/led-matrix-studio/releases

## Code Source
- **Repository :** https://github.com/Tiger-Foxx/led-matrix-studio
- **Auteur :** Tiger-Foxx
- **License :** (À confirmer - probablement MIT ou GPL)

---

# 🎯 Conclusion

LED Matrix Studio résout un problème réel : **créer et visualiser des animations LED sans programmation complexe**. 

**Points forts :**
- ✅ Interface intuitive et responsive
- ✅ Export binaire compatible multiple hardwares
- ✅ Historique et sauvegarde automatique
- ✅ Support web + desktop
- ✅ Cible pédagogique (TP idéal)
- ✅ Code extensible et maintenable

**Extensibilité :**
- Peut supporter multiple matrices
- Peut supporter autres tailles
- Peut s'intégrer dans workflows professionnels
- Peut devenir plateforme collaborative

**Pour débuter :**
1. Ouvrir https://led-matrix-studio.vercel.app/
2. Créer projet simple
3. Exporter JSON
4. Partager le fichier
5. Importer sur autre appareil

**Le projet est prêt pour production et enseignement.**

---

**Document généré le :** 10 décembre 2025  
**Version :** 1.3.0  

---

*Fin de la documentation technique complète*


