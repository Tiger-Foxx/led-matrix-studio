import React, { useCallback, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { GRID_SIZE, type PixelState } from '../core/types';

export const MatrixGrid: React.FC = () => {
    const { currentProject, currentFrameIndex, updateGrid, selectedTool } = useStore();
    const currentGrid = currentProject?.frames[currentFrameIndex]?.grid;
    const isDrawing = useRef(false);

    const handleDraw = useCallback((row: number, col: number) => {
        if (!currentGrid) return;
        const newGrid = currentGrid.map(r => [...r]);
        const newValue: PixelState = selectedTool === 'brush' ? 1 : 0;
        if (newGrid[row][col] !== newValue) {
            newGrid[row][col] = newValue;
            updateGrid(newGrid);
        }
    }, [currentGrid, selectedTool, updateGrid]);

    const handleMouseDown = (row: number, col: number) => {
        isDrawing.current = true;
        handleDraw(row, col);
    };

    const handleMouseEnter = (row: number, col: number) => {
        if (isDrawing.current) {
            handleDraw(row, col);
        }
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    if (!currentGrid) return null;

    return (
        <div 
            className="p-4 bg-[#1a1a1a] rounded-xl"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 0 0 1px #333' }}
        >
            <div
                className="grid gap-[2px] bg-[#0a0a0a] p-3 rounded-lg"
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
            >
                {currentGrid.map((row, rowIndex) =>
                    row.map((pixel, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                            onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                            className={`led-cell w-[22px] h-[22px] cursor-crosshair ${pixel === 1 ? 'led-on' : 'led-off'}`}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
