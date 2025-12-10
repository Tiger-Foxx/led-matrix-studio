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

---

(Document continue...)
