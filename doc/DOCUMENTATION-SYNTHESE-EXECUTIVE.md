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

---

*Documentation générée le 10 décembre 2025 - LED Matrix Studio v1.3.0*
