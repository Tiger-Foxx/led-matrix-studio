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

(Document continue dans le fichier suivant...)
