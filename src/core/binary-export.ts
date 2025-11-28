import type { ExportConfig, Frame, Matrix16x16 } from './types';
import { saveBinaryFilesToFolder } from '../utils/tauri-export';

/**
 * Binary Export - Reproduit EXACTEMENT la logique du code Python de preuve de concept
 * 
 * Le code Python fait :
 * 1. Lecture des lignes (avec option flip_y qui inverse l'ordre des lignes dans le bloc 8x8)
 * 2. Lecture des pixels par ligne (avec option flip_x qui inverse l'ordre des colonnes)
 * 3. Rotation circulaire des lignes (offset_val avec deque.rotate)
 * 4. Inversion de polarité (si inv_pol: 0 devient 1, 1 devient 0)
 * 5. Encodage en octet (avec bit_rev qui inverse l'ordre des bits)
 */

/**
 * Rotation circulaire d'un tableau (équivalent à deque.rotate en Python)
 * Python: deque.rotate(n) - rotation vers la droite si n > 0
 */
const rotateArray = <T>(arr: T[], offset: number): T[] => {
    if (arr.length === 0) return arr;
    const len = arr.length;
    // Normaliser l'offset pour qu'il soit positif et dans les limites
    const n = ((offset % len) + len) % len;
    if (n === 0) return [...arr];
    // Python's deque.rotate(n) moves n elements from the right to the left
    // rotate(1): [1,2,3,4] -> [4,1,2,3]
    return [...arr.slice(len - n), ...arr.slice(0, len - n)];
};

/**
 * Traite un bloc 8x8 - EXACTEMENT comme la fonction Python process_8x8_block
 */
const process8x8Block = (
    grid: Matrix16x16,
    startRow: number,
    startCol: number,
    config: ExportConfig
): number[] => {
    const { bitReversal, flipX, flipY, invertOutput, offsetY } = config;
    const blockBytes: number[] = [];

    /* Python:
        def process_8x8_block(start_row, start_col):
            block_bytes = []
            # Lecture brute (gestion Flip Y incluse ici)
            rows_range = range(start_row + 7, start_row - 1, -1) if flip_y else range(start_row, start_row + 8)
            
            raw_rows = []
            for r in rows_range:
                row_pixels = frame[r][start_col : start_col + 8]
                if flip_x: row_pixels = row_pixels[::-1]
                raw_rows.append(row_pixels)
    */

    // 1. Lecture des lignes (avec gestion Flip Y)
    // Si flipY: on lit de start_row+7 à start_row (inversé)
    // Sinon: on lit de start_row à start_row+7 (normal)
    const rawRows: number[][] = [];
    
    if (flipY) {
        // range(start_row + 7, start_row - 1, -1) -> [start_row+7, start_row+6, ..., start_row]
        for (let r = startRow + 7; r >= startRow; r--) {
            let rowPixels = grid[r].slice(startCol, startCol + 8);
            if (flipX) {
                rowPixels = [...rowPixels].reverse();
            }
            rawRows.push([...rowPixels]);
        }
    } else {
        // range(start_row, start_row + 8) -> [start_row, start_row+1, ..., start_row+7]
        for (let r = startRow; r < startRow + 8; r++) {
            let rowPixels = grid[r].slice(startCol, startCol + 8);
            if (flipX) {
                rowPixels = [...rowPixels].reverse();
            }
            rawRows.push([...rowPixels]);
        }
    }

    /* Python:
        # Correction Offset (Décalage Circulaire)
        dq_rows = deque(raw_rows)
        dq_rows.rotate(offset_val)
        shifted_rows = list(dq_rows)
    */
    
    // 2. Application de l'offset (décalage circulaire vertical)
    const shiftedRows = rotateArray(rawRows, offsetY);

    /* Python:
        # Encodage Byte
        for row_pixels in shifted_rows:
            if inv_pol: row_pixels = [0 if p else 1 for p in row_pixels]
            byte_val = 0
            for i, pixel in enumerate(row_pixels):
                if pixel:
                    shift = (7 - i) if bit_rev else i
                    byte_val |= (1 << shift)
            block_bytes.append(byte_val)
    */

    // 3. Encodage en octets
    for (const rowPixels of shiftedRows) {
        // Inversion de polarité si nécessaire
        const finalPixels = invertOutput
            ? rowPixels.map(p => (p ? 0 : 1))
            : rowPixels;

        let byteVal = 0;
        for (let i = 0; i < 8; i++) {
            if (finalPixels[i]) {
                // bit_rev: si True, i=0 -> bit 7, i=7 -> bit 0
                // si False, i=0 -> bit 0, i=7 -> bit 7
                const shift = bitReversal ? (7 - i) : i;
                byteVal |= (1 << shift);
            }
        }
        blockBytes.push(byteVal);
    }

    return blockBytes;
};

