export type PixelState = 0 | 1;

// A single 8x8 matrix is a 2D array of 0s and 1s
export type Matrix8x8 = PixelState[][];

// The full 16x16 grid is composed of 4 quadrants (TL, TR, BL, BR)
// But for easier manipulation, we might want to treat it as a single 16x16 grid
// and split it only during export.
export type Matrix16x16 = PixelState[][];

export interface Frame {
    id: string;
    grid: Matrix16x16;
    duration: number; // in ms
}

export interface ExportConfig {
    bitReversal: boolean;   // D0 <-> D7
    flipX: boolean;         // Horizontal Mirror
    flipY: boolean;         // Vertical Mirror
    invertOutput: boolean;  // Active Low vs High
    offsetY: number;        // Circular shift correction
    loopSize: number;       // Target memory size (e.g. 64 frames)
}

export const GRID_SIZE = 16;
export const SUB_GRID_SIZE = 8;
