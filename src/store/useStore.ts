import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type ExportConfig, type Frame, GRID_SIZE, type Matrix16x16 } from '../core/types';
import { v4 as uuidv4 } from 'uuid';

// Shape types
export type ShapeType = 'circle' | 'square' | 'diamond' | 'cross' | 'heart' | 'arrow_up' | 'arrow_down' | 'checker';

// Project structure
export interface Project {
    id: string;
    name: string;
    createdAt: number;
    updatedAt: number;
    frames: Frame[];
    exportConfig: ExportConfig;
    playbackSpeed: number;
}

interface AppState {
    // Current Project
    currentProject: Project | null;
    
    // Project List (Recent)
    recentProjects: Project[];
    
    // Runtime state
    currentFrameIndex: number;
    isPlaying: boolean;
    selectedTool: 'brush' | 'eraser';
    blinkFrequency: number;
    timelineHeight: number;

    // Project Actions
    createNewProject: (name: string) => void;
    saveCurrentProject: () => void;
    loadProject: (projectId: string) => void;
    deleteProject: (projectId: string) => void;
    renameProject: (name: string) => void;
    exportProjectAsJson: () => string;
    importProjectFromJson: (json: string) => boolean;

    // Frame Actions
    addFrame: () => void;
    duplicateFrame: () => void;
    deleteFrame: () => void;
    setCurrentFrameIndex: (index: number) => void;
    updateGrid: (grid: Matrix16x16) => void;
    moveFrame: (fromIndex: number, toIndex: number) => void;
    clearCurrentFrame: () => void;
    fillCurrentFrame: () => void;
    invertCurrentFrame: () => void;
    applyShape: (shape: ShapeType) => void;
    shiftFrame: (direction: 'up' | 'down' | 'left' | 'right') => void;
    rotateFrame: (direction: 'cw' | 'ccw') => void;
    flipFrameHorizontal: () => void;
    flipFrameVertical: () => void;

    // Playback
    togglePlayback: () => void;
    setPlaybackSpeed: (speed: number) => void;
    setBlinkFrequency: (freq: number) => void;

    // Config
    updateExportConfig: (config: Partial<ExportConfig>) => void;

    // Tools
    setSelectedTool: (tool: 'brush' | 'eraser') => void;
    
    // UI
    setTimelineHeight: (height: number) => void;
}

const createEmptyGrid = (): Matrix16x16 =>
    Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0)) as Matrix16x16;

const createFilledGrid = (): Matrix16x16 =>
    Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(1)) as Matrix16x16;

// Shape generators
const generateShape = (shape: string): Matrix16x16 => {
    const grid = createEmptyGrid();
    const cx = 7.5, cy = 7.5;
    
    switch (shape) {
        case 'circle':
            for (let r = 0; r < 16; r++) {
                for (let c = 0; c < 16; c++) {
                    const dist = Math.sqrt((r - cy) ** 2 + (c - cx) ** 2);
                    if (dist >= 5 && dist <= 7) grid[r][c] = 1;
                }
            }
            break;
        case 'square':
            for (let i = 2; i < 14; i++) {
                grid[2][i] = 1; grid[13][i] = 1;
                grid[i][2] = 1; grid[i][13] = 1;
            }
            break;
        case 'diamond':
            for (let i = 0; i < 8; i++) {
                grid[i][7 - i] = 1; grid[i][8 + i] = 1;
                grid[15 - i][7 - i] = 1; grid[15 - i][8 + i] = 1;
            }
            break;
        case 'cross':
            for (let i = 0; i < 16; i++) {
                grid[7][i] = 1; grid[8][i] = 1;
                grid[i][7] = 1; grid[i][8] = 1;
            }
            break;
        case 'heart':
            const heartPattern = [
                "  ****  ****  ",
                " ****** ****** ",
                "***************",
                "***************",
                "***************",
                " ************* ",
                "  ***********  ",
                "   *********   ",
                "    *******    ",
                "     *****     ",
                "      ***      ",
                "       *       ",
            ];
            heartPattern.forEach((row, r) => {
                for (let c = 0; c < row.length && c < 16; c++) {
                    if (row[c] === '*') grid[r + 2][c + 1] = 1;
                }
            });
            break;
        case 'arrow_up':
            for (let i = 0; i < 8; i++) {
                grid[i][7] = 1; grid[i][8] = 1;
                grid[7 - i][7 - i] = 1; grid[7 - i][8 + i] = 1;
            }
            for (let i = 8; i < 16; i++) { grid[i][7] = 1; grid[i][8] = 1; }
            break;
        case 'arrow_down':
            for (let i = 0; i < 8; i++) {
                grid[15 - i][7] = 1; grid[15 - i][8] = 1;
                grid[8 + i][7 - i] = 1; grid[8 + i][8 + i] = 1;
            }
            for (let i = 0; i < 8; i++) { grid[i][7] = 1; grid[i][8] = 1; }
            break;
        case 'checker':
            for (let r = 0; r < 16; r++) {
                for (let c = 0; c < 16; c++) {
                    if ((r + c) % 2 === 0) grid[r][c] = 1;
                }
            }
            break;
    }
    return grid;
};

