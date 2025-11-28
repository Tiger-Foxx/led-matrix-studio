import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import type { ExportConfig, Frame, Matrix16x16, PixelState } from './types';



// Helper to rotate an array (circular shift)
const rotateArray = <T>(arr: T[], offset: number): T[] => {
    const len = arr.length;
    const n = ((offset % len) + len) % len; // Normalize offset
    return [...arr.slice(len - n), ...arr.slice(0, len - n)];
};

// Helper to process an 8x8 block
const process8x8Block = (
    grid: Matrix16x16,
    startRow: number,
    startCol: number,
    config: ExportConfig
): number[] => {
    const { bitReversal, flipX, flipY, invertOutput, offsetY } = config;
    const blockBytes: number[] = [];

    // 1. Extract raw rows (handling Flip Y)
    // If Flip Y is true, we read rows from bottom to top within the block
    const rowsRange = flipY
        ? Array.from({ length: 8 }, (_, i) => startRow + 7 - i)
        : Array.from({ length: 8 }, (_, i) => startRow + i);

    let rawRows: PixelState[][] = [];
    for (const r of rowsRange) {
        let rowPixels = grid[r].slice(startCol, startCol + 8);
        // Handle Flip X
        if (flipX) {
            rowPixels = rowPixels.reverse();
        }
        rawRows.push(rowPixels);
    }

    // 2. Apply Offset Y (Circular Shift)
    // In Python: deque.rotate(offset_val) -> positive moves right (or down in this context of rows)
    // We need to verify the direction. Python's deque.rotate(1) moves the last element to the front.
    // Our rotateArray implementation does the same.
    const shiftedRows = rotateArray(rawRows, offsetY);

    // 3. Encode to Byte
    for (const rowPixels of shiftedRows) {
        let byteVal = 0;
        // Apply Invert Output (Active Low vs High)
        // If invertOutput is true: 1 (ON) becomes 0, 0 (OFF) becomes 1.
        // BUT WAIT: The Python code says:
        // if inv_pol: row_pixels = [0 if p else 1 for p in row_pixels]
        // So if pixel is ON (1), it becomes 0. If OFF (0), it becomes 1.
        // Then it iterates: if pixel (which is now inverted) is true...
        // This seems slightly counter-intuitive in the Python loop, let's re-read Python carefully.

        /* Python:
           if inv_pol: row_pixels = [0 if p else 1 for p in row_pixels]
           byte_val = 0
           for i, pixel in enumerate(row_pixels):
               if pixel: ...
        */
        // So if inv_pol is true, and we have an ON pixel (1), it becomes 0. The loop sees 0 and does nothing.
        // So ON pixels result in 0 bits. OFF pixels result in 1 bits.
        // This matches "Active Low" (0 = ON).

        const finalPixels = invertOutput
            ? rowPixels.map(p => (p ? 0 : 1))
            : rowPixels;

        for (let i = 0; i < 8; i++) {
            if (finalPixels[i]) {
                // Bit Reversal: D0 <-> D7
                // If bitReversal is true, index 0 maps to bit 7 (1 << 7)
                // If false, index 0 maps to bit 0 (1 << 0) -- WAIT, usually index 0 is MSB or LSB?
                // Python: shift = (7 - i) if bit_rev else i
                // If bit_rev is True: i=0 -> shift=7. i=7 -> shift=0.
                // If bit_rev is False: i=0 -> shift=0. i=7 -> shift=7.
                const shift = bitReversal ? (7 - i) : i;
                byteVal |= (1 << shift);
            }
        }
        blockBytes.push(byteVal);
    }

    return blockBytes;
};

export const generateBinaryFiles = async (frames: Frame[], config: ExportConfig) => {
    if (frames.length === 0) return;

    const { loopSize } = config;
    const targetLoopSize = loopSize > 0 ? loopSize : 64;

    // 1. Prepare Buffers
    const dataTL: number[] = [];
    const dataTR: number[] = [];
    const dataBL: number[] = [];
    const dataBR: number[] = [];

    // 2. Loop Filling (Pattern Repeating)
    for (let i = 0; i < targetLoopSize; i++) {
        const frame = frames[i % frames.length];
        const grid = frame.grid;

        // TL: 0,0
        dataTL.push(...process8x8Block(grid, 0, 0, config));
        // TR: 0,8
        dataTR.push(...process8x8Block(grid, 0, 8, config));
        // BL: 8,0
        dataBL.push(...process8x8Block(grid, 8, 0, config));
        // BR: 8,8
        dataBR.push(...process8x8Block(grid, 8, 8, config));
    }

    // 3. Create Zip
    const zip = new JSZip();
    zip.file("eeprom_TL.bin", new Uint8Array(dataTL));
    zip.file("eeprom_TR.bin", new Uint8Array(dataTR));
    zip.file("eeprom_BL.bin", new Uint8Array(dataBL));
    zip.file("eeprom_BR.bin", new Uint8Array(dataBR));

    // 4. Download
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "matrix_project_binaries.zip");
};
