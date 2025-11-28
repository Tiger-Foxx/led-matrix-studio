import { GRID_SIZE, type Matrix16x16 } from './types';

export const createEmptyGrid = (): Matrix16x16 =>
    Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));

export const fillGrid = (): Matrix16x16 =>
    Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(1));

export const invertGrid = (grid: Matrix16x16): Matrix16x16 =>
    grid.map(row => row.map(pixel => (pixel === 1 ? 0 : 1)));

export const shiftGrid = (
    grid: Matrix16x16,
    dx: number,
    dy: number,
    wrap: boolean = false
): Matrix16x16 => {
    const newGrid = createEmptyGrid();

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            let newR = r - dy;
            let newC = c - dx;

            if (wrap) {
                newR = (newR + GRID_SIZE) % GRID_SIZE;
                newC = (newC + GRID_SIZE) % GRID_SIZE;
                newGrid[r][c] = grid[newR][newC];
            } else {
                if (newR >= 0 && newR < GRID_SIZE && newC >= 0 && newC < GRID_SIZE) {
                    newGrid[r][c] = grid[newR][newC];
                } else {
                    newGrid[r][c] = 0;
                }
            }
        }
    }
    return newGrid;
};

export const rotateGrid = (grid: Matrix16x16, clockwise: boolean = true): Matrix16x16 => {
    const newGrid = createEmptyGrid();
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (clockwise) {
                newGrid[c][GRID_SIZE - 1 - r] = grid[r][c];
            } else {
                newGrid[GRID_SIZE - 1 - c][r] = grid[r][c];
            }
        }
    }
    return newGrid;
};
