import React, { useCallback, useEffect, useRef } from 'react';
import { useStore, generateShape } from '../store/useStore';
import { GRID_SIZE, type PixelState } from '../core/types';

export const MatrixGrid: React.FC = () => {
    const { 
        currentProject, 
        currentFrameIndex, 
        updateGrid, 
        selectedTool, 
        blinkFrequency,
        pushToHistory 
    } = useStore();
    
    const currentGrid = currentProject?.frames[currentFrameIndex]?.grid;
    const isDrawing = useRef(false);

    const handleDraw = useCallback((row: number, col: number, isClick: boolean = false) => {
        if (!currentGrid) return;
        
        // If it's a shape tool, we only draw on click, not drag
        if (selectedTool !== 'brush' && selectedTool !== 'eraser') {
            if (!isClick) return;
            
            pushToHistory(); // Save state before applying shape
            
            const shapeGrid = generateShape(selectedTool);
            const newGrid = currentGrid.map(r => [...r]);
            
            // Center the shape on the clicked pixel
            const offsetX = col - 7;
            const offsetY = row - 7;
            
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (shapeGrid[r][c]) {
                        const targetR = r + offsetY;
                        const targetC = c + offsetX;
                        if (targetR >= 0 && targetR < GRID_SIZE && targetC >= 0 && targetC < GRID_SIZE) {
                            newGrid[targetR][targetC] = 1;
                        }
                    }
                }
            }
            updateGrid(newGrid);
            return;
        }

        // Brush / Eraser logic
        const newGrid = currentGrid.map(r => [...r]);
        const newValue: PixelState = selectedTool === 'brush' ? 1 : 0;
        
        if (newGrid[row][col] !== newValue) {
            newGrid[row][col] = newValue;
            updateGrid(newGrid);
        }
    }, [currentGrid, selectedTool, updateGrid, pushToHistory]);

    const handleMouseDown = (row: number, col: number) => {
        isDrawing.current = true;
        if (selectedTool === 'brush' || selectedTool === 'eraser') {
            pushToHistory(); // Save state before starting a stroke
        }
        handleDraw(row, col, true);
    };

    const handleMouseEnter = (row: number, col: number) => {
        if (isDrawing.current) {
            handleDraw(row, col, false);
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

    const blinkStyle = blinkFrequency > 0 ? {
        '--blink-duration': `${1 / blinkFrequency}s`
    } as React.CSSProperties : {};

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
                    row.map((pixel, colIndex) => {
                        const isBlinking = pixel === 1 && blinkFrequency > 0;
                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                                style={isBlinking ? blinkStyle : undefined}
                                className={`led-cell w-[22px] h-[22px] cursor-crosshair ${
                                    pixel === 1 ? 'led-on' : 'led-off'
                                } ${isBlinking ? 'led-blinking' : ''}`}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};