/**
 * Génère les fichiers binaires pour les 4 EEPROMs
 * @param frames - Les frames du projet
 * @param config - La configuration d'export
 * @param projectName - Le nom du projet (pour préfixer les fichiers)
 * @returns true si l'export a réussi, false sinon
 */
export const generateBinaryFiles = async (
    frames: Frame[], 
    config: ExportConfig,
    projectName: string = 'matrix_project'
): Promise<boolean> => {
    if (frames.length === 0) return false;

    const { loopSize } = config;
    const targetLoopSize = loopSize > 0 ? loopSize : 64;

    /* Python:
        # Création de la séquence finale répétée
        final_sequence = []
        user_frames_count = len(self.frames)
        
        for i in range(target_loop_size):
            frame_to_use = self.frames[i % user_frames_count]
            final_sequence.append(frame_to_use)
    */

    // Préparer les buffers pour chaque EEPROM
    const dataTL: number[] = [];
    const dataTR: number[] = [];
    const dataBL: number[] = [];
    const dataBR: number[] = [];

    // Génération avec bouclage (Pattern Repeating)
    for (let i = 0; i < targetLoopSize; i++) {
        const frame = frames[i % frames.length];
        const grid = frame.grid;

        /* Python:
            data_TL.extend(process_8x8_block(0, 0))
            data_TR.extend(process_8x8_block(0, 8))
            data_BL.extend(process_8x8_block(8, 0))
            data_BR.extend(process_8x8_block(8, 8))
        */

        // TL (Top-Left): lignes 0-7, colonnes 0-7
        dataTL.push(...process8x8Block(grid, 0, 0, config));
        // TR (Top-Right): lignes 0-7, colonnes 8-15
        dataTR.push(...process8x8Block(grid, 0, 8, config));
        // BL (Bottom-Left): lignes 8-15, colonnes 0-7
        dataBL.push(...process8x8Block(grid, 8, 0, config));
        // BR (Bottom-Right): lignes 8-15, colonnes 8-15
        dataBR.push(...process8x8Block(grid, 8, 8, config));
    }

    // Nettoyer le nom du projet pour les noms de fichiers
    const safeName = projectName.replace(/[^a-zA-Z0-9_-]/g, '_');

    // Préparer les fichiers à sauvegarder
    const files = [
        { filename: `${safeName}_TL.bin`, data: new Uint8Array(dataTL) },
        { filename: `${safeName}_TR.bin`, data: new Uint8Array(dataTR) },
        { filename: `${safeName}_BL.bin`, data: new Uint8Array(dataBL) },
        { filename: `${safeName}_BR.bin`, data: new Uint8Array(dataBR) },
    ];

    // Sauvegarder les fichiers (dialogue natif en Tauri, ZIP en web)
    const success = await saveBinaryFilesToFolder(files, `${safeName}_binaries`);
    
    // Log pour debug
    console.log('=== Export Debug ===');
    console.log('Project:', projectName);
    console.log('Frames:', frames.length);
    console.log('Config:', config);
    console.log('First frame top-left corner (0,0):', frames[0]?.grid[0][0]);
    console.log('First frame top-right corner (0,15):', frames[0]?.grid[0][15]);
    console.log('TL first 8 bytes:', dataTL.slice(0, 8).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
    console.log('TR first 8 bytes:', dataTR.slice(0, 8).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
    
    return success;
};