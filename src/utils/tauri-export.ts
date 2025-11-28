/**
 * Utilitaires pour l'export de fichiers avec support Tauri (desktop) et navigateur (web)
 */

// Cache pour la détection Tauri
let _isTauriCached: boolean | null = null;

// Détecte si on est dans un environnement Tauri v2
// Essaie d'importer l'API Tauri pour une détection fiable
export async function checkIsTauri(): Promise<boolean> {
  if (_isTauriCached !== null) return _isTauriCached;
  
  try {
    // Essayer d'importer l'API Tauri - si ça marche, on est dans Tauri
    const { invoke } = await import('@tauri-apps/api/core');
    _isTauriCached = typeof invoke === 'function';
    console.log('[checkIsTauri] Détection via import @tauri-apps/api/core:', _isTauriCached);
    return _isTauriCached;
  } catch {
    // Si l'import échoue, vérifier les globals
    _isTauriCached = typeof window !== 'undefined' && 
      ('__TAURI__' in window || '__TAURI_INTERNALS__' in window);
    console.log('[checkIsTauri] Fallback globals:', _isTauriCached);
    return _isTauriCached;
  }
}

// Version synchrone (utilise le cache, retourne false si pas encore vérifié)
export function isTauri(): boolean {
  if (_isTauriCached !== null) return _isTauriCached;
  // Vérification synchrone des globals
  return typeof window !== 'undefined' && 
    ('__TAURI__' in window || '__TAURI_INTERNALS__' in window);
}

/**
 * Sauvegarde un fichier texte (JSON, etc.) avec dialogue natif en Tauri ou téléchargement en web
 */
export async function saveTextFile(
  content: string,
  defaultFilename: string,
  filters?: { name: string; extensions: string[] }[]
): Promise<boolean> {
  const inTauri = await checkIsTauri();
  console.log('[saveTextFile] Début, inTauri:', inTauri);
  
  if (inTauri) {
    try {
      console.log('[saveTextFile] Mode Tauri - import des plugins...');
      const { save } = await import('@tauri-apps/plugin-dialog');
      const { writeTextFile } = await import('@tauri-apps/plugin-fs');
      
      console.log('[saveTextFile] Plugins importés, ouverture dialogue...');
      const filePath = await save({
        defaultPath: defaultFilename,
        filters: filters || [{ name: 'Tous les fichiers', extensions: ['*'] }]
      });
      
      console.log('[saveTextFile] Chemin sélectionné:', filePath);
      if (filePath) {
        await writeTextFile(filePath, content);
        console.log('[saveTextFile] Fichier écrit avec succès!');
        return true;
      }
      console.log('[saveTextFile] Utilisateur a annulé');
      return false; // L'utilisateur a annulé
    } catch (error) {
      console.error('[saveTextFile] Erreur Tauri:', error);
      // En cas d'erreur, fallback sur le mode navigateur
      console.log('[saveTextFile] Fallback vers mode navigateur');
      const { saveAs } = await import('file-saver');
      const blob = new Blob([content], { type: 'application/json' });
      saveAs(blob, defaultFilename);
      return true;
    }
  } else {
    // Mode navigateur - téléchargement classique
    console.log('[saveTextFile] Mode navigateur - téléchargement classique');
    const { saveAs } = await import('file-saver');
    const blob = new Blob([content], { type: 'application/json' });
    saveAs(blob, defaultFilename);
    return true;
  }
}

/**
 * Sauvegarde un fichier binaire avec dialogue natif en Tauri ou téléchargement en web
 */
export async function saveBinaryFile(
  data: Uint8Array,
  defaultFilename: string,
  filters?: { name: string; extensions: string[] }[]
): Promise<boolean> {
  const inTauri = await checkIsTauri();
  
  if (inTauri) {
    try {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const { writeFile } = await import('@tauri-apps/plugin-fs');
      
      const filePath = await save({
        defaultPath: defaultFilename,
        filters: filters || [{ name: 'Tous les fichiers', extensions: ['*'] }]
      });
      
      if (filePath) {
        await writeFile(filePath, data);
        return true;
      }
      return false; // L'utilisateur a annulé
    } catch (error) {
      console.error('Erreur lors de la sauvegarde binaire Tauri:', error);
      // Fallback vers mode navigateur
      const { saveAs } = await import('file-saver');
      const blob = new Blob([new Uint8Array(data)], { type: 'application/octet-stream' });
      saveAs(blob, defaultFilename);
      return true;
    }
  } else {
    // Mode navigateur - téléchargement classique
    const { saveAs } = await import('file-saver');
    const blob = new Blob([new Uint8Array(data)], { type: 'application/octet-stream' });
    saveAs(blob, defaultFilename);
    return true;
  }
}

/**
 * Sélectionne un dossier et sauvegarde plusieurs fichiers binaires dedans
 * Retourne true si tous les fichiers ont été sauvegardés, false si annulé
 */
export async function saveBinaryFilesToFolder(
  files: { filename: string; data: Uint8Array }[],
  suggestedFolderName?: string
): Promise<boolean> {
  const inTauri = await checkIsTauri();
  console.log('[saveBinaryFilesToFolder] inTauri:', inTauri);
  
  if (inTauri) {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const { writeFile } = await import('@tauri-apps/plugin-fs');
      const { join } = await import('@tauri-apps/api/path');
      
      console.log('[saveBinaryFilesToFolder] Ouverture dialogue dossier...');
      // Ouvrir un dialogue pour sélectionner un dossier
      const folderPath = await open({
        directory: true,
        multiple: false,
        title: 'Sélectionnez le dossier de destination'
      });
      
      console.log('[saveBinaryFilesToFolder] Dossier sélectionné:', folderPath);
      if (folderPath && typeof folderPath === 'string') {
        // Sauvegarder chaque fichier dans le dossier
        for (const file of files) {
          const fullPath = await join(folderPath, file.filename);
          console.log('[saveBinaryFilesToFolder] Écriture:', fullPath);
          await writeFile(fullPath, file.data);
        }
        console.log('[saveBinaryFilesToFolder] Tous les fichiers écrits!');
        return true;
      }
      return false; // L'utilisateur a annulé
    } catch (error) {
      console.error('Erreur lors de la sauvegarde multiple Tauri:', error);
      // Fallback vers mode navigateur (ZIP)
      console.log('[saveBinaryFilesToFolder] Fallback vers ZIP');
      const JSZip = (await import('jszip')).default;
      const { saveAs } = await import('file-saver');
      
      const zip = new JSZip();
      for (const file of files) {
        zip.file(file.filename, file.data);
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${suggestedFolderName || 'export'}.zip`);
      return true;
    }
  } else {
    // Mode navigateur - créer un ZIP et télécharger
    console.log('[saveBinaryFilesToFolder] Mode navigateur - création ZIP');
    const JSZip = (await import('jszip')).default;
    const { saveAs } = await import('file-saver');
    
    const zip = new JSZip();
    for (const file of files) {
      zip.file(file.filename, file.data);
    }
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${suggestedFolderName || 'export'}.zip`);
    return true;
  }
}
