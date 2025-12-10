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
**Auteur de la documentation :** GitHub Copilot

---

*Fin de la documentation technique complète*