const DEFAULT_CONFIG: ExportConfig = {
    bitReversal: true,
    flipX: false,
    flipY: false,
    invertOutput: true,
    offsetY: -1,
    loopSize: 64,
};

const createDefaultProject = (name: string): Project => ({
    id: uuidv4(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    frames: [{ id: uuidv4(), grid: createEmptyGrid(), duration: 200 }],
    exportConfig: DEFAULT_CONFIG,
    playbackSpeed: 200,
});

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            currentProject: null,
            recentProjects: [],
            currentFrameIndex: 0,
            isPlaying: false,
            selectedTool: 'brush',
            blinkFrequency: 0,
            timelineHeight: 180,

            // === PROJECT ACTIONS ===
            createNewProject: (name) => {
                const project = createDefaultProject(name);
                set((state) => ({
                    currentProject: project,
                    currentFrameIndex: 0,
                    isPlaying: false,
                    recentProjects: [project, ...state.recentProjects.filter(p => p.id !== project.id)].slice(0, 10),
                }));
            },

            saveCurrentProject: () => {
                const { currentProject, recentProjects } = get();
                if (!currentProject) return;
                
                const updated = { ...currentProject, updatedAt: Date.now() };
                set({
                    currentProject: updated,
                    recentProjects: [updated, ...recentProjects.filter(p => p.id !== updated.id)].slice(0, 10),
                });
            },

            loadProject: (projectId) => {
                const { recentProjects } = get();
                const project = recentProjects.find(p => p.id === projectId);
                if (project) {
                    set({
                        currentProject: { ...project },
                        currentFrameIndex: 0,
                        isPlaying: false,
                    });
                }
            },

            deleteProject: (projectId) => {
                set((state) => ({
                    recentProjects: state.recentProjects.filter(p => p.id !== projectId),
                    currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
                }));
            },

            renameProject: (name) => {
                set((state) => {
                    if (!state.currentProject) return state;
                    const updated = { ...state.currentProject, name, updatedAt: Date.now() };
                    return {
                        currentProject: updated,
                        recentProjects: state.recentProjects.map(p => p.id === updated.id ? updated : p),
                    };
                });
            },

            exportProjectAsJson: () => {
                const { currentProject } = get();
                if (!currentProject) return '{}';
                return JSON.stringify(currentProject, null, 2);
            },

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
                        set((state) => ({
                            currentProject: project,
                            currentFrameIndex: 0,
                            isPlaying: false,
                            recentProjects: [project, ...state.recentProjects.filter(p => p.id !== project.id)].slice(0, 10),
                        }));
                        return true;
                    }
                } catch (e) {
                    console.error('Failed to import project:', e);
                }
                return false;
            },

            // === FRAME ACTIONS ===
            addFrame: () => set((state) => {
                if (!state.currentProject) return state;
                const newFrame = { id: uuidv4(), grid: createEmptyGrid(), duration: state.currentProject.playbackSpeed };
                const newFrames = [...state.currentProject.frames, newFrame];
                return {
                    currentProject: { ...state.currentProject, frames: newFrames, updatedAt: Date.now() },
                    currentFrameIndex: newFrames.length - 1,
                };
            }),

            duplicateFrame: () => set((state) => {
                if (!state.currentProject) return state;
                const currentFrame = state.currentProject.frames[state.currentFrameIndex];
                const newGrid = currentFrame.grid.map(row => [...row]) as Matrix16x16;
                const newFrame = { id: uuidv4(), grid: newGrid, duration: currentFrame.duration };
                const newFrames = [...state.currentProject.frames];
                newFrames.splice(state.currentFrameIndex + 1, 0, newFrame);
                return {
                    currentProject: { ...state.currentProject, frames: newFrames, updatedAt: Date.now() },
                    currentFrameIndex: state.currentFrameIndex + 1,
                };
            }),

            deleteFrame: () => set((state) => {
                if (!state.currentProject || state.currentProject.frames.length <= 1) return state;
                const newFrames = state.currentProject.frames.filter((_, i) => i !== state.currentFrameIndex);
                const newIndex = Math.min(state.currentFrameIndex, newFrames.length - 1);
                return {
                    currentProject: { ...state.currentProject, frames: newFrames, updatedAt: Date.now() },
                    currentFrameIndex: newIndex,
                };
            }),

            setCurrentFrameIndex: (index) => set({ currentFrameIndex: index }),

            updateGrid: (grid) => set((state) => {
                if (!state.currentProject) return state;
                const newFrames = [...state.currentProject.frames];
                newFrames[state.currentFrameIndex] = { ...newFrames[state.currentFrameIndex], grid };
                return {
                    currentProject: { ...state.currentProject, frames: newFrames },
                };
            }),

            moveFrame: (fromIndex, toIndex) => set((state) => {
                if (!state.currentProject) return state;
                const newFrames = [...state.currentProject.frames];
                const [movedFrame] = newFrames.splice(fromIndex, 1);
                newFrames.splice(toIndex, 0, movedFrame);
                
                let newCurrentIndex = state.currentFrameIndex;
                if (state.currentFrameIndex === fromIndex) {
                    newCurrentIndex = toIndex;
                } else if (state.currentFrameIndex > fromIndex && state.currentFrameIndex <= toIndex) {
                    newCurrentIndex--;
                } else if (state.currentFrameIndex < fromIndex && state.currentFrameIndex >= toIndex) {
                    newCurrentIndex++;
                }
                
                return {
                    currentProject: { ...state.currentProject, frames: newFrames, updatedAt: Date.now() },
                    currentFrameIndex: newCurrentIndex,
                };
            }),

            clearCurrentFrame: () => set((state) => {
                if (!state.currentProject) return state;
                const newFrames = [...state.currentProject.frames];
                newFrames[state.currentFrameIndex] = { ...newFrames[state.currentFrameIndex], grid: createEmptyGrid() };
                return { currentProject: { ...state.currentProject, frames: newFrames } };
            }),

            fillCurrentFrame: () => set((state) => {
                if (!state.currentProject) return state;
                const newFrames = [...state.currentProject.frames];
                newFrames[state.currentFrameIndex] = { ...newFrames[state.currentFrameIndex], grid: createFilledGrid() };
                return { currentProject: { ...state.currentProject, frames: newFrames } };
            }),

            invertCurrentFrame: () => set((state) => {
                if (!state.currentProject) return state;
                const currentGrid = state.currentProject.frames[state.currentFrameIndex].grid;
                const invertedGrid = currentGrid.map(row => row.map(p => (p ? 0 : 1))) as Matrix16x16;
                const newFrames = [...state.currentProject.frames];
                newFrames[state.currentFrameIndex] = { ...newFrames[state.currentFrameIndex], grid: invertedGrid };
                return { currentProject: { ...state.currentProject, frames: newFrames } };
            }),

            applyShape: (shape) => set((state) => {
                if (!state.currentProject) return state;
                const newFrames = [...state.currentProject.frames];
                newFrames[state.currentFrameIndex] = { ...newFrames[state.currentFrameIndex], grid: generateShape(shape) };
                return { currentProject: { ...state.currentProject, frames: newFrames } };
            }),

            shiftFrame: (direction) => set((state) => {
                if (!state.currentProject) return state;
                const grid = state.currentProject.frames[state.currentFrameIndex].grid;
                const newGrid = createEmptyGrid();
                
                const shifts: Record<string, [number, number]> = {
                    up: [0, -1],
                    down: [0, 1],
                    left: [-1, 0],
                    right: [1, 0],
                };
                const [dx, dy] = shifts[direction] || [0, 0];
                
                for (let r = 0; r < GRID_SIZE; r++) {
                    for (let c = 0; c < GRID_SIZE; c++) {
                        const srcR = r - dy, srcC = c - dx;
                        if (srcR >= 0 && srcR < GRID_SIZE && srcC >= 0 && srcC < GRID_SIZE) {
                            newGrid[r][c] = grid[srcR][srcC];
                        }
                    }
                }
                const newFrames = [...state.currentProject.frames];
                newFrames[state.currentFrameIndex] = { ...newFrames[state.currentFrameIndex], grid: newGrid };
                return { currentProject: { ...state.currentProject, frames: newFrames } };
            }),

            rotateFrame: (direction) => set((state) => {
                if (!state.currentProject) return state;
                const grid = state.currentProject.frames[state.currentFrameIndex].grid;
                const newGrid = createEmptyGrid();
                const clockwise = direction === 'cw';
                
                for (let r = 0; r < GRID_SIZE; r++) {
                    for (let c = 0; c < GRID_SIZE; c++) {
                        if (clockwise) {
                            newGrid[c][GRID_SIZE - 1 - r] = grid[r][c];
                        } else {
                            newGrid[GRID_SIZE - 1 - c][r] = grid[r][c];
                        }
                    }
                }
                const newFrames = [...state.currentProject.frames];
                newFrames[state.currentFrameIndex] = { ...newFrames[state.currentFrameIndex], grid: newGrid };
                return { currentProject: { ...state.currentProject, frames: newFrames } };
            }),

            flipFrameHorizontal: () => set((state) => {
                if (!state.currentProject) return state;
                const grid = state.currentProject.frames[state.currentFrameIndex].grid;
                const newGrid = grid.map(row => [...row].reverse()) as Matrix16x16;
                const newFrames = [...state.currentProject.frames];
                newFrames[state.currentFrameIndex] = { ...newFrames[state.currentFrameIndex], grid: newGrid };
                return { currentProject: { ...state.currentProject, frames: newFrames } };
            }),

            flipFrameVertical: () => set((state) => {
                if (!state.currentProject) return state;
                const grid = state.currentProject.frames[state.currentFrameIndex].grid;
                const newGrid = [...grid].reverse().map(row => [...row]) as Matrix16x16;
                const newFrames = [...state.currentProject.frames];
                newFrames[state.currentFrameIndex] = { ...newFrames[state.currentFrameIndex], grid: newGrid };
                return { currentProject: { ...state.currentProject, frames: newFrames } };
            }),

            // === PLAYBACK ===
            togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),

            setPlaybackSpeed: (speed) => set((state) => {
                if (!state.currentProject) return state;
                return {
                    currentProject: { ...state.currentProject, playbackSpeed: speed },
                };
            }),

            setBlinkFrequency: (freq) => set({ blinkFrequency: freq }),

            // === CONFIG ===
            updateExportConfig: (config) => set((state) => {
                if (!state.currentProject) return state;
                return {
                    currentProject: {
                        ...state.currentProject,
                        exportConfig: { ...state.currentProject.exportConfig, ...config },
                        updatedAt: Date.now(),
                    },
                };
            }),

            // === TOOLS ===
            setSelectedTool: (tool) => set({ selectedTool: tool }),
            
            // === UI ===
            setTimelineHeight: (height) => set({ timelineHeight: Math.max(100, Math.min(400, height)) }),
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
