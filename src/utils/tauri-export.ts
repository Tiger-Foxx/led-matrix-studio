/**
 * Utilitaires pour l'export de fichiers avec support Tauri (desktop) et navigateur (web)
 */

// Détecte si on est dans un environnement Tauri
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

/**
 * Sauvegarde un fichier texte (JSON, etc.) avec dialogue natif en Tauri ou téléchargement en web
 */
export async function saveTextFile(
  content: string,
  defaultFilename: string,
  filters?: { name: string; extensions: string[] }[]
): Promise<boolean> {
  if (isTauri()) {
    try {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const { writeTextFile } = await import('@tauri-apps/plugin-fs');
      
      const filePath = await save({
        defaultPath: defaultFilename,
        filters: filters || [{ name: 'Tous les fichiers', extensions: ['*'] }]
      });
      
      if (filePath) {
        await writeTextFile(filePath, content);
        return true;
      }
      return false; // L'utilisateur a annulé
    } catch (error) {
      console.error('Erreur lors de la sauvegarde Tauri:', error);
      throw error;
    }
  } else {
    // Mode navigateur - téléchargement classique
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
  if (isTauri()) {
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
      throw error;
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
  if (isTauri()) {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const { writeFile } = await import('@tauri-apps/plugin-fs');
      const { join } = await import('@tauri-apps/api/path');
      
      // Ouvrir un dialogue pour sélectionner un dossier
      const folderPath = await open({
        directory: true,
        multiple: false,
        title: 'Sélectionnez le dossier de destination'
      });
      
      if (folderPath && typeof folderPath === 'string') {
        // Sauvegarder chaque fichier dans le dossier
        for (const file of files) {
          const fullPath = await join(folderPath, file.filename);
          await writeFile(fullPath, file.data);
        }
        return true;
      }
      return false; // L'utilisateur a annulé
    } catch (error) {
      console.error('Erreur lors de la sauvegarde multiple Tauri:', error);
      throw error;
    }
  } else {
    // Mode navigateur - créer un ZIP et télécharger
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
