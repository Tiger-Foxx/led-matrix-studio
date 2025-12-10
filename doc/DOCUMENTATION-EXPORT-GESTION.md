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

(Document continue dans le fichier suivant...)
